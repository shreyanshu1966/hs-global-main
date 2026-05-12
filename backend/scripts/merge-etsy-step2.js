const fs = require('fs');
const path = require('path');

const step1Path = path.join(__dirname, 'etsy-products-data-step1.json');
const step2Path = path.join(__dirname, 'etsy-products-data-step2.json');

try {
    const step1Data = JSON.parse(fs.readFileSync(step1Path, 'utf-8'));
    const step2Data = JSON.parse(fs.readFileSync(step2Path, 'utf-8'));

    // Create a lookup map of productCode -> cloudinaryUrls from old step2
    const urlMap = {};
    for (const prod of step2Data) {
        urlMap[prod.productCode] = prod.cloudinaryUrls || [];
    }

    // Merge URLs into the fresh step1 data
    const newStep2Data = step1Data.map(prod => {
        return {
            ...prod,
            cloudinaryUrls: urlMap[prod.productCode] || []
        };
    });

    // Overwrite step 2 file with the merged data
    fs.writeFileSync(step2Path, JSON.stringify(newStep2Data, null, 2));

    console.log(`✅ Successfully merged Cloudinary URLs into fresh CSV data!`);
    console.log(`✅ Saved ${newStep2Data.length} products to etsy-products-data-step2.json`);
    console.log(`👉 You can now run: node scripts/migrate-etsy-products.js --step=3`);
} catch (err) {
    console.error('❌ Error merging step 1 and step 2:', err.message);
}
