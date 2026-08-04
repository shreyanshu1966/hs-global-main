#!/usr/bin/env node

'use strict';

/**
 * apply-defaults.js
 * ------------------------------------------------------------------
 * Applies catalog-wide business/policy defaults to product-specs.json
 * for the made-to-order categories (furniture, wooden-furniture,
 * leather). Only BLANK fields are set — nothing is overwritten. Writes
 * a .bak before saving.
 *
 * Defaults:
 *   details.custom_product     = "Yes"
 *   details.imported           = "Yes"
 *   details.wayfair_verified   = "Yes"   (Eligible for Refund)
 *   warranty.product_warranty  = "Manufacturer Warranty"
 *   warranty.warranty_length   = (left blank)
 *   assembly.assembly_required = "No", or "Yes" for beds & dining sets
 *   customSpecs += { Refund Window: "15 Days" }
 *
 * Stone (semi-precious-stone) is intentionally skipped.
 *
 * Usage: node scripts/apply-defaults.js
 */

const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = path.resolve(__dirname, '..');
const TARGET = path.resolve(BACKEND_ROOT, 'scripts/product-specs.json');
const CATEGORIES = ['furniture', 'wooden-furniture', 'handcrafted', 'leather'];
const REFUND_LABEL = 'Refund Window';
const REFUND_VALUE = '15 Days';

const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';

// Beds & dining sets need assembly; everything else ships assembled.
function needsAssembly(p) {
  const hay = `${p.subcategory || ''} ${p.name || ''} ${p.productId || ''}`.toLowerCase();
  return /\bbed\b|bed-frame|dining|dinning|table-set|\bset\b/.test(hay);
}

function setBlank(obj, key, val, changes, prefix) {
  if (obj && isBlank(obj[key])) { obj[key] = val; changes.push(`${prefix}${key} = "${val}"`); }
}

function main() {
  const data = JSON.parse(fs.readFileSync(TARGET, 'utf8'));
  let touched = 0, totalChanges = 0;

  for (const p of data.products) {
    if (!CATEGORIES.includes(p.category)) continue;
    const ps = p.productSpecifications;
    if (!ps) continue;

    const changes = [];
    ps.details = ps.details || {};
    ps.assembly = ps.assembly || {};
    ps.warranty = ps.warranty || {};

    setBlank(ps.details, 'custom_product', 'Yes', changes, 'details.');
    setBlank(ps.details, 'imported', 'Yes', changes, 'details.');
    setBlank(ps.details, 'wayfair_verified', 'Yes', changes, 'details.');
    setBlank(ps.warranty, 'product_warranty', 'Manufacturer Warranty', changes, 'warranty.');
    setBlank(ps.assembly, 'assembly_required', needsAssembly(p) ? 'Yes' : 'No', changes, 'assembly.');

    // Refund window as a custom spec (add once)
    p.customSpecs = p.customSpecs || [];
    const hasRefund = p.customSpecs.some((r) => (r.label || '').toLowerCase() === REFUND_LABEL.toLowerCase());
    if (!hasRefund) {
      const blanks = p.customSpecs.filter((r) => !r.label && !r.value);
      p.customSpecs = p.customSpecs.filter((r) => r.label || r.value);
      p.customSpecs.push({ label: REFUND_LABEL, value: REFUND_VALUE });
      if (blanks.length) p.customSpecs.push({ label: '', value: '' });
      changes.push(`customSpecs += ${REFUND_LABEL}: "${REFUND_VALUE}"`);
    }

    if (changes.length) { touched++; totalChanges += changes.length; }
  }

  fs.copyFileSync(TARGET, TARGET + '.bak');
  fs.writeFileSync(TARGET, JSON.stringify(data, null, 2), 'utf8');

  console.log('──────── DEFAULTS SUMMARY ────────');
  console.log(`Categories       : ${CATEGORIES.join(', ')}`);
  console.log(`Products touched : ${touched}`);
  console.log(`Total field fills: ${totalChanges}`);
  console.log(`Backup written   : product-specs.json.bak`);
}

main();
