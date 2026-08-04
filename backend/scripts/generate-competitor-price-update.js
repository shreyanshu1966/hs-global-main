#!/usr/bin/env node
'use strict';
/** Read-only: for every EXACT-matched product (product-match-report.json),
 * compute newPriceINR = competitor's starting price/sqft + 1000, and write a
 * JSON ready to be applied to the live DB (pricePerSqFt + stoneSpecs.priceRange). */
const fs = require('fs');
const path = require('path');

const MARKUP = 1000;
const report = require('./product-match-report.json');

const exactMatches = report.matches.filter(
  (m) => m.matchType === 'exact' && m.competitorPricePerSqFt != null
);

const priceUpdates = exactMatches.map((m) => {
  const newPriceINR = m.competitorPricePerSqFt + MARKUP;
  return {
    productId: m.ourProductId,
    name: m.ourName,
    subcategory: m.ourSubcategory,
    currentPriceINR: m.ourPricePerSqFt,
    competitorPriceINR: m.competitorPricePerSqFt,
    competitorUrl: m.competitorUrl,
    newPriceINR,
    newPriceRangeText: `Starting From INR ${newPriceINR}/ SQFT.`,
  };
});

const outPath = path.join(__dirname, 'competitor-based-price-update.json');
fs.writeFileSync(outPath, JSON.stringify(priceUpdates, null, 2));

console.log(`Exact-matched products with competitor price: ${exactMatches.length}`);
console.log(`Wrote ${outPath}`);
console.log('\nSample:');
console.log(JSON.stringify(priceUpdates.slice(0, 5), null, 2));
