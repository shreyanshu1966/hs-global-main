#!/usr/bin/env node
'use strict';

/**
 * apply-dimensions.js
 * ------------------------------------------------------------------
 * Fills BLANK overall_dimensions + overall_product_weight in
 * product-specs.json with nominal, per-subcategory estimates.
 * These are GUESSES by category/product type (marble/stone are heavy),
 * meant as catalog placeholders — not measured values.
 *
 * - Only NON-STONE products (stone uses stoneSpecs, not other_dimensions).
 * - Only fills leaves that are currently blank (never overwrites).
 * - Round pieces (overall_shape=Round/Oval) -> "{dia} Dia × {H} H mm".
 * - Rectangular/other -> "{W} W × {D} D × {H} H mm".
 * - "set"/"nesting"/"chairs" in the name bumps size & weight.
 * - Dry-run by default; pass --commit to write the file (with .bak).
 */

const fs = require('fs');
const path = require('path');

const FILE = path.resolve(__dirname, 'product-specs.json');
const COMMIT = process.argv.includes('--commit');
const NON_STONE = new Set(['furniture', 'wooden-furniture', 'handcrafted', 'leather']);

// Per subcategory: { rect:[W,D,H], round:[Dia,H], kg }  (mm / kg)
// round omitted -> always rectangular. Values are nominal marble/stone norms.
const DEF = {
  'furniture': {
    'Bathtub':       { rect: [1700, 800, 600], kg: 320 },
    'Bowl':          { round: [300, 130], kg: 4 },
    'Center Table':  { rect: [1100, 600, 450], round: [900, 450], kg: 180 },
    'Chaise Chair':  { rect: [1600, 700, 850], kg: 90 },
    'Clock':         { rect: [250, 60, 250], round: [300, 60], kg: 3 },
    'Coffee Table':  { rect: [1200, 700, 400], round: [900, 400], kg: 130 },
    'Console Table': { rect: [1200, 400, 800], kg: 140 },
    'Dining Table':  { rect: [2000, 1000, 760], round: [1300, 760], kg: 300 },
    'Lamp':          { rect: [300, 300, 550], round: [300, 550], kg: 8 },
    'Mirror Frame':  { rect: [800, 40, 1100], kg: 35 },
    'Pedestal Sink': { rect: [500, 500, 850], round: [500, 850], kg: 90 },
    'Side Table':    { rect: [500, 450, 550], round: [450, 550], kg: 35 },
    'Sink':          { rect: [600, 400, 150], round: [450, 150], kg: 30 },
    'Vase':          { rect: [250, 250, 450], round: [250, 450], kg: 6 },
  },
  'leather': {
    'Bed':           { rect: [1800, 2100, 1200], kg: 90 },
    'Bench':         { rect: [1200, 400, 450], kg: 25 },
    'Box':           { rect: [300, 220, 150], kg: 3 },
    'Cabinet':       { rect: [900, 450, 1000], kg: 45 },
    'Chair':         { rect: [750, 800, 1050], kg: 30 },
    'Coffee Table':  { rect: [1200, 600, 450], round: [900, 450], kg: 40 },
    'Console Table': { rect: [1200, 400, 800], kg: 40 },
    'Dresser':       { rect: [1200, 500, 800], kg: 60 },
    'Mirror Frame':  { rect: [700, 40, 900], kg: 12 },
    'Mirror':        { rect: [700, 40, 900], round: [800, 40], kg: 12 },
    'Side Table':    { rect: [500, 500, 550], round: [450, 550], kg: 15 },
    'Sofa':          { rect: [2000, 900, 800], kg: 80 },
    'Stool':         { rect: [450, 450, 450], round: [450, 450], kg: 10 },
  },
  'wooden-furniture': {
    'Coffee Table':  { rect: [1200, 600, 450], round: [900, 450], kg: 45 },
    'Console Table': { rect: [1400, 450, 850], kg: 60 },
    'Dining Table':  { rect: [1800, 900, 760], round: [1200, 760], kg: 120 },
    'Side Table':    { rect: [500, 400, 600], kg: 25 },
    'Sofa':          { rect: [1800, 750, 900], kg: 70 },
  },
};

const isRound = (p) => {
  const s = (p.productSpecifications?.details?.overall_shape || '').toLowerCase();
  return s === 'round' || s === 'oval';
};
const isSet = (p) => /\bset\b|nesting|nested|chairs|\d\s*piece|\bpiece\b/i.test(p.productId + ' ' + (p.name || ''));
const blank = (v) => typeof v !== 'string' || v.trim() === '';

function main() {
  const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const arr = Array.isArray(data) ? data : (data.products || Object.values(data));

  let touched = 0, dimFills = 0, wtFills = 0, noDef = [];

  for (const p of arr) {
    if (!NON_STONE.has(p.category)) continue;
    const sub = p.subcategory || '';
    const def = (DEF[p.category] || {})[sub];
    if (!def) { noDef.push(`${p.category}/${sub} :: ${p.productId}`); continue; }

    p.productSpecifications = p.productSpecifications || {};
    const od = p.productSpecifications.other_dimensions = p.productSpecifications.other_dimensions || {};

    const setBump = isSet(p);
    const mult = setBump ? 1.6 : 1;

    let dimStr, kg = def.kg;
    if (isRound(p) && def.round) {
      const [dia, h] = def.round;
      dimStr = `${Math.round(dia * (setBump ? 1.2 : 1))} Dia × ${h} H mm`;
    } else {
      let [w, d, h] = def.rect;
      if (setBump) { w = Math.round(w * 1.15); d = Math.round(d * 1.1); }
      dimStr = `${w} W × ${d} D × ${h} H mm`;
    }
    kg = Math.round(kg * mult);

    let changed = false;
    if (blank(od.overall_dimensions)) { od.overall_dimensions = dimStr; dimFills++; changed = true; }
    if (blank(od.overall_product_weight)) { od.overall_product_weight = `${kg} kg`; wtFills++; changed = true; }
    if (changed) {
      touched++;
      if (dimFills + wtFills <= 24) console.log(`• [${p.category}/${sub}] ${p.productId}\n    ${od.overall_dimensions}  |  ${od.overall_product_weight}`);
    }
  }

  console.log('\n──────── DIMENSION FILL SUMMARY ────────');
  console.log(`Products touched      : ${touched}`);
  console.log(`overall_dimensions    : ${dimFills} filled`);
  console.log(`overall_product_weight: ${wtFills} filled`);
  if (noDef.length) {
    console.log(`\n⚠️  No default for ${noDef.length} product(s):`);
    noDef.slice(0, 20).forEach((s) => console.log('    ' + s));
  }

  if (COMMIT) {
    fs.copyFileSync(FILE, FILE + '.bak');
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
    console.log(`\n✅ Written to ${FILE} (backup: product-specs.json.bak)`);
  } else {
    console.log('\nℹ️  DRY-RUN. Re-run with --commit to write product-specs.json.');
  }
}

main();
