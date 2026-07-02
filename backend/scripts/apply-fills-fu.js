#!/usr/bin/env node
'use strict';
/**
 * apply-fills-fu.js — like apply-fills.js but resolves the "n" field
 * (fu-001 …) to a productId via _furniture-worklist.json, so truncated
 * productIds never cause mismatches. Fills only blank leaves.
 *
 * Usage: node scripts/apply-fills-fu.js --fills=scripts/fills/furniture-1.json
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const BACKEND = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const val = (n, d) => { const f = args.find(a => a.startsWith(`--${n}=`)); return f ? f.slice(n.length + 3) : d; };

const worklist = JSON.parse(fs.readFileSync(path.resolve(BACKEND, 'scripts/fills/_furniture-worklist.json'), 'utf8'));
const nToId = new Map(worklist.map(w => [w.n, w.id]));

const fillsPath = path.resolve(BACKEND, val('fills'));
const fills = JSON.parse(fs.readFileSync(fillsPath, 'utf8'));

let missing = 0;
const resolved = fills.map(f => {
  if (f.productId) return f;
  const id = nToId.get(f.n);
  if (!id) { console.warn('No worklist entry for', f.n); missing++; return f; }
  const { n, ...rest } = f;
  return { productId: id, ...rest };
});

const tmp = fillsPath.replace(/\.json$/, '.resolved.json');
fs.writeFileSync(tmp, JSON.stringify(resolved, null, 2));
console.log(`Resolved ${resolved.length - missing}/${resolved.length} entries -> applying…\n`);

execFileSync('node', ['scripts/apply-fills.js', `--fills=${path.relative(BACKEND, tmp)}`], { cwd: BACKEND, stdio: 'inherit' });
fs.unlinkSync(tmp);
