#!/usr/bin/env node
'use strict';

/**
 * Backfills the `productCode` field on live DB products that currently have
 * none, using the codes recovered by name-matching against the "new
 * products" listing sheets (backend/scripts/sheet-code-recovery-report.json
 * -> recoverable[], produced by backend/scripts/analyze-sheet-code-recovery.js).
 *
 * Only ever SETS productCode; never touches images or any other field.
 * Skips (does not overwrite) any product whose productCode is already
 * non-blank at apply time, even if the dump used to build the report is stale.
 *
 * Safety:
 *   - Dry-run by default (reports what WOULD change, writes nothing).
 *   - Pass --commit to actually apply the changes.
 *   - Before any write, downloads a pre-update backup of the affected
 *     products' current productCode field into backend/backups/.
 *
 * Requires: deploy/.env.deploy
 * Run with:
 *   node deploy/apply-recovered-product-codes.js            (dry run)
 *   node deploy/apply-recovered-product-codes.js --commit    (writes to live DB)
 */

const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

loadEnv(path.join(__dirname, '.env.deploy'));

const COMMIT = process.argv.includes('--commit');
const REMOTE_BACKUP_NAME = 'pre-productcode-backup.tmp.json';
const REMOTE_PAYLOAD_NAME = 'productcode-recovery-payload.tmp.json';

function main() {
  const host = required('VPS_HOST');
  const user = required('VPS_USER');
  const keyPath = (process.env.VPS_SSH_KEY_PATH || '').trim().replace(/\\/g, '/');
  const password = (process.env.vps_pass || '').trim();
  const appPath = required('VPS_APP_PATH');
  const remoteBackendPath = `${appPath}/backend`;

  const reportArg = process.argv.find((a) => a.startsWith('--report='));
  const reportPath = reportArg
    ? path.resolve(reportArg.slice('--report='.length))
    : path.join(__dirname, '../backend/scripts/sheet-code-recovery-report.json');
  if (!fs.existsSync(reportPath)) {
    console.error(`\nReport not found: ${reportPath}`);
    console.error('   Run node backend/scripts/analyze-sheet-code-recovery.js first, or pass --report=<path> to a JSON file shaped { recoverable: [{ productId, codeFoundInSheet }] }.\n');
    process.exit(1);
  }
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const payload = report.recoverable.map((r) => ({ productId: r.productId, productCode: r.codeFoundInSheet }));

  if (payload.length === 0) {
    console.log('Nothing to recover — report has no recoverable items.');
    return;
  }

  console.log(`\nMode: ${COMMIT ? 'COMMIT (will write to live DB)' : 'DRY RUN (no writes)'}`);
  console.log(`Products to backfill productCode for: ${payload.length}\n`);

  // ── Step 1: backup current productCode field for the affected products ────
  console.log('Fetching pre-update backup snapshot from live DB...');
  const productIds = payload.map((p) => p.productId);
  const backupQuery = `
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  const schema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('BackupDump', schema);
  const ids = ${JSON.stringify(productIds)};
  const docs = await Product.find({ productId: { $in: ids } })
    .select('productId name category productCode')
    .lean();
  fs.writeFileSync('${REMOTE_BACKUP_NAME}', JSON.stringify(docs));
  console.log('BACKUP_WROTE', docs.length, 'of', ids.length);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
`.trim();

  if (!runRemoteScript(host, user, keyPath, password, remoteBackendPath, backupQuery)) {
    console.error('\nBackup step failed. Aborting before touching any productCode.\n');
    process.exit(1);
  }

  const backupDir = path.join(__dirname, '../backend/backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const localBackupPath = path.join(backupDir, `PROD_products_pre_productcode_recovery_${stamp}.json`);
  const remoteBackupPath = `${remoteBackendPath}/${REMOTE_BACKUP_NAME}`;

  if (!downloadViaSftp(host, user, keyPath, password, remoteBackupPath, localBackupPath)) {
    console.error('\nFailed to download backup snapshot. Aborting before touching any productCode.\n');
    process.exit(1);
  }
  cleanupRemoteFile(host, user, keyPath, password, remoteBackupPath);
  console.log(`Backup saved: ${localBackupPath}\n`);

  // ── Step 2: upload the recovery payload ────────────────────────────────────
  console.log('Uploading productCode recovery payload...');
  const localPayloadPath = path.join(__dirname, `productcode-recovery-payload-${stamp}.tmp.json`);
  fs.writeFileSync(localPayloadPath, JSON.stringify(payload));
  const remotePayloadPath = `${remoteBackendPath}/${REMOTE_PAYLOAD_NAME}`;
  const uploaded = uploadViaSftp(host, user, keyPath, password, localPayloadPath, remotePayloadPath);
  fs.unlinkSync(localPayloadPath);
  if (!uploaded) {
    console.error('\nUpload failed. Aborting.\n');
    process.exit(1);
  }

  // ── Step 3: apply (or dry-run report) ──────────────────────────────────────
  console.log(`\nRunning ${COMMIT ? 'update' : 'dry-run'} on live DB...\n`);
  const applyQuery = `
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
const COMMIT = ${COMMIT ? 'true' : 'false'};
(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  const schema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('ProductCodeRecoveryDump', schema);
  const payload = JSON.parse(fs.readFileSync('${REMOTE_PAYLOAD_NAME}', 'utf8'));

  let notFound = 0, alreadyHasCode = 0, updated = 0;
  const notFoundIds = [];
  const alreadyHasCodeIds = [];

  for (const item of payload) {
    const doc = await Product.findOne({ productId: item.productId }).select('productId productCode').lean();
    if (!doc) { notFound++; notFoundIds.push(item.productId); continue; }
    if ((doc.productCode || '').trim()) { alreadyHasCode++; alreadyHasCodeIds.push(item.productId); continue; }

    updated++;
    if (updated <= 15) {
      console.log(\`  \${item.productId}: (blank) -> \${item.productCode}\`);
    }

    if (COMMIT) {
      await Product.updateOne({ productId: item.productId }, { \$set: { productCode: item.productCode } });
    }
  }

  console.log('');
  console.log('Total in payload      :', payload.length);
  console.log('Not found in DB       :', notFound);
  console.log('Already has a code    :', alreadyHasCode);
  console.log(COMMIT ? 'Updated               :' : 'Would update          :', updated);
  if (notFoundIds.length) console.log('Missing productIds    :', notFoundIds.join(', '));
  if (alreadyHasCodeIds.length) console.log('Already-coded productIds:', alreadyHasCodeIds.join(', '));

  fs.unlinkSync('${REMOTE_PAYLOAD_NAME}');
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
`.trim();

  if (!runRemoteScript(host, user, keyPath, password, remoteBackendPath, applyQuery)) {
    console.error('\nApply step failed.\n');
    process.exit(1);
  }

  console.log(COMMIT
    ? '\nDone. Live DB updated.\n'
    : '\nDry run complete. No changes were written. Re-run with --commit to apply.\n');
}

// ── SSH runners ─────────────────────────────────────────────────────────────

function sshEnv(keyPath, password) {
  const env = { ...process.env };
  if (keyPath && fs.existsSync(keyPath)) {
    env.SSH_KEY_PATH = keyPath;
  } else if (password) {
    env.SSH_PASS = password;
  } else {
    console.error('No SSH key or password configured. Set VPS_SSH_KEY_PATH or vps_pass in .env.deploy');
    return null;
  }
  return env;
}

function runRemoteScript(host, user, keyPath, password, remoteBackendPath, nodeScript) {
  const pythonHelper = path.join(__dirname, 'ssh-run.py');
  const env = sshEnv(keyPath, password);
  if (!env) return false;

  const encoded = Buffer.from(nodeScript, 'utf8').toString('base64');
  const bashScript = `
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
set -e
cd ${remoteBackendPath}
echo ${encoded} | base64 -d > ./run-query.tmp.js
node ./run-query.tmp.js
rm -f ./run-query.tmp.js
`.trim();

  const result = spawnSync('python', [pythonHelper, host, user], {
    input: bashScript,
    stdio: ['pipe', 'inherit', 'inherit'],
    env,
  });

  if (result.error) {
    console.error('Failed to start Python SSH helper:', result.error.message);
    return false;
  }
  return result.status === 0;
}

function downloadViaSftp(host, user, keyPath, password, remotePath, localPath) {
  const pythonHelper = path.join(__dirname, 'sftp-get.py');
  const env = sshEnv(keyPath, password);
  if (!env) return false;

  const result = spawnSync('python', [pythonHelper, host, user, remotePath, localPath], {
    stdio: ['ignore', 'inherit', 'inherit'],
    env,
  });
  if (result.error) {
    console.error('Failed to start Python SFTP helper:', result.error.message);
    return false;
  }
  return result.status === 0;
}

function uploadViaSftp(host, user, keyPath, password, localPath, remotePath) {
  const pythonHelper = path.join(__dirname, 'sftp-put.py');
  const env = sshEnv(keyPath, password);
  if (!env) return false;

  const result = spawnSync('python', [pythonHelper, host, user, localPath, remotePath], {
    stdio: ['ignore', 'inherit', 'inherit'],
    env,
  });
  if (result.error) {
    console.error('Failed to start Python SFTP helper:', result.error.message);
    return false;
  }
  return result.status === 0;
}

function cleanupRemoteFile(host, user, keyPath, password, remotePath) {
  const pythonHelper = path.join(__dirname, 'ssh-run.py');
  const env = sshEnv(keyPath, password);
  if (!env) return;
  spawnSync('python', [pythonHelper, host, user], {
    input: `rm -f ${remotePath}`,
    stdio: ['pipe', 'inherit', 'inherit'],
    env,
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function required(key) {
  const val = process.env[key];
  if (!val || !val.trim()) {
    throw new Error(`Missing required deploy variable: ${key}\n   Set it in deploy/.env.deploy`);
  }
  return val.trim();
}

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`\nCredentials file not found: ${filePath}`);
    console.error('   Copy deploy/.env.deploy.example -> deploy/.env.deploy and fill in your values.\n');
    process.exit(1);
  }
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  }
}

main();
