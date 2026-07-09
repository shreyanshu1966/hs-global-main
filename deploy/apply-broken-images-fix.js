#!/usr/bin/env node
'use strict';

/**
 * Applies the broken-image fix to the live production DB in three parts:
 *   1. reupload   - backend/scripts/broken-images-fix-payload.json (from
 *                   reupload-broken-images.js --live): overwrites
 *                   image/images/sortedImages with the freshly uploaded set.
 *   2. stripSafe  - backend/scripts/broken-images-fix-plan.json -> stripOnly[]
 *                   where remainingAfterStrip > 0: removes only the specific
 *                   dead URLs, keeps every still-working image.
 *   3. stripZero  - backend/scripts/broken-images-fix-plan.json -> stripOnly[]
 *                   where wouldHaveZeroImages: removes the dead URLs AND sets
 *                   status='draft', available=false so the now-imageless
 *                   product doesn't show live on the storefront.
 *
 * Safety:
 *   - Dry-run by default (reports what WOULD change, writes nothing).
 *   - Pass --commit to actually apply the changes.
 *   - Before any write, downloads a pre-update backup of every affected
 *     product's current image/status/available fields into backend/backups/.
 *
 * Requires: deploy/.env.deploy
 * Run with:
 *   node deploy/apply-broken-images-fix.js            (dry run)
 *   node deploy/apply-broken-images-fix.js --commit    (writes to live DB)
 */

const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

loadEnv(path.join(__dirname, '.env.deploy'));

const COMMIT = process.argv.includes('--commit');
const REMOTE_BACKUP_NAME = 'pre-broken-image-fix-backup.tmp.json';
const REMOTE_PAYLOAD_NAME = 'broken-image-fix-payload.tmp.json';

function main() {
  const host = required('VPS_HOST');
  const user = required('VPS_USER');
  const keyPath = (process.env.VPS_SSH_KEY_PATH || '').trim().replace(/\\/g, '/');
  const password = (process.env.vps_pass || '').trim();
  const appPath = required('VPS_APP_PATH');
  const remoteBackendPath = `${appPath}/backend`;

  const planPath = path.join(__dirname, '../backend/scripts/broken-images-fix-plan.json');
  const reuploadPayloadPath = path.join(__dirname, '../backend/scripts/broken-images-fix-payload.json');
  if (!fs.existsSync(planPath)) {
    console.error(`\nMissing ${planPath}\n   Run node backend/scripts/plan-broken-images-fix.js first.\n`);
    process.exit(1);
  }
  if (!fs.existsSync(reuploadPayloadPath)) {
    console.error(`\nMissing ${reuploadPayloadPath}\n   Run node backend/scripts/reupload-broken-images.js --live first.\n`);
    process.exit(1);
  }
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
  const reupload = JSON.parse(fs.readFileSync(reuploadPayloadPath, 'utf8'));
  const stripSafe = plan.stripOnly.filter((s) => !s.wouldHaveZeroImages)
    .map((s) => ({ productId: s.productId, brokenUrls: s.brokenUrls }));
  const stripZero = plan.stripOnly.filter((s) => s.wouldHaveZeroImages)
    .map((s) => ({ productId: s.productId, brokenUrls: s.brokenUrls }));

  const allProductIds = [
    ...reupload.map((r) => r.productId),
    ...stripSafe.map((s) => s.productId),
    ...stripZero.map((s) => s.productId),
  ];

  console.log(`\nMode: ${COMMIT ? 'COMMIT (will write to live DB)' : 'DRY RUN (no writes)'}`);
  console.log(`Reupload (full image replace): ${reupload.length}`);
  console.log(`Strip dead URLs only:          ${stripSafe.length}`);
  console.log(`Strip + mark draft/unavailable: ${stripZero.length}\n`);

  // ── Step 1: backup ──────────────────────────────────────────────────────
  console.log('Fetching pre-update backup snapshot from live DB...');
  const backupQuery = `
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  const schema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('BackupDump', schema);
  const ids = ${JSON.stringify(allProductIds)};
  const docs = await Product.find({ productId: { $in: ids } })
    .select('productId name image images sortedImages status available')
    .lean();
  fs.writeFileSync('${REMOTE_BACKUP_NAME}', JSON.stringify(docs));
  console.log('BACKUP_WROTE', docs.length, 'of', ids.length);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
`.trim();

  if (!runRemoteScript(host, user, keyPath, password, remoteBackendPath, backupQuery)) {
    console.error('\nBackup step failed. Aborting before touching any product.\n');
    process.exit(1);
  }

  const backupDir = path.join(__dirname, '../backend/backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const localBackupPath = path.join(backupDir, `PROD_products_pre_broken_image_fix_${stamp}.json`);
  const remoteBackupPath = `${remoteBackendPath}/${REMOTE_BACKUP_NAME}`;

  if (!downloadViaSftp(host, user, keyPath, password, remoteBackupPath, localBackupPath)) {
    console.error('\nFailed to download backup snapshot. Aborting before touching any product.\n');
    process.exit(1);
  }
  cleanupRemoteFile(host, user, keyPath, password, remoteBackupPath);
  console.log(`Backup saved: ${localBackupPath}\n`);

  // ── Step 2: upload combined payload ────────────────────────────────────
  console.log('Uploading fix payload...');
  const combinedPayload = { reupload, stripSafe, stripZero };
  const localPayloadPath = path.join(__dirname, `broken-image-fix-payload-${stamp}.tmp.json`);
  fs.writeFileSync(localPayloadPath, JSON.stringify(combinedPayload));
  const remotePayloadPath = `${remoteBackendPath}/${REMOTE_PAYLOAD_NAME}`;
  const uploaded = uploadViaSftp(host, user, keyPath, password, localPayloadPath, remotePayloadPath);
  fs.unlinkSync(localPayloadPath);
  if (!uploaded) {
    console.error('\nUpload failed. Aborting.\n');
    process.exit(1);
  }

  // ── Step 3: apply (or dry-run report) ──────────────────────────────────
  console.log(`\nRunning ${COMMIT ? 'update' : 'dry-run'} on live DB...\n`);
  const applyQuery = `
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
const COMMIT = ${COMMIT ? 'true' : 'false'};
(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  const schema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('BrokenImageFixDump', schema);
  const { reupload, stripSafe, stripZero } = JSON.parse(fs.readFileSync('${REMOTE_PAYLOAD_NAME}', 'utf8'));

  let reuploadNotFound = 0, reuploadUpdated = 0;
  for (const item of reupload) {
    const doc = await Product.findOne({ productId: item.productId }).select('productId').lean();
    if (!doc) { reuploadNotFound++; continue; }
    reuploadUpdated++;
    if (COMMIT) {
      await Product.updateOne(
        { productId: item.productId },
        { \$set: { image: item.image, images: item.images, sortedImages: item.sortedImages } }
      );
    }
  }
  console.log('[reupload] total:', reupload.length, 'not found:', reuploadNotFound, COMMIT ? 'updated:' : 'would update:', reuploadUpdated);

  async function stripBroken(item) {
    const doc = await Product.findOne({ productId: item.productId }).select('productId image images sortedImages').lean();
    if (!doc) return { found: false };
    const dead = new Set(item.brokenUrls);
    const newImages = (doc.images || []).filter((u) => !dead.has(u));
    const newSorted = (doc.sortedImages || []).filter((u) => !dead.has(u));
    const newImage = dead.has(doc.image) ? (newImages[0] || null) : doc.image;
    return { found: true, newImage, newImages, newSorted };
  }

  let stripSafeNotFound = 0, stripSafeUpdated = 0;
  for (const item of stripSafe) {
    const r = await stripBroken(item);
    if (!r.found) { stripSafeNotFound++; continue; }
    stripSafeUpdated++;
    if (COMMIT) {
      await Product.updateOne(
        { productId: item.productId },
        { \$set: { image: r.newImage, images: r.newImages, sortedImages: r.newSorted } }
      );
    }
  }
  console.log('[stripSafe] total:', stripSafe.length, 'not found:', stripSafeNotFound, COMMIT ? 'updated:' : 'would update:', stripSafeUpdated);

  let stripZeroNotFound = 0, stripZeroUpdated = 0;
  for (const item of stripZero) {
    const r = await stripBroken(item);
    if (!r.found) { stripZeroNotFound++; continue; }
    stripZeroUpdated++;
    if (COMMIT) {
      await Product.updateOne(
        { productId: item.productId },
        { \$set: { image: r.newImage || '', images: r.newImages, sortedImages: r.newSorted, status: 'draft', available: false } }
      );
    }
  }
  console.log('[stripZero] total:', stripZero.length, 'not found:', stripZeroNotFound, COMMIT ? 'updated (+draft/unavailable):' : 'would update (+draft/unavailable):', stripZeroUpdated);

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
