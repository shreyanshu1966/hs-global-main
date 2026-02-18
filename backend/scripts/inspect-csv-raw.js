const fs = require('fs');
const path = require('path');

const CSV_FILE_PATH = path.join(__dirname, '../../All in One Hs Global & Etsy Data Update - All Pages.csv');

// Read first 2000 characters
const content = fs.readFileSync(CSV_FILE_PATH, 'utf8').slice(0, 2000);

console.log('=== First 2000 characters of CSV ===\n');
console.log(content);
console.log('\n=== Character codes of first line ===');

const firstLine = content.split('\n')[0];
const charCodes = [];
for (let i = 0; i < Math.min(50, firstLine.length); i++) {
  charCodes.push(`${firstLine[i]} (${firstLine.charCodeAt(i)})`);
}
console.log(charCodes.join(', '));
