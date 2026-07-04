const fs = require('fs');
const path = require('path');

function generateCategoryBreakdown() {
  const data = JSON.parse(fs.readFileSync('vps_full_data.json'));
  
  const localDir = 'D:\\hs-global-main\\new products\\Etsy All Product Photos';
  let localFolders = [];
  try {
    localFolders = fs.readdirSync(localDir);
  } catch(e) {}

  const categories = {};

  for (const item of data) {
    let finalStatus = item.status;
    let category = item.category || 'Unknown';
    
    // If it is 'Unknown', maybe we can guess from folder
    if (category === 'Unknown' || category === '') {
      if (item.folder) {
        const parts = item.folder.split('/');
        if (parts.length > 2) {
          category = parts[1] + '/' + parts[2]; // e.g. furniture/etsy
        } else {
          category = parts[1] || 'misc';
        }
      } else {
        category = 'misc';
      }
    }
    
    if (item.status === 'Missing Cloudinary') {
      // Run local fallback logic
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
        finalStatus = 'Phase 2 Local Perfect';
      } else if (foundLocalCount > 0) {
        finalStatus = 'Phase 2 Local Partial';
      } else {
        finalStatus = 'Completely Missing';
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
  
  // Format output as Markdown for easy reading
  console.log(`### 📊 Category-Wise Dry Run Breakdown\n`);
  
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
    console.log(`- **Phase 1 Fix** (Instant Cloudinary Rename): ${stats.phase1_perfect} Perfect | ${stats.phase1_partial} Partial`);
    console.log(`- **Phase 2 Fix** (Local Disk Upload Fallback): ${stats.phase2_perfect} Perfect | ${stats.phase2_partial} Partial`);
    console.log(`- **❌ Completely Missing**: ${stats.completely_missing}`);
    console.log('');
  }
  
  console.log(`#### **Grand Total** (Total: ${grandTotal.total})`);
  console.log(`- **Phase 1 Fix** (Instant Cloudinary Rename): ${grandTotal.p1Perf} Perfect | ${grandTotal.p1Part} Partial`);
  console.log(`- **Phase 2 Fix** (Local Disk Upload Fallback): ${grandTotal.p2Perf} Perfect | ${grandTotal.p2Part} Partial`);
  console.log(`- **❌ Completely Missing**: ${grandTotal.missing}`);
}

generateCategoryBreakdown();
