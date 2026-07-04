const fs = require('fs');
const path = require('path');

function localFallbackCheck() {
  const data = JSON.parse(fs.readFileSync('vps_missing_data.json'));
  
  const localDir = 'D:\\hs-global-main\\new products\\Etsy All Product Photos';
  let localFolders = [];
  try {
    localFolders = fs.readdirSync(localDir);
  } catch(e) {
    console.error("Local folder not found:", e.message);
  }

  let fullyRecoverableFromLocal = 0;
  let partiallyRecoverableFromLocal = 0;
  let completelyMissing = 0;
  
  const report = [];

  for (const item of data.missingData) {
    const folder = item.folder;
    const imagesCount = item.expectedImages;
    
    const productCodeMatch = folder.match(/etsy\/([A-Z0-9]+)$/);
    let foundLocalCount = 0;
    
    if (productCodeMatch) {
      const productCode = productCodeMatch[1];
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
    
    if (foundLocalCount >= imagesCount) {
      fullyRecoverableFromLocal++;
    } else if (foundLocalCount > 0) {
      partiallyRecoverableFromLocal++;
    } else {
      completelyMissing++;
      report.push(item);
    }
  }

  console.log(`=== LIVE VPS COMPLETE DRY RUN REPORT (With Local Fallback) ===`);
  console.log(`Total Products to Check in LIVE DB: ${data.totalProducts}`);
  
  console.log(`\n-- PHASE 1: Cloudinary API Fix (Instant) --`);
  console.log(`Perfectly fixed (100% images restored via renaming): ${data.fullyRecoveredFromCloudinary}`);
  console.log(`Partially fixed (Some images restored via renaming): ${data.partiallyRecoveredFromCloudinary}`);
  
  console.log(`\n-- PHASE 2: Local Fallback Upload --`);
  console.log(`Products to fix from Local Disk: ${data.missingData.length}`);
  console.log(`Fully Recoverable from Local Disk (100% images found locally): ${fullyRecoverableFromLocal}`);
  console.log(`Partially Recoverable from Local Disk (Some images found locally): ${partiallyRecoverableFromLocal}`);
  
  console.log(`\n-- CONCLUSION --`);
  console.log(`COMPLETELY MISSING (No Cloudinary match AND No Local match): ${completelyMissing}`);
  
  fs.writeFileSync('vps_missing_report.json', JSON.stringify(report, null, 2));
}

localFallbackCheck();
