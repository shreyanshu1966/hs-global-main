const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: __dirname + '/.env' }); // Load VPS env

async function completeDryRunVPS() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
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
  const results = [];

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
    const category = product.get('category') || 'Unknown';
    
    let status = '';
    if (availableUrls.length >= images.length) {
      status = 'Phase 1 Perfect';
    } else if (availableUrls.length > 0) {
      status = 'Phase 1 Partial';
    } else {
      status = 'Missing Cloudinary';
    }
    
    results.push({
      productId: product.get('productId'),
      category: category,
      folder: folder,
      expectedImages: images.length,
      status: status
    });
  }

  // Save the full data to JSON
  fs.writeFileSync('vps_full_data.json', JSON.stringify(results, null, 2));
  console.log(`Successfully generated vps_full_data.json`);

  mongoose.connection.close();
}

completeDryRunVPS().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
