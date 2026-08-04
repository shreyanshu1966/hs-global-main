const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function completeDryRun() {
  await mongoose.connect('mongodb://localhost:27017/hs_global_export');

  const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('Product', productSchema);

  const assets = JSON.parse(fs.readFileSync('../cloudinary_all_api_assets.json'));
  
  // Create a map of folder -> array of secure_urls for Cloudinary matched images
  const folderMap = {};
  assets.forEach(asset => {
    const parts = asset.public_id.split('/');
    parts.pop(); // remove filename
    const folder = parts.join('/');
    if (!folderMap[folder]) folderMap[folder] = [];
    folderMap[folder].push(asset.secure_url);
  });
  
  // Get all local folders for fallback
  const localDir = 'D:\\hs-global-main\\new products\\Etsy All Product Photos';
  let localFolders = [];
  try {
    localFolders = fs.readdirSync(localDir);
  } catch(e) {
    console.error("Local folder not found:", e.message);
  }

  const products = await Product.find({});
  
  let fullyRecoveredFromCloudinary = 0;
  let partiallyRecoveredFromCloudinary = 0;
  let fullyRecoverableFromLocal = 0;
  let partiallyRecoverableFromLocal = 0;
  let completelyMissing = 0;

  for (const product of products) {
    const images = product.get('images') || [];
    if (images.length === 0) continue;
    
    // Find the folder from the existing images in DB
    let folder = null;
    let expectedNames = [];
    for (let img of images) {
      let url = typeof img === 'object' ? img.url : img;
      if (url && url.includes('cloudinary.com')) {
        const match = url.match(/upload\/v[0-9]+\/(.+)\/([^\/]+)\.[a-zA-Z0-9]+$/);
        if (match) {
          folder = match[1];
          expectedNames.push(match[2]);
        }
      }
    }
    
    if (!folder) continue;
    
    const availableUrls = folderMap[folder] || [];
    
    // Check Cloudinary First
    if (availableUrls.length >= images.length) {
      fullyRecoveredFromCloudinary++;
    } else if (availableUrls.length > 0) {
      partiallyRecoveredFromCloudinary++;
    } else {
      // Fallback: Check local disk
      const productCodeMatch = folder.match(/etsy\/([A-Z0-9]+)$/);
      let foundLocalCount = 0;
      
      if (productCodeMatch) {
        const productCode = productCodeMatch[1];
        // Find a folder in local disk that contains the product code
        const matchingLocalFolder = localFolders.find(f => f.includes(productCode));
        if (matchingLocalFolder) {
          try {
            const localPath = path.join(localDir, matchingLocalFolder);
            const localFiles = fs.readdirSync(localPath);
            const imageFiles = localFiles.filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
            foundLocalCount = imageFiles.length;
          } catch(e) {}
        }
      }
      
      if (foundLocalCount >= images.length) {
        fullyRecoverableFromLocal++;
      } else if (foundLocalCount > 0) {
        partiallyRecoverableFromLocal++;
      } else {
        completelyMissing++;
      }
    }
  }

  console.log(`=== COMPLETE DRY RUN REPORT ===`);
  console.log(`Total Products to Check: ${products.length}`);
  console.log(`\n-- PHASE 1: Cloudinary API Fix (Instant) --`);
  console.log(`Perfectly fixed (100% images restored): ${fullyRecoveredFromCloudinary}`);
  console.log(`Partially fixed (Some images restored): ${partiallyRecoveredFromCloudinary}`);
  
  console.log(`\n-- PHASE 2: Local Fallback Upload --`);
  console.log(`Products to fix from Local Disk: ${products.length - (fullyRecoveredFromCloudinary + partiallyRecoveredFromCloudinary)}`);
  console.log(`Fully Recoverable from Local Disk (100% images found locally): ${fullyRecoverableFromLocal}`);
  console.log(`Partially Recoverable from Local (Some images found locally): ${partiallyRecoverableFromLocal}`);
  
  console.log(`\n-- CONCLUSION --`);
  console.log(`COMPLETELY MISSING (No Cloudinary match AND No Local match): ${completelyMissing}`);

  mongoose.connection.close();
}

completeDryRun().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
