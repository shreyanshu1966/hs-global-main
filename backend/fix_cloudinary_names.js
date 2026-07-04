require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function renameCloudinaryAssets() {
  await mongoose.connect('mongodb://localhost:27017/hs_global_export');

  const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('Product', productSchema);

  const assets = JSON.parse(fs.readFileSync('cloudinary_all_api_assets.json'));
  
  // Create a map of folder -> array of secure_urls
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
  
  // Sort them alphabetically to maintain consistent order
  Object.keys(folderMap).forEach(k => {
    folderMap[k].sort((a, b) => a.filename.localeCompare(b.filename));
  });

  const products = await Product.find({});
  let totalRenamed = 0;
  
  // Sequential processing for Cloudinary API rate limits
  for (const product of products) {
    const images = product.get('images') || [];
    if (images.length === 0) continue;
    
    // Find the folder and the expected filenames from the existing images in DB
    let folder = null;
    let expectedNames = [];
    
    for (let img of images) {
      let url = typeof img === 'object' ? img.url : img;
      if (url && url.includes('cloudinary.com')) {
        const match = url.match(/upload\/v[0-9]+\/(.+)\/([^\/]+)\.[a-zA-Z0-9]+$/);
        if (match) {
          folder = folder || match[1];
          expectedNames.push(match[2]);
        }
      }
    }
    
    if (!folder) continue;
    
    const availableAssets = folderMap[folder] || [];
    
    // Filter to only those assets that are wrongly named (e.g., Gemini_...)
    const badlyNamedAssets = availableAssets.filter(a => a.filename.includes('Gemini_Generated_Image') || a.filename.length > 20);
    
    if (badlyNamedAssets.length > 0) {
      console.log(`\nProduct: ${product.get('productId')}`);
      console.log(`Folder: ${folder}`);
      console.log(`Expected names: ${expectedNames.join(', ')}`);
      
      // We need to rename available assets to the expected names
      for (let i = 0; i < Math.min(badlyNamedAssets.length, expectedNames.length); i++) {
        const oldAsset = badlyNamedAssets[i];
        const newFilename = expectedNames[i];
        
        // Skip if it's already named correctly
        if (oldAsset.filename === newFilename) continue;
        
        const oldId = oldAsset.public_id;
        const newId = `${folder}/${newFilename}`;
        
        try {
          console.log(`Renaming: ${oldAsset.filename} -> ${newFilename}`);
          await cloudinary.uploader.rename(oldId, newId, { overwrite: true });
          totalRenamed++;
        } catch (err) {
          console.error(`Failed to rename ${oldId} to ${newId}:`, err.message);
        }
      }
    }
  }

  console.log(`\nFinished renaming ${totalRenamed} assets in Cloudinary.`);
  mongoose.connection.close();
}

renameCloudinaryAssets().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
