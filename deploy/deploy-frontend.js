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

async function main() {
  const ftpHost   = required('FTP_HOST');
  const ftpUser   = required('FTP_USER');
  const ftpPass   = required('FTP_PASS');
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

  // ── Step 2: Upload via FTP ─────────────────────────────────────────────────
  const client = new Client();
  client.ftp.verbose = false;

  try {
    console.log(`\n🌐  Connecting to ${ftpHost}...`);
    await client.access({
      host: ftpHost,
      user: ftpUser,
      password: ftpPass,
      secure: false,
    });

    console.log(`📤  Uploading dist/ → ${remotePath} (this may take a few minutes)...`);
    await client.uploadFromDir(DIST_DIR, remotePath);

    console.log('\n✅  Frontend deployed to GoDaddy!\n');
  } finally {
    client.close();
  }
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
