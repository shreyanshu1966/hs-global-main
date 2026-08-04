const fs = require('fs');
const mongoose = require('mongoose');

async function analyzeProducts() {
  await mongoose.connect('mongodb://localhost:27017/hs_global_export');

  const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('Product', productSchema);

  const products = await Product.find({});
  let totalProducts = products.length;
  let productsWithMixedImages = 0;
  let productsWithOnlyLocalImages = 0;
  let productsWithAllCloudinary = 0;
  let productsWithNoImages = 0;

  const issueProducts = [];

  products.forEach(p => {
    const images = p.get('images') || [];
    if (images.length === 0) {
      productsWithNoImages++;
      return;
    }

    let hasCloudinary = false;
    let hasLocal = false;

    images.forEach(img => {
      const url = typeof img === 'object' ? img.url : img;
      if (!url) return;
      if (url.includes('cloudinary.com')) {
        hasCloudinary = true;
      } else {
        hasLocal = true;
      }
    });

    if (hasCloudinary && hasLocal) {
      productsWithMixedImages++;
      if (issueProducts.length < 5) {
        issueProducts.push({
          id: p.get('productId'),
          images: images
        });
      }
    } else if (hasCloudinary && !hasLocal) {
      productsWithAllCloudinary++;
    } else if (!hasCloudinary && hasLocal) {
      productsWithOnlyLocalImages++;
    }
  });

  console.log(`Total Products: ${totalProducts}`);
  console.log(`Products with no images: ${productsWithNoImages}`);
  console.log(`Products with all Cloudinary images: ${productsWithAllCloudinary}`);
  console.log(`Products with only local images: ${productsWithOnlyLocalImages}`);
  console.log(`Products with MIXED images (Issue): ${productsWithMixedImages}`);
  console.log('\nSample of products with mixed images:');
  console.log(JSON.stringify(issueProducts, null, 2));

  mongoose.connection.close();
}

analyzeProducts().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
