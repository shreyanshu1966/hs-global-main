const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: __dirname + '/.env' }); // Load VPS env

async function smartDryRunVPS() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
  await mongoose.connect(uri);

  const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('Product', productSchema);

  const assets = JSON.parse(fs.readFileSync('cloudinary_all_api_assets.json'));
  
  // Group assets by folder
  const folderMap = {};
  assets.forEach(asset => {
    const parts = asset.public_id.split('/');
    parts.pop(); 
    const folder = parts.join('/');
    if (!folderMap[folder]) folderMap[folder] = [];
    folderMap[folder].push(asset.secure_url);
  });
  
  // Create an array of all available folders for fuzzy matching
  const allFolders = Object.keys(folderMap);
  
  const products = await Product.find({});
  const results = [];

  for (const product of products) {
    const images = product.get('images') || [];
    if (images.length === 0) continue;
    
    // 1. Get the expected folder from DB URLs
    let expectedFolder = null;
    let productCode = null;
    for (let img of images) {
      let url = typeof img === 'object' ? img.url : img;
      if (url && url.includes('cloudinary.com')) {
        const match = url.match(/upload\/v[0-9]+\/(.+)\/([^\/]+)\.[a-zA-Z0-9]+$/);
        if (match) {
          expectedFolder = match[1];
          const codeMatch = expectedFolder.match(/etsy\/([A-Z0-9]+)$/);
          if (codeMatch) productCode = codeMatch[1];
        }
      }
    }
    
    if (!expectedFolder) continue;
    
    const productId = product.get('productId'); // e.g. travertine-side-table...
    
    // Strategy 1: Exact folder match
    let availableUrls = folderMap[expectedFolder] || [];
    let matchedFolder = expectedFolder;
    let matchStrategy = 'Strategy 1: Exact Match';
    
    // Strategy 2: Fuzzy match by Product ID / Slug
    if (availableUrls.length === 0 && productId) {
      // Find a folder that ends with the productId (or productId + "-designforages")
      const fuzzyMatch = allFolders.find(f => 
        f.endsWith(productId) || 
        f.includes(productId + '-designforages') ||
        f.includes(productId + '_designforages')
      );
      if (fuzzyMatch) {
        availableUrls = folderMap[fuzzyMatch];
        matchedFolder = fuzzyMatch;
        matchStrategy = 'Strategy 2: Slug Match';
      }
    }
    
    // Strategy 3: Fuzzy match by productCode just anywhere in the folder path
    if (availableUrls.length === 0 && productCode) {
      const fuzzyMatchCode = allFolders.find(f => f.includes(productCode));
      if (fuzzyMatchCode) {
        availableUrls = folderMap[fuzzyMatchCode];
        matchedFolder = fuzzyMatchCode;
        matchStrategy = 'Strategy 3: Code Match';
      }
    }

    const category = product.get('category') || 'Unknown';
    
    let status = '';
    if (availableUrls.length >= images.length) {
      status = 'Phase 1 Perfect';
    } else if (availableUrls.length > 0) {
      status = 'Phase 1 Partial';
    } else {
      status = 'Missing Cloudinary';
      matchStrategy = 'None';
    }
    
    results.push({
      productId: productId,
      category: category,
      originalExpectedFolder: expectedFolder,
      matchedFolder: matchedFolder,
      matchStrategy: matchStrategy,
      expectedImages: images.length,
      status: status
    });
  }

  fs.writeFileSync('vps_smart_data.json', JSON.stringify(results, null, 2));
  console.log(`Successfully generated vps_smart_data.json with Smart Matching`);

  mongoose.connection.close();
}

smartDryRunVPS().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
