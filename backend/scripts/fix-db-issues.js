const mongoose = require('mongoose');

async function fixDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hs_global_export');
    console.log('✅ Connected to Database');

    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

    // 1. Fix Subcategories
    const res1 = await Product.updateMany(
      { subcategory: { $in: ['Dinning Table', 'Dinning Atble'] } },
      { $set: { subcategory: 'Dining Table' } }
    );
    console.log(`✅ Fixed ${res1.modifiedCount} "Dining Table" typos.`);

    const res2 = await Product.updateMany(
      { subcategory: 'Tree Sclupture' },
      { $set: { subcategory: 'Tree Sculpture' } }
    );
    console.log(`✅ Fixed ${res2.modifiedCount} "Tree Sculpture" typos.`);

    // 2. Fix the 14 Broken Products
    const brokenProducts = await Product.find({
      $or: [
        { image: { $in: [null, '', undefined] } },
        { image: { $exists: false } },
        { images: { $size: 0 } },
        { images: { $exists: false } }
      ]
    });

    console.log(`\nFound ${brokenProducts.length} broken products to manually correct...`);

    let count = 0;
    for (const p of brokenProducts) {
      if (p.productId && p.productId.length > 50) {
        const oldId = p.productId;
        
        // Extract a better name from the first few words of the description
        let newName = p.description ? p.description.split('.')[0].substring(0, 50) : 'Recovered Product';
        if (newName.length === 50) newName += '...';
        
        // Create a short, valid ID
        const shortId = `hs-recovered-${Date.now()}-${count}`;
        
        await Product.updateOne(
          { _id: p._id },
          { 
            $set: { 
              productId: shortId, 
              name: newName,
              title: newName
            } 
          }
        );
        console.log(`  - Corrected row: ${shortId} ("${newName}")`);
        count++;
      }
    }
    console.log(`✅ Manually corrected ${count} broken product rows in the database.`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed.');
  }
}

fixDatabase();
