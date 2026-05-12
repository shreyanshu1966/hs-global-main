const mongoose = require('mongoose');

async function checkDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hs_global_export');
    console.log('✅ Connected to Database');

    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

    // 1. Check for missing images
    const productsMissingImages = await Product.find({
      $or: [
        { image: { $in: [null, '', undefined] } },
        { image: { $exists: false } },
        { images: { $size: 0 } },
        { images: { $exists: false } }
      ]
    }, 'productId name subcategory image images');

    console.log('\n=======================================');
    console.log(`🖼️ PRODUCTS MISSING IMAGES: ${productsMissingImages.length}`);
    console.log('=======================================');
    if (productsMissingImages.length > 0) {
      productsMissingImages.forEach((p, idx) => {
        console.log(`${idx + 1}. [${p.productId}] ${p.name} (Subcat: ${p.subcategory})`);
        console.log(`   - Main Image: ${p.image ? 'Present' : 'MISSING'}`);
        console.log(`   - Gallery Images: ${p.images?.length || 0}`);
      });
    } else {
      console.log('All products have images! 🎉');
    }

    // 2. Check Subcategories
    const subcategoryMap = await Product.aggregate([
      {
        $group: {
          _id: '$subcategory',
          count: { $sum: 1 },
          sampleProducts: { $push: '$name' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n=======================================');
    console.log(`📂 SUBCATEGORY MAPPING`);
    console.log('=======================================');
    
    // We also want to check if any products have null/empty subcategory
    const noSubcat = subcategoryMap.find(s => !s._id || s._id === '');
    if (noSubcat) {
      console.log(`\n⚠️ WARNING: ${noSubcat.count} products have NO subcategory!`);
      noSubcat.sampleProducts.slice(0, 5).forEach(name => console.log(`   - ${name}`));
    }

    subcategoryMap.filter(s => s._id && s._id !== '').forEach(sub => {
      console.log(`\n🔹 ${sub._id?.toUpperCase()} (${sub.count} products)`);
      console.log('   Sample products in this category:');
      // Show up to 5 products as a sample to verify correctness
      sub.sampleProducts.slice(0, 5).forEach(name => {
        console.log(`   - ${name}`);
      });
      if (sub.count > 5) {
        console.log(`   ...and ${sub.count - 5} more`);
      }
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from Database');
  }
}

checkDatabase();
