const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function analyze() {
  let output = '';
  function log(msg) {
    output += msg + '\n';
    console.log(msg);
  }

  try {
    await mongoose.connect('mongodb://localhost:27017/hs_global_export');
    log('✅ Connected to Database');

    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

    // 1. Missing Images
    const missingImages = await Product.find({
      $or: [
        { image: { $in: [null, '', undefined] } },
        { image: { $exists: false } },
        { images: { $size: 0 } },
        { images: { $exists: false } }
      ]
    }, 'productId name subcategory image images');

    log('\n=======================================');
    log(`🖼️ PRODUCTS MISSING IMAGES: ${missingImages.length}`);
    log('=======================================');
    if (missingImages.length > 0) {
      missingImages.forEach((p, idx) => {
        const title = p.name ? p.name.substring(0, 50) : 'Unnamed';
        log(`${idx + 1}. [${p.productId}] ${title}...`);
      });
    } else {
      log('All products have images! 🎉');
    }

    // 2. Subcategories
    const subcats = await Product.aggregate([
      { $group: { _id: '$subcategory', count: { $sum: 1 }, sampleName: { $first: '$name' } } },
      { $sort: { count: -1 } }
    ]);

    log('\n=======================================');
    log(`📂 SUBCATEGORY MAPPING (${subcats.length} Unique Subcategories)`);
    log('=======================================');

    // Categorize subcategories
    const validSubcats = [];
    const missingSubcats = [];
    const weirdSubcats = []; // e.g. very long strings that might be descriptions

    subcats.forEach(s => {
      const nameStr = s._id || '';
      if (!nameStr) {
        missingSubcats.push(s);
      } else if (nameStr.length > 50) {
        weirdSubcats.push(s);
      } else {
        validSubcats.push(s);
      }
    });

    log(`\n✅ VALID SUBCATEGORIES (${validSubcats.length}):`);
    validSubcats.forEach(s => log(`   - "${s._id}" : ${s.count} products`));

    if (missingSubcats.length > 0) {
      log(`\n⚠️ MISSING SUBCATEGORIES (${missingSubcats.length}):`);
      missingSubcats.forEach(s => log(`   - [Empty/Null] : ${s.count} products`));
    }

    if (weirdSubcats.length > 0) {
      log(`\n❌ INCORRECTLY MAPPED / OVERLONG SUBCATEGORIES (${weirdSubcats.length}):`);
      log('   (These look like product descriptions mapped into the subcategory field!)');
      weirdSubcats.forEach((s, i) => {
        if (i < 10) {
          log(`   - "${s._id.substring(0, 80)}..." : ${s.count} products`);
        }
      });
      if (weirdSubcats.length > 10) log(`   ... and ${weirdSubcats.length - 10} more.`);
    }

    fs.writeFileSync(path.join(__dirname, 'db_analysis.txt'), output);
    log('\n✅ Report saved to backend/scripts/db_analysis.txt');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

analyze();
