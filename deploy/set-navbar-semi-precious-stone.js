#!/usr/bin/env node
'use strict';

/**
 * One-off: runs backend/scripts/set-navbar-semi-precious-stone.js on the VPS,
 * where backend/.env's MONGODB_URI is the production database — no LIVE_MONGODB_URI
 * needed since we're executing directly on the server.
 *
 * Dry-run by default (prints current vs desired navbar config, writes no data).
 * Pass --commit to actually write.
 *
 * Requires: deploy/.env.deploy
 * Run with: node deploy/set-navbar-semi-precious-stone.js [--commit]
 */

const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

loadEnv(path.join(__dirname, '.env.deploy'));

function main() {
  const host = required('VPS_HOST');
  const user = required('VPS_USER');
  const keyPath = (process.env.VPS_SSH_KEY_PATH || '').trim().replace(/\\/g, '/');
  const password = (process.env.vps_pass || '').trim();
  const appPath = required('VPS_APP_PATH');
  const commit = process.argv.includes('--commit');

  const localScriptPath = path.join(__dirname, '..', 'backend', 'scripts', 'set-navbar-semi-precious-stone.js');
  const scriptSource = fs.readFileSync(localScriptPath, 'utf8');
  const scriptB64 = Buffer.from(scriptSource, 'utf8').toString('base64');

  const remoteScript = `
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
set -e

cd ${appPath}/backend
mkdir -p scripts/backups
echo '${scriptB64}' | base64 -d > scripts/set-navbar-semi-precious-stone.js

node scripts/set-navbar-semi-precious-stone.js ${commit ? '--commit' : ''}
`.trim();

  console.log(`\n${commit ? '⚠️  COMMIT run' : '🔎  Dry run'} — ${user}@${host}:${appPath}/backend\n`);

  const ok = runViaSsh(host, user, keyPath, password, remoteScript);
  if (!ok) {
    console.error('\n❌  Remote script failed.\n');
    process.exit(1);
  }
  console.log(commit ? '\n✅  Navbar config written on live DB.\n' : '\n✅  Dry run complete — no data written. Re-run with --commit to apply.\n');
}

// ── SSH runner (same pattern as deploy-backend.js) ────────────────────────────

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
