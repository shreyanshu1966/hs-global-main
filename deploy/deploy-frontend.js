#!/usr/bin/env node
'use strict';

/**
 * Deploys the frontend:
 *   1. Runs `npm run build` inside frontend/
 *   2. Uploads frontend/dist/ to GoDaddy via FTP
 *
 * Requires: deploy/.env.deploy  (copy from .env.deploy.example)
 * Run with: node deploy/deploy-frontend.js
 */

const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'frontend', 'dist');

loadEnv(path.join(__dirname, '.env.deploy'));

// basic-ftp lives in backend/node_modules — no extra install needed
const basicFtpPath = path.join(ROOT, 'backend', 'node_modules', 'basic-ftp');
if (!fs.existsSync(basicFtpPath)) {
  console.error('❌  basic-ftp not found. Run `npm install` inside the backend/ folder first.');
  process.exit(1);
}
const { Client } = require(basicFtpPath);

// Folders inside dist/ that are never uploaded (too large / already on server)
const SKIP_FOLDERS = new Set(['videos', 'gallery']);

async function main() {
  const ftpHost    = required('FTP_HOST');
  const ftpUser    = required('FTP_USER');
  const ftpPass    = required('FTP_PASS');
  const remotePath = process.env.FTP_REMOTE_PATH || '/public_html';

  // ── Step 1: Build ──────────────────────────────────────────────────────────
  console.log('\n📦  Building frontend (npm run build)...\n');
  execSync('npm run build', {
    cwd: path.join(ROOT, 'frontend'),
    stdio: 'inherit',
    shell: true,
  });

  if (!fs.existsSync(DIST_DIR)) {
    throw new Error('Build failed — frontend/dist/ was not created.');
  }

  // ── Step 2: Upload via FTP (skipping heavy folders) ───────────────────────
  console.log(`📤  Uploading dist/ → ${remotePath}`);
  console.log(`⏭️   Skipping folders: ${[...SKIP_FOLDERS].join(', ')}\n`);

  const ftpCreds = { host: ftpHost, user: ftpUser, password: ftpPass, secure: false };

  let uploaded = 0;
  let skipped  = 0;

  // Collect all upload tasks upfront so we can retry from the failure point
  const tasks = collectTasks(DIST_DIR, remotePath);
  const total  = tasks.filter(t => t.type === 'file').length;
  let done = 0;

  const client = new Client();
  client.ftp.verbose = false;

  try {
    await connect(client, ftpCreds);

    for (const task of tasks) {
      if (task.type === 'mkdir') {
        await withReconnect(client, ftpCreds, () => client.ensureDir(task.remote));
        continue;
      }
      if (task.type === 'skip') continue;
      // file upload
      done++;
      process.stdout.write(`  [${done}/${total}]  ${path.relative(DIST_DIR, task.local)}\r`);
      await withReconnect(client, ftpCreds, () => client.uploadFrom(task.local, task.remote));
      uploaded++;
    }

    skipped = tasks.filter(t => t.type === 'skip').length;

    console.log(`\n\n✅  Frontend deployed to GoDaddy!`);
    console.log(`    Files uploaded : ${uploaded}`);
    console.log(`    Folders skipped: ${skipped}\n`);
  } finally {
    client.close();
  }
}

async function connect(client, creds) {
  await client.access(creds);
  // Enable TCP keepalive so the control socket doesn't time out during big uploads
  if (client.ftp.socket) {
    client.ftp.socket.setKeepAlive(true, 10000);
  }
}

async function withReconnect(client, creds, fn) {
  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const retriable = err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED'
        || (err.message && (err.message.includes('ECONNRESET') || err.message.includes('control socket')));
      if (retriable && attempt < MAX_RETRIES) {
        console.log(`\n  ⚠️  Connection dropped — reconnecting (attempt ${attempt + 1})...`);
        try { client.close(); } catch (_) {}
        await new Promise(r => setTimeout(r, 2000 * attempt));
        await connect(client, creds);
      } else {
        throw err;
      }
    }
  }
}

/**
 * Walks the local dist tree and returns a flat list of tasks:
 *   { type: 'mkdir', remote }
 *   { type: 'file',  local, remote }
 *   { type: 'skip',  name }
 * Uses absolute remote paths throughout so we never need to track CWD.
 */
function collectTasks(localDir, remoteDir) {
  const tasks = [];
  tasks.push({ type: 'mkdir', remote: remoteDir });

  const entries = fs.readdirSync(localDir, { withFileTypes: true });
  for (const entry of entries) {
    const localPath   = path.join(localDir, entry.name);
    const remotePath  = remoteDir + '/' + entry.name;

    if (entry.isDirectory()) {
      if (SKIP_FOLDERS.has(entry.name)) {
        console.log(`  ⏭️   Skipping  ${entry.name}/`);
        tasks.push({ type: 'skip', name: entry.name });
        continue;
      }
      tasks.push(...collectTasks(localPath, remotePath));
    } else {
      tasks.push({ type: 'file', local: localPath, remote: remotePath });
    }
  }
  return tasks;
}


// ── Helpers ──────────────────────────────────────────────────────────────────

function required(key) {
  const val = process.env[key];
  if (!val || !val.trim()) {
    throw new Error(`Missing required deploy variable: ${key}\n   Set it in deploy/.env.deploy`);
  }
  return val.trim();
}

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`\n❌  Credentials file not found: ${filePath}`);
    console.error('   Copy deploy/.env.deploy.example → deploy/.env.deploy and fill in your values.\n');
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

main().catch(err => {
  console.error('\n❌  Frontend deployment failed:', err.message);
  process.exit(1);
});
