const mongoose = require('mongoose');

async function syncCategories() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hs_global_export');
    console.log('✅ Connected to Database');

    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));

    // Get all unique subcategories currently assigned to actual products
    const uniqueSubcats = await Product.distinct('subcategory');
    
    // Filter out nulls and empties
    const validSubcats = uniqueSubcats.filter(s => s && s.trim() !== '');

    console.log(`Found ${validSubcats.length} actual subcategories in use by products.`);
    
    // Create the customSubcategories array format
    const customSubsToSave = validSubcats.map(sub => ({
      id: sub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name: sub,
      isCustom: true
    }));

    // Update the Category document for 'furniture'
    const cat = await Category.findOne({ categoryId: 'furniture' });
    if (cat) {
      await Category.updateOne(
        { categoryId: 'furniture' },
        { $set: { customSubcategories: customSubsToSave } }
      );
      console.log('✅ Successfully updated furniture Category with accurate subcategories:');
      customSubsToSave.forEach(s => console.log(`   - ${s.name}`));
    } else {
      console.log('❌ Category furniture not found!');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed.');
  }
}

syncCategories();
