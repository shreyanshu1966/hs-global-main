const mongoose = require('mongoose');
const fs = require('fs');

async function matchCloudinaryAssets() {
  await mongoose.connect('mongodb://localhost:27017/hs_global_export');

  const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('Product', productSchema);

  const assets = JSON.parse(fs.readFileSync('../cloudinary_all_api_assets.json'));
  
  // Create a map of folder -> array of secure_urls
  const folderMap = {};
  assets.forEach(asset => {
    // e.g. hs-global/furniture/etsy/HSMCOTWH5/Gemini_Generated_Image_...
    const parts = asset.public_id.split('/');
    parts.pop(); // remove filename
    const folder = parts.join('/');
    if (!folderMap[folder]) folderMap[folder] = [];
    folderMap[folder].push(asset.secure_url);
  });
  
  // Sort them alphabetically just in case
  Object.keys(folderMap).forEach(k => folderMap[k].sort());

  const products = await Product.find({});
  
  let perfectMatches = 0;
  let partialMatches = 0;
  let noMatches = 0;
  
  const report = [];

  for (const product of products) {
    const images = product.get('images') || [];
    if (images.length === 0) continue;
    
    // Find the folder from the existing images in DB
    let folder = null;
    for (let img of images) {
      let url = typeof img === 'object' ? img.url : img;
      if (url && url.includes('cloudinary.com')) {
        // e.g. https://res.cloudinary.com/dynd1aan0/image/upload/v1779285821/hs-global/furniture/etsy/HSMCOTWH5/1.webp
        const match = url.match(/upload\/v[0-9]+\/(.+)\/[^\/]+$/);
        if (match) {
          folder = match[1];
          break;
        }
      }
    }
    
    if (!folder) continue;
    
    const availableUrls = folderMap[folder] || [];
    
    if (availableUrls.length >= images.length) {
      perfectMatches++;
    } else if (availableUrls.length > 0) {
      partialMatches++;
    } else {
      noMatches++;
      report.push({
        productId: product.get('productId'),
        folder: folder,
        expectedCount: images.length,
        foundCount: 0
      });
    }
  }

  console.log(`Total Products to Match: ${products.length}`);
  console.log(`Perfect Matches (enough images in folder): ${perfectMatches}`);
  console.log(`Partial Matches (some images missing in folder): ${partialMatches}`);
  console.log(`No Matches (folder empty or not found): ${noMatches}`);
  
  if (report.length > 0) {
    console.log(`\nSample of No Matches:`);
    console.log(report.slice(0, 5));
  }
  
  mongoose.connection.close();
}

matchCloudinaryAssets().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
