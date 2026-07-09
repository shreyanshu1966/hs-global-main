#!/usr/bin/env node
'use strict';

/**
 * apply-marble-species.js
 * ------------------------------------------------------------------
 * For marble/stone FURNITURE whose wood_species is a placeholder
 * ("Not Applicable" / "N/A"), replace it with the stone species taken
 * from the material text (leading "Natural " trimmed) so the product
 * page shows a real "Marble / Stone Species" instead of "Not Applicable".
 *
 * - Only category 'furniture'.
 * - Only touches wood_species when it is exactly "Not Applicable" or "N/A"
 *   (case-insensitive). Genuine wood values (Oak, Walnut, MDF…) are kept.
 * - Dry-run by default; --commit writes product-specs.json (with .bak).
 */

const fs = require('fs');
const path = require('path');

const FILE = path.resolve(__dirname, 'product-specs.json');
const COMMIT = process.argv.includes('--commit');
const PLACEHOLDER = new Set(['not applicable', 'n/a', 'na', '']);

const toSpecies = (material) =>
  (material || '').replace(/^\s*natural\s+/i, '').trim();

function main() {
  const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const arr = Array.isArray(data) ? data : (data.products || Object.values(data));

  let changed = 0, skippedRealWood = 0, noMaterial = [];
  for (const p of arr) {
    if (p.category !== 'furniture') continue;
    const d = (p.productSpecifications && p.productSpecifications.details) || {};
    const cur = (d.wood_species || '').trim();
    if (!PLACEHOLDER.has(cur.toLowerCase())) { skippedRealWood++; continue; }
    const species = toSpecies(d.material);
    if (!species) { noMaterial.push(p.productId); continue; }
    if (species !== cur) {
      if (changed < 12) console.log(`• ${p.productId}\n    material="${d.material}"  ->  species="${species}"`);
      d.wood_species = species;
      changed++;
    }
  }

  console.log('\n──────── MARBLE SPECIES SUMMARY ────────');
  console.log(`furniture updated (placeholder -> species): ${changed}`);
  console.log(`furniture kept (genuine wood value)       : ${skippedRealWood}`);
  if (noMaterial.length) console.log(`no material text (skipped): ${noMaterial.length}  ${noMaterial.join(', ')}`);

  if (COMMIT) {
    fs.copyFileSync(FILE, FILE + '.bak');
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
    console.log(`\n✅ Written to ${FILE} (backup: product-specs.json.bak)`);
  } else {
    console.log('\nℹ️  DRY-RUN. Re-run with --commit to write product-specs.json.');
  }
}

main();
