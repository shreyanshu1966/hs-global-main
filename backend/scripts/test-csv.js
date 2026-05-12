const fs = require('fs');

const csvContent = fs.readFileSync('d:/hs-global-main/new products/Latest Etsy & HS All Product Title Desc  April -May 2026 -  marble  Listing  (2).csv', 'utf-8');

function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (inQuotes) {
            if (char === '"' && text[i + 1] === '"') {
                currentCell += '"';
                i++;
            } else if (char === '"') {
                inQuotes = false;
            } else {
                currentCell += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                currentRow.push(currentCell);
                currentCell = '';
            } else if (char === '\n' || char === '\r') {
                if (char === '\r' && text[i + 1] === '\n') i++;
                currentRow.push(currentCell);
                rows.push(currentRow);
                currentRow = [];
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
    }
    if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell);
        rows.push(currentRow);
    }
    return rows;
}

const rows = parseCSV(csvContent);

console.log('Row 1 (Headers):');
rows[1].forEach((col, i) => console.log(`${i}: ${col}`));

console.log('\nRow 2 (Sub-Headers):');
rows[2].forEach((col, i) => console.log(`${i}: ${col}`));

console.log('\nRow 3 (First Data Row):');
rows[3].forEach((col, i) => {
    console.log(`${i}: ${col ? col.substring(0, 60) : ''}`);
});
