const mongoose = require('mongoose');
const fs = require('fs');

async function dryRunMatchAssets() {
  await mongoose.connect('mongodb://localhost:27017/hs_global_export');

  const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('Product', productSchema);

  const assets = JSON.parse(fs.readFileSync('../cloudinary_all_api_assets.json'));
  
  // Create a map of folder -> array of secure_urls
  const folderMap = {};
  assets.forEach(asset => {
    const parts = asset.public_id.split('/');
    parts.pop(); // remove filename
    const folder = parts.join('/');
    if (!folderMap[folder]) folderMap[folder] = [];
    folderMap[folder].push(asset.secure_url);
  });
  
  // Sort them alphabetically
  Object.keys(folderMap).forEach(k => folderMap[k].sort());

  const products = await Product.find({});
  
  const proposedUpdates = [];

  for (const product of products) {
    const images = product.get('images') || [];
    if (images.length === 0) continue;
    
    // Find the folder from the existing images in DB
    let folder = null;
    for (let img of images) {
      let url = typeof img === 'object' ? img.url : img;
      if (url && url.includes('cloudinary.com')) {
        const match = url.match(/upload\/v[0-9]+\/(.+)\/[^\/]+$/);
        if (match) {
          folder = match[1];
          break;
        }
      }
    }
    
    if (!folder) continue;
    
    const availableUrls = folderMap[folder] || [];
    
    // Perfect match (enough available URLs to replace all missing images)
    if (availableUrls.length >= images.length) {
      // Build the new array
      const newImages = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const newUrl = availableUrls[i];
        if (typeof img === 'object') {
          newImages.push({ ...img, url: newUrl }); // keep original properties (like alt text) if they exist
        } else {
          newImages.push(newUrl);
        }
      }
      
      proposedUpdates.push({
        productId: product.get('productId'),
        folder: folder,
        originalCount: images.length,
        newCount: newImages.length,
        originalSample: images[0],
        newSample: newImages[0],
        allNewUrls: newImages.map(img => typeof img === 'object' ? img.url : img)
      });
    }
  }

  fs.writeFileSync('dry_run_report.json', JSON.stringify(proposedUpdates, null, 2));

  console.log(`Dry Run Complete!`);
  console.log(`Proposed updates for ${proposedUpdates.length} products saved to dry_run_report.json`);
  
  if (proposedUpdates.length > 0) {
    console.log(`\nSample (First Product):`);
    console.log(JSON.stringify(proposedUpdates[0], null, 2));
  }

  mongoose.connection.close();
}

dryRunMatchAssets().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
