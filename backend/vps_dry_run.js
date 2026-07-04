const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: __dirname + '/.env' }); // Load VPS env

async function completeDryRunVPS() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
  console.log('Connecting to Live Database:', uri);
  await mongoose.connect(uri);

  const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('Product', productSchema);

  const assets = JSON.parse(fs.readFileSync('cloudinary_all_api_assets.json'));
  
  const folderMap = {};
  assets.forEach(asset => {
    const parts = asset.public_id.split('/');
    parts.pop(); 
    const folder = parts.join('/');
    if (!folderMap[folder]) folderMap[folder] = [];
    folderMap[folder].push(asset.secure_url);
  });
  
  const products = await Product.find({});
  
  let fullyRecoveredFromCloudinary = 0;
  let partiallyRecoveredFromCloudinary = 0;
  let missingCloudinary = 0;

  for (const product of products) {
    const images = product.get('images') || [];
    if (images.length === 0) continue;
    
    let folder = null;
    for (let img of images) {
      let url = typeof img === 'object' ? img.url : img;
      if (url && url.includes('cloudinary.com')) {
        const match = url.match(/upload\/v[0-9]+\/(.+)\/([^\/]+)\.[a-zA-Z0-9]+$/);
        if (match) {
          folder = match[1];
        }
      }
    }
    
    if (!folder) continue;
    
    const availableUrls = folderMap[folder] || [];
    
    if (availableUrls.length >= images.length) {
      fullyRecoveredFromCloudinary++;
    } else if (availableUrls.length > 0) {
      partiallyRecoveredFromCloudinary++;
    } else {
      missingCloudinary++;
    }
  }

  console.log(`\n=== LIVE VPS COMPLETE DRY RUN REPORT ===`);
  console.log(`Total Products to Check in LIVE DB: ${products.length}`);
  console.log(`Perfectly match (100% images exist in Cloudinary but wrong name): ${fullyRecoveredFromCloudinary}`);
  console.log(`Partially match (Some images exist in Cloudinary): ${partiallyRecoveredFromCloudinary}`);
  console.log(`Zero match (0 images in Cloudinary for this folder): ${missingCloudinary}`);
  console.log(`=========================================\n`);

  mongoose.connection.close();
}

completeDryRunVPS().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
