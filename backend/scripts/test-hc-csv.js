const fs = require('fs');
const { parse } = require('csv-parse/sync');

const text = fs.readFileSync('d:/hs-global-main/new products/Latest Etsy & HS All Product Title Desc  April -May 2026 - handicraft product listing.csv', 'utf8');
const records = parse(text);

console.log('Row 0 headers:', records[0].map((v, i) => `${i}: ${v}`));
console.log('Row 1 headers:', records[1].map((v, i) => `${i}: ${v}`));
console.log('Row 2 data:', records[2].map((v, i) => `${i}: ${v.substring(0, 30)}`));
