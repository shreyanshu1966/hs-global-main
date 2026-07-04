require('dotenv').config({ path: __dirname + '/backend/.env' });
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getDirectories(srcPath) {
  try {
    return fs.readdirSync(srcPath).filter(file => fs.statSync(path.join(srcPath, file)).isDirectory()).map(d => path.join(srcPath, d));
  } catch(e) {
    return [];
  }
}

const baseDirs = [
  'D:\\hs-global-main\\new products\\Etsy All Product Photos',
  'D:\\hs-global-main\\new products\\Leather Products',
  'D:\\hs-global-main\\new products\\HANDICRAFT PRODUCTS'
];

let allLocalFolders = [];
for (const bd of baseDirs) {
  allLocalFolders = allLocalFolders.concat(getDirectories(bd));
}

async function implementPhase2() {
  const data = JSON.parse(fs.readFileSync('vps_smart_data.json'));
  let totalUploaded = 0;

  for (const item of data) {
    if (item.status === 'Missing Cloudinary') {
      const folder = item.originalExpectedFolder;
      const expectedImages = item.expectedImages;
      
      const productCodeMatch = folder ? folder.match(/\/([A-Z0-9]{5,15})$/i) : null;
      let matchedLocalPath = null;
      
      const searchTerms = [];
      if (productCodeMatch) searchTerms.push(productCodeMatch[1]);
      if (item.productId) {
        searchTerms.push(item.productId.replace(/-/g, ' '));
        searchTerms.push(item.productId);
      }
      
      for (const localFolder of allLocalFolders) {
        const folderName = path.basename(localFolder).toLowerCase();
        let isMatch = false;
        
        for (const term of searchTerms) {
          if (folderName.includes(term.toLowerCase())) {
            isMatch = true;
            break;
          }
        }
        
        if (isMatch) {
          try {
            const localFiles = fs.readdirSync(localFolder);
            const imageFiles = localFiles.filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
            if (imageFiles.length > 0) {
              matchedLocalPath = localFolder;
              break;
            }
          } catch(e) {}
        }
      }
      
      if (matchedLocalPath) {
        console.log(`\nProduct: ${item.productId} | Found Local: ${matchedLocalPath}`);
        
        const localFiles = fs.readdirSync(matchedLocalPath);
        const imageFiles = localFiles.filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
        // Sort files to try and maintain order
        imageFiles.sort((a,b) => a.localeCompare(b));
        
        // Upload images one by one
        for (let i = 0; i < Math.min(imageFiles.length, expectedImages); i++) {
          const filePath = path.join(matchedLocalPath, imageFiles[i]);
          const newFilename = `${i + 1}`; // expected names are 1, 2, 3...
          const publicId = `${folder}/${newFilename}`;
          
          try {
            console.log(`Uploading: ${imageFiles[i]} -> ${publicId}`);
            await cloudinary.uploader.upload(filePath, {
              public_id: publicId,
              overwrite: true,
              resource_type: "image"
            });
            totalUploaded++;
          } catch(err) {
            console.error(`Upload Failed: ${err.message}`);
          }
        }
      }
    }
  }
  
  console.log(`\n=== PHASE 2 COMPLETE ===`);
  console.log(`Total Files Uploaded from Local: ${totalUploaded}`);
}

implementPhase2().catch(err => {
  console.error(err);
});
