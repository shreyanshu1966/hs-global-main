#!/usr/bin/env node
'use strict';

/**
 * Deploys the backend to your DigitalOcean VPS:
 *   1. SSHs into the VPS
 *   2. git pull (hard-reset to latest on branch)
 *   3. npm install --production  (backend only)
 *   4. pm2 reload hs-backend-api  (zero-downtime restart)
 *
 * Prerequisites on the VPS (see VPS_SETUP.md):
 *   - Git repo cloned at VPS_APP_PATH
 *   - Node.js + PM2 installed
 *   - backend/.env present with production secrets
 *   - pm2 start ecosystem.config.js  (first time only)
 *
 * Requires: deploy/.env.deploy  (copy from .env.deploy.example)
 * Run with: node deploy/deploy-backend.js
 */

const path = require('path');
const { spawnSync } = require('child_process');
const fs = require('fs');

loadEnv(path.join(__dirname, '.env.deploy'));

function main() {
  const host       = required('VPS_HOST');
  const user       = required('VPS_USER');
  const sshKeyPath = required('VPS_SSH_KEY_PATH');
  const appPath    = required('VPS_APP_PATH');
  const branch     = (process.env.VPS_GIT_BRANCH || 'main').trim();
  const pm2Name    = 'hs-backend-api';

  // Normalise Windows backslashes in the key path
  const keyPath = sshKeyPath.replace(/\\/g, '/');

  const remoteCommands = [
    `cd ${appPath}`,
    `git fetch origin ${branch}`,
    `git reset --hard origin/${branch}`,
    `cd backend && npm install --production --silent`,
    `cd ${appPath}`,
    // reload = zero-downtime if already running; otherwise start fresh
    `pm2 reload ${pm2Name} --update-env 2>/dev/null || pm2 start ecosystem.config.js --env production`,
    `pm2 save`,
    `echo "Backend version: $(cd ${appPath} && git log -1 --format='%h %s')"`,
  ].join(' && ');

  console.log(`\n🚀  Deploying backend to ${user}@${host}`);
  console.log(`    App path : ${appPath}`);
  console.log(`    Branch   : ${branch}`);
  console.log(`    PM2 app  : ${pm2Name}\n`);

  const result = spawnSync(
    'ssh',
    [
      '-i', keyPath,
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'BatchMode=yes',
      '-o', 'ConnectTimeout=30',
      `${user}@${host}`,
      remoteCommands,
    ],
    { stdio: 'inherit' }
  );

  if (result.status !== 0) {
    console.error('\n❌  SSH command failed (exit code ' + result.status + ')');
    if (result.error) console.error('   ', result.error.message);
    process.exit(1);
  }

  console.log('\n✅  Backend deployed!\n');
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

main();
