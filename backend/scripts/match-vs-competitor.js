#!/usr/bin/env node
'use strict';
/** Read-only: match our semi-precious-stone products (semi-precious-stone-live.json)
 * against the competitor's product list (precious-gem-surfaces-products.json) by
 * product name, and compare starting prices per sq. ft. */
const fs = require('fs');
const path = require('path');

const ours = require('./semi-precious-stone-live.json');
const theirs = require('./precious-gem-surfaces-products.json');

const STOPWORDS = new Set(['slab', 'slabs', 'stone', 'semi', 'precious', 'gemstone']);
const SYNONYMS = { mop: ['mother', 'of', 'pearl'] };

function normalize(name) {
  const spaced = name.replace(/([a-z])([A-Z])/g, '$1 $2'); // BlueAgate -> Blue Agate
  const tokens = spaced
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !STOPWORDS.has(t))
    .flatMap((t) => SYNONYMS[t] || [t]);
  return tokens;
}

function tokenKey(tokens) {
  return [...tokens].sort().join(' ');
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

// Two tokens are considered the "same" if they're an exact match or within a
// small edit-distance tolerance scaled to token length — the competitor site
// has inconsistent spelling for the same product (e.g. "Abalone"/"Abelone",
// "Carnelian"/"Carnalin", "Smoky"/"Smokey", "Hematite"/"Hemotied", "Lapis"/"Lapiz").
function tokensMatch(t1, t2) {
  if (t1 === t2) return true;
  const dist = levenshtein(t1, t2);
  const tolerance = Math.max(1, Math.floor(Math.min(t1.length, t2.length) / 4));
  return dist <= tolerance;
}

// Dice-like coefficient using fuzzy (near-typo) token matching instead of exact set equality.
function fuzzyTokenScore(a, b) {
  if (a.length === 0 || b.length === 0) return 0;
  const bRemaining = [...b];
  let matched = 0;
  for (const t of a) {
    const idx = bRemaining.findIndex((t2) => tokensMatch(t, t2));
    if (idx !== -1) {
      matched++;
      bRemaining.splice(idx, 1);
    }
  }
  return (2 * matched) / (a.length + b.length);
}

function parsePrice(str) {
  if (!str) return null;
  const m = str.match(/[\d,]+(\.\d+)?/);
  return m ? Number(m[0].replace(/,/g, '')) : null;
}

function ourPrice(p) {
  if (p.pricePerSqFt != null) return p.pricePerSqFt;
  if (p.stoneSpecs && p.stoneSpecs.priceRange) return parsePrice(p.stoneSpecs.priceRange);
  return null;
}

const theirsNormalized = theirs.map((p) => ({
  ...p,
  tokens: normalize(p.name),
  price: parsePrice(p.startingPrice),
}));
const theirsByKey = new Map();
for (const p of theirsNormalized) {
  const key = tokenKey(p.tokens);
  if (!theirsByKey.has(key)) theirsByKey.set(key, []);
  theirsByKey.get(key).push(p);
}

const FUZZY_THRESHOLD = 0.6;
const results = [];

for (const our of ours) {
  const ourTokens = normalize(our.name);
  const ourKey = tokenKey(ourTokens);
  let match = null;
  let matchType = 'none';
  let score = 0;

  if (theirsByKey.has(ourKey)) {
    match = theirsByKey.get(ourKey)[0];
    matchType = 'exact';
    score = 1;
  } else {
    let best = null;
    let bestScore = 0;
    for (const cand of theirsNormalized) {
      const s = fuzzyTokenScore(ourTokens, cand.tokens);
      if (s > bestScore) {
        bestScore = s;
        best = cand;
      }
    }
    if (best && bestScore >= FUZZY_THRESHOLD) {
      match = best;
      matchType = 'fuzzy';
      score = bestScore;
    }
  }

  const ourPriceValue = ourPrice(our);
  results.push({
    ourProductId: our.productId,
    ourName: our.name,
    ourSubcategory: our.subcategory,
    ourPricePerSqFt: ourPriceValue,
    matchType,
    matchScore: Number(score.toFixed(2)),
    competitorName: match ? match.name : null,
    competitorUrl: match ? match.url : null,
    competitorPricePerSqFt: match ? match.price : null,
    priceDiffINR: match && ourPriceValue != null && match.price != null
      ? ourPriceValue - match.price
      : null,
  });
}

const matchedCompetitorNames = new Set(
  results.filter((r) => r.matchType !== 'none').map((r) => r.competitorName)
);
const unmatchedCompetitorProducts = theirs.filter((p) => !matchedCompetitorNames.has(p.name));

const outPath = path.join(__dirname, 'product-match-report.json');
fs.writeFileSync(
  outPath,
  JSON.stringify({ matches: results, unmatchedCompetitorProducts }, null, 2)
);

const exact = results.filter((r) => r.matchType === 'exact').length;
const fuzzy = results.filter((r) => r.matchType === 'fuzzy').length;
const none = results.filter((r) => r.matchType === 'none').length;

console.log(`Our products: ${ours.length}`);
console.log(`Exact matches: ${exact}`);
console.log(`Fuzzy matches (>= ${FUZZY_THRESHOLD}): ${fuzzy}`);
console.log(`No match found: ${none}`);
console.log(`Competitor products with no match on our side: ${unmatchedCompetitorProducts.length}`);
console.log(`Wrote ${outPath}`);

console.log('\n--- Unmatched (ours) ---');
results.filter((r) => r.matchType === 'none').forEach((r) => console.log(' -', r.ourName));

console.log('\n--- Fuzzy matches (review these) ---');
results.filter((r) => r.matchType === 'fuzzy').forEach((r) =>
  console.log(` - ${r.ourName}  <->  ${r.competitorName}  (score ${r.matchScore})`)
);
