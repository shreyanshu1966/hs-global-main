#!/usr/bin/env node
'use strict';

/**
 * Deploys the backend (Express/Node.js) to the VPS.
 *
 *   1. SSH into the VPS (key auth preferred, password fallback via Python/paramiko)
 *   2. git fetch + reset --hard to VPS_GIT_BRANCH (default: main)
 *   3. npm install --production  inside backend/
 *   4. pm2 reload hs-backend-api --update-env  (zero-downtime)
 *
 * Requires: deploy/.env.deploy
 * Run with: node deploy/deploy-backend.js
 */

const path      = require('path');
const { spawnSync } = require('child_process');
const fs        = require('fs');

loadEnv(path.join(__dirname, '.env.deploy'));

function main() {
  const host     = required('VPS_HOST');
  const user     = required('VPS_USER');
  const keyPath  = (process.env.VPS_SSH_KEY_PATH || '').trim().replace(/\\/g, '/');
  const password = (process.env.vps_pass || '').trim();
  const appPath  = required('VPS_APP_PATH');
  const branch   = (process.env.VPS_GIT_BRANCH || 'main').trim();
  const pm2Name  = 'hs-backend-api';

  const remoteScript = `
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
set -e

echo ">>> Pulling ${branch}..."
cd ${appPath}
git fetch origin ${branch}
git reset --hard origin/${branch}

echo ">>> Installing backend dependencies..."
cd ${appPath}/backend
npm install --production --silent

echo ">>> Reloading PM2..."
cd ${appPath}
pm2 reload ${pm2Name} --update-env 2>/dev/null || \\
  pm2 start ecosystem.config.js --env production
pm2 save

echo "Backend deployed: $(cd ${appPath} && git log -1 --format='%h %s')"
`.trim();

  console.log(`\n🚀  Deploying backend → ${user}@${host}`);
  console.log(`    App path : ${appPath}/backend`);
  console.log(`    Branch   : ${branch}`);
  console.log(`    PM2 app  : ${pm2Name}\n`);

  const ok = runViaSsh(host, user, keyPath, password, remoteScript);
  if (!ok) {
    console.error('\n❌  Backend deploy failed.\n');
    process.exit(1);
  }
  console.log('\n✅  Backend deployed to VPS!\n');
}

// ── SSH runner ────────────────────────────────────────────────────────────────

function runViaSsh(host, user, keyPath, password, script) {
  const pythonHelper = path.join(__dirname, 'ssh-run.py');

  if (!fs.existsSync(pythonHelper)) {
    console.error(`Missing SSH helper: ${pythonHelper}`);
    return false;
  }

  const env = { ...process.env };
  if (keyPath && fs.existsSync(keyPath)) {
    env.SSH_KEY_PATH = keyPath;
  } else if (password) {
    env.SSH_PASS = password;
  } else {
    console.error('No SSH key or password configured. Set VPS_SSH_KEY_PATH or vps_pass in .env.deploy');
    return false;
  }

  const result = spawnSync('python', [pythonHelper, host, user], {
    input: script,
    stdio: ['pipe', 'inherit', 'inherit'],
    env,
  });

  if (result.error) {
    console.error('Failed to start Python SSH helper:', result.error.message);
    console.error('Make sure Python + paramiko are installed: pip install paramiko');
    return false;
  }

  return result.status === 0;
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
