#!/usr/bin/env node
'use strict';

/**
 * Fetches ALL products (every category) from the live production DB by
 * SSH-ing into the VPS (same auth as deploy-backend.js), querying Mongo
 * locally there (the live DB is only reachable from the VPS itself), writing
 * the result to a file on the VPS, then downloading it over SFTP.
 *
 * Read-only. Used as the data source for the analysis-only scripts:
 *   backend/scripts/analyze-broken-images.js
 *   backend/scripts/analyze-missing-images.js
 *
 * A plain PTY exec_command isn't used for the transfer because the dump is
 * one huge JSON line that gets truncated when streamed through the PTY
 * channel; SFTP moves the file byte-for-byte instead.
 *
 * Requires: deploy/.env.deploy
 * Run with: node deploy/fetch-all-products-for-analysis.js
 * Writes: backend/scripts/all-products-live.json
 */

const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

loadEnv(path.join(__dirname, '.env.deploy'));

const REMOTE_TMP_NAME = 'all-products-live-dump.tmp.json';

function main() {
  const host = required('VPS_HOST');
  const user = required('VPS_USER');
  const keyPath = (process.env.VPS_SSH_KEY_PATH || '').trim().replace(/\\/g, '/');
  const password = (process.env.vps_pass || '').trim();
  const appPath = required('VPS_APP_PATH');

  const remoteQuery = `
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  const schema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('ProductDump', schema);
  const products = await Product.find({}, {
    productId: 1, productCode: 1, name: 1, category: 1, subcategory: 1,
    image: 1, images: 1, sortedImages: 1, status: 1, available: 1,
    'seo.slug': 1,
  }).lean();
  const mapped = products.map(p => {
    const slugVal = (p.seo && p.seo.slug) ? p.seo.slug : "";
    const urlSlug = slugVal || p.productId || p._id || "";
    return {
      ...p,
      slug: slugVal,
      url: urlSlug ? 'https://www.hsglobalexport.com/product/' + urlSlug : ""
    };
  });
  fs.writeFileSync('${REMOTE_TMP_NAME}', JSON.stringify(mapped));
  console.log('WROTE', mapped.length, 'products');
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
`.trim();

  const encodedQuery = Buffer.from(remoteQuery, 'utf8').toString('base64');
  const remoteBackendPath = `${appPath}/backend`;

  const remoteScript = `
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
set -e
cd ${remoteBackendPath}
echo ${encodedQuery} | base64 -d > ./all-products-query.tmp.js
node ./all-products-query.tmp.js
rm -f ./all-products-query.tmp.js
`.trim();

  console.log(`\nFetching ALL products from ${user}@${host}...\n`);

  const ranOk = runViaSsh(host, user, keyPath, password, remoteScript);
  if (!ranOk) {
    console.error('\nRemote query failed.\n');
    process.exit(1);
  }

  const localOutPath = path.join(__dirname, '../backend/scripts/all-products-live.json');
  const remoteFilePath = `${remoteBackendPath}/${REMOTE_TMP_NAME}`;

  console.log('Downloading dump via SFTP...');
  const downloaded = downloadViaSftp(host, user, keyPath, password, remoteFilePath, localOutPath);
  if (!downloaded) {
    console.error('\nSFTP download failed.\n');
    process.exit(1);
  }

  cleanupRemoteFile(host, user, keyPath, password, remoteFilePath);

  const products = JSON.parse(fs.readFileSync(localOutPath, 'utf8'));
  fs.writeFileSync(localOutPath, JSON.stringify(products, null, 2));
  console.log(`\nFetched ${products.length} products from live DB (all categories).`);
  console.log(`Wrote ${localOutPath}\n`);
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

function runViaSsh(host, user, keyPath, password, script) {
  const pythonHelper = path.join(__dirname, 'ssh-run.py');
  if (!fs.existsSync(pythonHelper)) {
    console.error(`Missing SSH helper: ${pythonHelper}`);
    return false;
  }

  const env = sshEnv(keyPath, password);
  if (!env) return false;

  const result = spawnSync('python', [pythonHelper, host, user], {
    input: script,
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
  if (!fs.existsSync(pythonHelper)) {
    console.error(`Missing SFTP helper: ${pythonHelper}`);
    return false;
  }

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
  runViaSsh(host, user, keyPath, password, `rm -f ${remotePath}`);
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
