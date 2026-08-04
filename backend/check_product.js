const mongoose = require('mongoose');

async function checkProduct() {
  await mongoose.connect('mongodb://localhost:27017/hs_global_export');

  const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('Product', productSchema);

  const product = await Product.findOne({ productId: 'marble-arch-console-table-modern-stone-entryway-table' });
  if (product) {
    console.log(JSON.stringify(product.get('images'), null, 2));
  } else {
    console.log('Product not found');
  }

  mongoose.connection.close();
}

checkProduct().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
