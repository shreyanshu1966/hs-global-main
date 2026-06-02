#!/usr/bin/env node
'use strict';

/**
 * HS Global — Master Deploy Script
 *
 * Usage:
 *   node deploy/deploy.js              ← deploy both frontend and backend
 *   node deploy/deploy.js --frontend   ← frontend only
 *   node deploy/deploy.js --backend    ← backend only
 *
 * Requires: deploy/.env.deploy  (copy from .env.deploy.example)
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const only = args.find(a => a === '--frontend' || a === '--backend');
const doFrontend = !only || only === '--frontend';
const doBackend  = !only || only === '--backend';

function runScript(scriptName, label) {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  ${label}`);
  console.log('─'.repeat(50));

  const scriptPath = path.join(__dirname, scriptName);
  if (!fs.existsSync(scriptPath)) {
    console.error(`Script not found: ${scriptPath}`);
    return false;
  }

  const result = spawnSync(process.execPath, [scriptPath], { stdio: 'inherit' });
  return result.status === 0;
}

async function main() {
  const start = Date.now();

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║        HS Global — Deploy Pipeline       ║');
  console.log('╚══════════════════════════════════════════╝');

  let success = true;

  if (doFrontend) {
    const ok = runScript('deploy-frontend.js', '1/2  Frontend → GoDaddy (cPanel FTP)');
    if (!ok) {
      console.error('\n⛔  Frontend deployment failed. Backend deployment skipped.\n');
      process.exit(1);
    }
  }

  if (doBackend) {
    const ok = runScript('deploy-backend.js', `${doFrontend ? '2' : '1'}/2  Backend → DigitalOcean VPS`);
    if (!ok) {
      success = false;
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  if (success) {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`  🎉  Deploy complete in ${elapsed}s`);
    console.log('═'.repeat(50) + '\n');
  } else {
    console.error(`\n⛔  Deploy finished with errors (${elapsed}s)\n`);
    process.exit(1);
  }
}

main();
