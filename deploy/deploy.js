#!/usr/bin/env node
'use strict';

/**
 * HS Global — Master Deploy Script
 *
 * Usage:
 *   node deploy/deploy.js                    ← deploy all three
 *   node deploy/deploy.js --frontend-godaddy ← old frontend to GoDaddy FTP
 *   node deploy/deploy.js --frontend-vps     ← new Next.js frontend to VPS
 *   node deploy/deploy.js --backend          ← backend to VPS
 *
 * Requires: deploy/.env.deploy  (copy from .env.deploy.example)
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const only = args.find(a => ['--frontend-godaddy', '--frontend-vps', '--backend'].includes(a));

const doGodaddy    = !only || only === '--frontend-godaddy';
const doFrontendVps = !only || only === '--frontend-vps';
const doBackend    = !only || only === '--backend';

function runScript(scriptName, label) {
  console.log(`\n${'─'.repeat(54)}`);
  console.log(`  ${label}`);
  console.log('─'.repeat(54));

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
  let step = 1;
  const total = [doGodaddy, doFrontendVps, doBackend].filter(Boolean).length;

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║        HS Global — Deploy Pipeline           ║');
  console.log('╚══════════════════════════════════════════════╝');

  if (doGodaddy) {
    const ok = runScript('deploy-frontend.js', `${step++}/${total}  Old Frontend → GoDaddy (cPanel FTP)`);
    if (!ok) { console.error('\n⛔  GoDaddy deploy failed.\n'); process.exit(1); }
  }

  if (doFrontendVps) {
    const ok = runScript('deploy-frontend-vps.js', `${step++}/${total}  Next.js Frontend → VPS (PM2)`);
    if (!ok) { console.error('\n⛔  Frontend VPS deploy failed.\n'); process.exit(1); }
  }

  if (doBackend) {
    const ok = runScript('deploy-backend.js', `${step++}/${total}  Backend → VPS (PM2)`);
    if (!ok) { console.error('\n⛔  Backend deploy failed.\n'); process.exit(1); }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n${'═'.repeat(54)}`);
  console.log(`  ✅  Deploy complete in ${elapsed}s`);
  console.log('═'.repeat(54) + '\n');
}

main();
