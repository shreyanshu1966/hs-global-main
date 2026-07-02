#!/usr/bin/env node

'use strict';

/**
 * apply-fills.js
 * ------------------------------------------------------------------
 * Merges a compact "fills" file into product-specs.json, matching by
 * productId. Only BLANK leaves are filled — existing values are never
 * overwritten. Writes a .bak before saving.
 *
 * Fills file shape (array):
 * [
 *   { "productId": "...",
 *     "productSpecifications": { "details": { "material": "Marble" }, ... },
 *     "stoneSpecs": { "finish": "Polished" },
 *     "customSpecs": [ { "label": "Detailing", "value": "Brass inlay" } ]
 *   }
 * ]
 *
 * Usage:
 *   node scripts/apply-fills.js --fills=scripts/fills/batch-1.json
 *   node scripts/apply-fills.js --fills=... --target=scripts/product-specs.json
 */

const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);

function argVal(name, fallback) {
  const key = `--${name}=`;
  const f = args.find((a) => a.startsWith(key));
  return f ? f.slice(key.length).trim().replace(/^"|"$/g, '') : fallback;
}

const resolve = (p) => (path.isAbsolute(p) ? p : path.resolve(BACKEND_ROOT, p));
const FILLS_PATH = resolve(argVal('fills', ''));
const TARGET_PATH = resolve(argVal('target', 'scripts/product-specs.json'));

if (!FILLS_PATH || !fs.existsSync(FILLS_PATH)) {
  console.error('❌ --fills=<file> required and must exist:', FILLS_PATH);
  process.exit(1);
}

const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';

// Deep-merge src into dst, only writing where dst leaf is blank. Returns changes[].
function mergeBlanks(dst, src, prefix, changes) {
  for (const k of Object.keys(src)) {
    const sv = src[k];
    if (sv && typeof sv === 'object' && !Array.isArray(sv)) {
      if (!dst[k] || typeof dst[k] !== 'object') dst[k] = {};
      mergeBlanks(dst[k], sv, `${prefix}${k}.`, changes);
    } else if (!Array.isArray(sv)) {
      if (isBlank(sv)) continue;
      if (isBlank(dst[k])) {
        dst[k] = sv;
        changes.push(`${prefix}${k} = "${sv}"`);
      }
    }
  }
}

function main() {
  const target = JSON.parse(fs.readFileSync(TARGET_PATH, 'utf8'));
  const fills = JSON.parse(fs.readFileSync(FILLS_PATH, 'utf8'));
  const list = Array.isArray(fills) ? fills : fills.products;

  const byId = new Map(target.products.map((p) => [p.productId, p]));
  let touched = 0, skippedMissing = 0, totalChanges = 0;

  for (const fill of list) {
    const p = byId.get(fill.productId);
    if (!p) { console.warn(`❓ Not in target: ${fill.productId}`); skippedMissing++; continue; }

    const changes = [];

    if (fill.productSpecifications && p.productSpecifications) {
      mergeBlanks(p.productSpecifications, fill.productSpecifications, '', changes);
    }
    if (fill.stoneSpecs && p.stoneSpecs) {
      mergeBlanks(p.stoneSpecs, fill.stoneSpecs, 'stoneSpecs.', changes);
    }

    // customSpecs: append new label/value rows that aren't already present.
    if (Array.isArray(fill.customSpecs) && fill.customSpecs.length) {
      p.customSpecs = p.customSpecs || [];
      const existingLabels = new Set(
        p.customSpecs.filter((r) => r.label).map((r) => r.label.toLowerCase())
      );
      // strip the trailing blank row(s) so appended rows sit above it
      const blankRows = p.customSpecs.filter((r) => !r.label && !r.value);
      p.customSpecs = p.customSpecs.filter((r) => r.label || r.value);
      for (const row of fill.customSpecs) {
        if (!row.label || !row.value) continue;
        if (existingLabels.has(row.label.toLowerCase())) continue;
        p.customSpecs.push({ label: row.label, value: row.value });
        existingLabels.add(row.label.toLowerCase());
        changes.push(`customSpecs += ${row.label}: "${row.value}"`);
      }
      if (blankRows.length) p.customSpecs.push({ label: '', value: '' });
    }

    if (changes.length) {
      touched++;
      totalChanges += changes.length;
      console.log(`• ${fill.productId} (${changes.length})`);
      for (const c of changes) console.log(`    ${c}`);
    }
  }

  fs.copyFileSync(TARGET_PATH, TARGET_PATH + '.bak');
  fs.writeFileSync(TARGET_PATH, JSON.stringify(target, null, 2), 'utf8');

  console.log('\n──────── APPLY SUMMARY ────────');
  console.log(`Products touched : ${touched}`);
  console.log(`Total field fills: ${totalChanges}`);
  if (skippedMissing) console.log(`Not found        : ${skippedMissing}`);
  console.log(`Backup written   : ${path.basename(TARGET_PATH)}.bak`);
}

main();
