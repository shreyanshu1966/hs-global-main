const fs = require('fs');
const path = require('path');

function getDirectories(srcPath) {
  try {
    return fs.readdirSync(srcPath).filter(file => fs.statSync(path.join(srcPath, file)).isDirectory()).map(d => path.join(srcPath, d));
  } catch(e) {
    return [];
  }
}

// Get all subdirectories across the three main folders
const baseDirs = [
  'D:\\hs-global-main\\new products\\Etsy All Product Photos',
  'D:\\hs-global-main\\new products\\Leather Products',
  'D:\\hs-global-main\\new products\\HANDICRAFT PRODUCTS'
];

let allLocalFolders = [];
for (const bd of baseDirs) {
  allLocalFolders = allLocalFolders.concat(getDirectories(bd));
}

function deepScanLocal() {
  const data = JSON.parse(fs.readFileSync('vps_smart_data.json'));
  
  let newlyFoundFully = 0;
  let newlyFoundPartially = 0;
  let stillMissing = 0;
  
  const categories = {};

  for (const item of data) {
    let finalStatus = item.status;
    let category = item.category || 'Unknown';
    
    if (category === 'Unknown' || category === '') {
      if (item.originalExpectedFolder) {
        const parts = item.originalExpectedFolder.split('/');
        if (parts.length > 2) {
          category = parts[1] + '/' + parts[2];
        } else {
          category = parts[1] || 'misc';
        }
      } else {
        category = 'misc';
      }
    }
    
    // We only need to deeply scan the ones that were missing in Cloudinary
    if (item.status === 'Missing Cloudinary') {
      const folder = item.originalExpectedFolder;
      const imagesCount = item.expectedImages;
      
      const productCodeMatch = folder ? folder.match(/\/([A-Z0-9]{5,15})$/i) : null;
      let foundLocalCount = 0;
      let matchedLocalPath = null;
      
      // We can try to match by product code OR by the product slug (item.productId)
      const searchTerms = [];
      if (productCodeMatch) searchTerms.push(productCodeMatch[1]);
      if (item.productId) {
        // use words from slug, or just the slug
        searchTerms.push(item.productId.replace(/-/g, ' '));
        searchTerms.push(item.productId);
      }
      
      // Find a local folder that matches any of the search terms
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
              foundLocalCount = imageFiles.length;
              matchedLocalPath = localFolder;
              break;
            }
          } catch(e) {}
        }
      }
      
      if (foundLocalCount >= imagesCount) {
        finalStatus = 'Phase 2 Local Perfect';
        newlyFoundFully++;
      } else if (foundLocalCount > 0) {
        finalStatus = 'Phase 2 Local Partial';
        newlyFoundPartially++;
      } else {
        finalStatus = 'Completely Missing';
        stillMissing++;
      }
    }
    
    if (!categories[category]) {
      categories[category] = {
        total: 0,
        phase1_perfect: 0,
        phase1_partial: 0,
        phase2_perfect: 0,
        phase2_partial: 0,
        completely_missing: 0
      };
    }
    
    categories[category].total++;
    
    if (finalStatus === 'Phase 1 Perfect') categories[category].phase1_perfect++;
    else if (finalStatus === 'Phase 1 Partial') categories[category].phase1_partial++;
    else if (finalStatus === 'Phase 2 Local Perfect') categories[category].phase2_perfect++;
    else if (finalStatus === 'Phase 2 Local Partial') categories[category].phase2_partial++;
    else categories[category].completely_missing++;
  }
  
  console.log(`### 🚀 DEEP SCAN Category-Wise Breakdown (Checking ALL local folders)\n`);
  
  const sortedCategories = Object.keys(categories).sort();
  let grandTotal = { total: 0, p1Perf: 0, p1Part: 0, p2Perf: 0, p2Part: 0, missing: 0 };
  
  for (const cat of sortedCategories) {
    const stats = categories[cat];
    grandTotal.total += stats.total;
    grandTotal.p1Perf += stats.phase1_perfect;
    grandTotal.p1Part += stats.phase1_partial;
    grandTotal.p2Perf += stats.phase2_perfect;
    grandTotal.p2Part += stats.phase2_partial;
    grandTotal.missing += stats.completely_missing;
    
    console.log(`#### Category: **${cat}** (Total: ${stats.total})`);
    console.log(`- **Phase 1 Fix** (Cloudinary Rename): ${stats.phase1_perfect} Perfect | ${stats.phase1_partial} Partial`);
    console.log(`- **Phase 2 Fix** (Local Disk Upload): ${stats.phase2_perfect} Perfect | ${stats.phase2_partial} Partial`);
    console.log(`- **❌ Completely Missing**: ${stats.completely_missing}\n`);
  }
  
  console.log(`#### **Grand Total** (Total: ${grandTotal.total})`);
  console.log(`- **Phase 1 Fix** (Cloudinary Rename): ${grandTotal.p1Perf} Perfect | ${grandTotal.p1Part} Partial`);
  console.log(`- **Phase 2 Fix** (Local Disk Upload): ${grandTotal.p2Perf} Perfect | ${grandTotal.p2Part} Partial`);
  console.log(`- **❌ Completely Missing**: ${grandTotal.missing}`);
}

deepScanLocal();
