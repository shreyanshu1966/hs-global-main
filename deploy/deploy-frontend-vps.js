#!/usr/bin/env node
'use strict';

/**
 * Deploys frontend-new (Next.js) to the DigitalOcean VPS:
 *   1. SSHs into the VPS
 *   2. git pull (hard-reset to latest on branch)
 *   3. npm ci inside frontend-new/
 *   4. npm run build (next build)
 *   5. pm2 reload hs-frontend  (zero-downtime) or start fresh
 *
 * Prerequisites on the VPS:
 *   - Git repo cloned at VPS_APP_PATH
 *   - Node.js + PM2 installed
 *   - frontend-new/.env.production present with production secrets
 *   - pm2 start ecosystem.config.js  (first time only)
 *
 * Requires: deploy/.env.deploy
 * Run with: node deploy/deploy-frontend-vps.js
 */

const path = require('path');
const { spawnSync } = require('child_process');
const fs = require('fs');

loadEnv(path.join(__dirname, '.env.deploy'));

function main() {
  const host       = required('VPS_HOST');
  const user       = required('VPS_USER');
  const sshKeyPath = process.env.VPS_SSH_KEY_PATH || '';
  const appPath    = required('VPS_APP_PATH');
  const branch     = (process.env.VPS_GIT_BRANCH || 'main').trim();
  const pm2Name    = 'hs-frontend';
  const vpsPass    = process.env.vps_pass || '';

  const remoteCommands = [
    // Source nvm so node/npm/pm2 are in PATH
    'export NVM_DIR="$HOME/.nvm"',
    '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"',

    `cd ${appPath}`,
    `git fetch origin ${branch}`,
    `git reset --hard origin/${branch}`,

    // Install deps
    `cd ${appPath}/frontend-new && npm ci --prefer-offline`,

    // Build Next.js
    `npm run build`,

    // Start or reload PM2
    `cd ${appPath}/frontend-new`,
    `pm2 reload ${pm2Name} --update-env 2>/dev/null || pm2 start node_modules/.bin/next --name ${pm2Name} -- start --port 3001`,
    `pm2 save`,

    `echo "Frontend deployed: $(cd ${appPath} && git log -1 --format='%h %s')"`,
  ].join(' && ');

  console.log(`\n🚀  Deploying frontend-new to ${user}@${host}`);
  console.log(`    App path : ${appPath}/frontend-new`);
  console.log(`    Branch   : ${branch}`);
  console.log(`    PM2 app  : ${pm2Name}\n`);

  // Build ssh args — prefer key auth, fall back to password hint
  const sshArgs = [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ConnectTimeout=30',
  ];

  if (sshKeyPath && fs.existsSync(sshKeyPath.replace(/\\/g, '/'))) {
    sshArgs.unshift('-i', sshKeyPath.replace(/\\/g, '/'));
  }

  sshArgs.push(`${user}@${host}`, remoteCommands);

  // sshpass for password auth when no key is available
  let cmd = 'ssh';
  let args = sshArgs;
  if (vpsPass && (!sshKeyPath || !fs.existsSync(sshKeyPath.replace(/\\/g, '/')))) {
    cmd = 'sshpass';
    args = ['-p', vpsPass, 'ssh', ...sshArgs];
  }

  const result = spawnSync(cmd, args, { stdio: 'inherit' });

  if (result.status !== 0) {
    console.error('\n❌  SSH command failed (exit code ' + result.status + ')');
    if (result.error) console.error('   ', result.error.message);
    process.exit(1);
  }

  console.log('\n✅  Frontend (Next.js) deployed to VPS!\n');
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
