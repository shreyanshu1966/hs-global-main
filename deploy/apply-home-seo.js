#!/usr/bin/env node
'use strict';

/**
 * Applies the new homepage (path '/') SEO title/description/keywords to the
 * LIVE production DB on the VPS.
 *
 * Safety:
 *   - Dry-run by default (reports current vs new values, writes nothing).
 *   - Pass --commit to actually apply the change.
 *   - Before any write, downloads a pre-update backup of the current
 *     pageseos doc for path '/' into backend/backups/.
 *
 * Requires: deploy/.env.deploy
 * Run with:
 *   node deploy/apply-home-seo.js            (dry run)
 *   node deploy/apply-home-seo.js --commit   (writes to live DB)
 */

const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

loadEnv(path.join(__dirname, '.env.deploy'));

const COMMIT = process.argv.includes('--commit');
const REMOTE_BACKUP_NAME = 'pre-home-seo-fix-backup.tmp.json';

const NEW_TITLE = 'HS Global Export : Luxury Furniture & Semi Precious Stone Slabs | Bespoke Interior Products';
const NEW_DESCRIPTION = 'HS Global Export specializes in bespoke furniture, marble furniture, leather furniture, antique wooden furniture and semi precious stone slabs for the USA, UK and worldwide.';
const NEW_KEYWORDS = [
  'HS Global Export', 'Luxury Furniture', 'Bespoke Furniture', 'Luxury Home Furniture',
  'Bespoke Interior Design', 'Semi Precious Stone Slabs', 'Agate Slabs', 'Gemstone Slabs',
  'Furniture Exporter', 'Marble Furniture Manufacturer', 'Luxury Furniture Manufacturer',
  'Luxury Furniture Exporter', 'Natural Stone Exporter', 'USA Furniture Supplier',
  'UK Furniture Supplier', 'Global Furniture Exporter in USA', 'United States', 'UK',
  'United Kingdom', 'Europe', 'Australia', 'Saudi Arabia', 'Dubai', 'UAE', 'Netherlands',
  'Canada', 'Singapore', 'South Africa', 'Global Exporter',
];

function main() {
  const host = required('VPS_HOST');
  const user = required('VPS_USER');
  const keyPath = (process.env.VPS_SSH_KEY_PATH || '').trim().replace(/\\/g, '/');
  const password = (process.env.vps_pass || '').trim();
  const appPath = required('VPS_APP_PATH');
  const remoteBackendPath = `${appPath}/backend`;

  console.log(`\nMode: ${COMMIT ? 'COMMIT (will write to live DB)' : 'DRY RUN (no writes)'}\n`);

  // ── Step 1: backup current doc ──────────────────────────────────────────
  console.log('Fetching pre-update backup snapshot of homepage PageSeo doc from live DB...');
  const backupQuery = `
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  const schema = new mongoose.Schema({}, { strict: false, collection: 'pageseos' });
  const PageSeo = mongoose.model('BackupDump', schema);
  const doc = await PageSeo.findOne({ path: '/' }).lean();
  if (!doc) { console.error('NO_DOC_FOUND'); process.exit(1); }
  fs.writeFileSync('${REMOTE_BACKUP_NAME}', JSON.stringify(doc, null, 2));
  console.log('BACKUP_WROTE');
  console.log('current title:', doc.title);
  console.log('current description:', doc.description);
  console.log('current keywords:', (doc.keywords || []).join(', '));
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
`.trim();

  if (!runRemoteScript(host, user, keyPath, password, remoteBackendPath, backupQuery)) {
    console.error('\nBackup step failed. Aborting before touching anything.\n');
    process.exit(1);
  }

  const backupDir = path.join(__dirname, '../backend/backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const localBackupPath = path.join(backupDir, `PROD_home_seo_pre_fix_${stamp}.json`);
  const remoteBackupPath = `${remoteBackendPath}/${REMOTE_BACKUP_NAME}`;

  if (!downloadViaSftp(host, user, keyPath, password, remoteBackupPath, localBackupPath)) {
    console.error('\nFailed to download backup snapshot. Aborting before touching anything.\n');
    process.exit(1);
  }
  cleanupRemoteFile(host, user, keyPath, password, remoteBackupPath);
  console.log(`Backup saved locally: ${localBackupPath}\n`);

  // ── Step 2: apply (or dry-run report) ───────────────────────────────────
  console.log(`Running ${COMMIT ? 'update' : 'dry-run'} on live DB...\n`);
  const applyQuery = `
const mongoose = require('mongoose');
require('dotenv').config();
const COMMIT = ${COMMIT ? 'true' : 'false'};
const NEW_TITLE = ${JSON.stringify(NEW_TITLE)};
const NEW_DESCRIPTION = ${JSON.stringify(NEW_DESCRIPTION)};
const NEW_KEYWORDS = ${JSON.stringify(NEW_KEYWORDS)};
(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  const schema = new mongoose.Schema({}, { strict: false, collection: 'pageseos' });
  const PageSeo = mongoose.model('HomeSeoFixDump', schema);

  console.log('New title:', NEW_TITLE);
  console.log('New description:', NEW_DESCRIPTION);
  console.log('New keywords:', NEW_KEYWORDS.join(', '));

  if (COMMIT) {
    const r = await PageSeo.updateOne(
      { path: '/' },
      { \$set: { title: NEW_TITLE, description: NEW_DESCRIPTION, keywords: NEW_KEYWORDS } }
    );
    console.log('Update applied, modifiedCount:', r.modifiedCount);
  } else {
    console.log('\\n[dry run] Would set the above title/description/keywords on path \\'/\\'');
  }
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

// ── SSH runners (mirrors deploy/apply-broken-images-fix.js) ────────────────

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

// ── Helpers ──────────────────────────────────────────────────────────────

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
