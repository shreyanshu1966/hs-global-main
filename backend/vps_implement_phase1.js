const mongoose = require('mongoose');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: __dirname + '/.env' }); // Load VPS env

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function implementPhase1() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
  await mongoose.connect(uri);

  const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('Product', productSchema);

  const assets = JSON.parse(fs.readFileSync('cloudinary_all_api_assets.json'));
  
  // Group assets by folder, storing full asset objects
  const folderMap = {};
  assets.forEach(asset => {
    const parts = asset.public_id.split('/');
    const filename = parts.pop(); 
    const folder = parts.join('/');
    if (!folderMap[folder]) folderMap[folder] = [];
    folderMap[folder].push({
      public_id: asset.public_id,
      filename: filename
    });
  });
  
  // Sort alphabetically so Gemini images map to 1,2,3 consistently
  Object.keys(folderMap).forEach(k => {
    folderMap[k].sort((a, b) => a.filename.localeCompare(b.filename));
  });

  const allFolders = Object.keys(folderMap);
  const products = await Product.find({});
  let totalRenamed = 0;

  for (const product of products) {
    const images = product.get('images') || [];
    if (images.length === 0) continue;
    
    let expectedFolder = null;
    let expectedNames = [];
    let productCode = null;
    
    for (let img of images) {
      let url = typeof img === 'object' ? img.url : img;
      if (url && url.includes('cloudinary.com')) {
        const match = url.match(/upload\/v[0-9]+\/(.+)\/([^\/]+)\.[a-zA-Z0-9]+$/);
        if (match) {
          expectedFolder = match[1];
          expectedNames.push(match[2]);
          const codeMatch = expectedFolder.match(/etsy\/([A-Z0-9]+)$/);
          if (codeMatch) productCode = codeMatch[1];
        }
      }
    }
    
    if (!expectedFolder) continue;
    const productId = product.get('productId');
    
    let availableAssets = folderMap[expectedFolder] || [];
    let matchedFolder = expectedFolder;
    
    if (availableAssets.length === 0 && productId) {
      const fuzzyMatch = allFolders.find(f => f.endsWith(productId) || f.includes(productId + '-designforages') || f.includes(productId + '_designforages'));
      if (fuzzyMatch) { availableAssets = folderMap[fuzzyMatch]; matchedFolder = fuzzyMatch; }
    }
    
    if (availableAssets.length === 0 && productCode) {
      const fuzzyMatchCode = allFolders.find(f => f.includes(productCode));
      if (fuzzyMatchCode) { availableAssets = folderMap[fuzzyMatchCode]; matchedFolder = fuzzyMatchCode; }
    }
    
    if (availableAssets.length > 0) {
      // We have assets to map to this product.
      console.log(`\nProduct: ${productId} | Mapped: ${matchedFolder} -> ${expectedFolder}`);
      
      const poorlyNamedAssets = availableAssets.filter(a => a.filename.includes('Gemini') || a.filename.includes('WhatsApp') || a.filename.length > 15);
      // Actually we should just take all available assets and map them to expected names 1, 2, 3...
      // IF they are not already named exactly as expected.
      let assetsToMap = poorlyNamedAssets.length > 0 ? poorlyNamedAssets : availableAssets;

      for (let i = 0; i < Math.min(assetsToMap.length, expectedNames.length); i++) {
        const oldAsset = assetsToMap[i];
        const newFilename = expectedNames[i];
        
        const oldId = oldAsset.public_id;
        const newId = `${expectedFolder}/${newFilename}`; // Move/rename exactly to what DB wants
        
        if (oldId === newId) continue; // Already correct
        
        try {
          console.log(`Renaming/Moving: ${oldId} -> ${newId}`);
          await cloudinary.uploader.rename(oldId, newId, { overwrite: true });
          totalRenamed++;
        } catch (err) {
          console.error(`Failed: ${err.message}`);
        }
      }
    }
  }

  console.log(`\n=== PHASE 1 COMPLETE ===`);
  console.log(`Total Assets Renamed/Moved: ${totalRenamed}`);
  mongoose.connection.close();
}

implementPhase1().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
