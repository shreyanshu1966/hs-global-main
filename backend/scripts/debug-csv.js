/**
 * Debug CSV Parser - Check what's being read from CSV
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const CSV_FILE_PATH = path.join(__dirname, '../../All in One Hs Global & Etsy Data Update - All Pages.csv');

console.log('📁 Reading CSV from:', CSV_FILE_PATH);
console.log('\n--- First 10 rows ---\n');

let count = 0;

fs.createReadStream(CSV_FILE_PATH)
  .pipe(csv({
    skipEmptyLines: true,
    trim: true
  }))
  .on('data', (row) => {
    count++;
    
    if (count <= 10) {
      console.log(`Row ${count}:`);
      console.log('  Keys:', Object.keys(row));
      console.log('  url:', row.url || row.URL || '(not found)');
      console.log('  H1 Tag:', row['H1 Tag'] || '(not found)');
      console.log('  Title:', row.Title || '(not found)');
      console.log('  Has /products/:', (row.url || '').includes('/products/'));
      console.log('');
    }
  })
  .on('end', () => {
    console.log(`\nTotal rows: ${count}`);
  })
  .on('error', (error) => {
    console.error('Error:', error.message);
  });
