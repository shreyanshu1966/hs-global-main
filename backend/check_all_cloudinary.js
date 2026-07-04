const mongoose = require('mongoose');
const https = require('https');

async function checkAllProducts() {
  await mongoose.connect('mongodb://localhost:27017/hs_global_export');

  const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('Product', productSchema);

  const products = await Product.find({});
  let totalProducts = products.length;
  let productsWithNoImages = 0;
  let productsWithBrokenImages = 0;
  let totalImagesChecked = 0;
  let totalBrokenImages = 0;

  console.log(`Starting analysis of ${totalProducts} products...`);
  
  const allImagePromises = [];

  for (const product of products) {
    const images = product.get('images') || [];
    if (images.length === 0) {
      productsWithNoImages++;
      continue;
    }
    
    for (let i = 0; i < images.length; i++) {
      let url = typeof images[i] === 'object' ? images[i].url : images[i];
      if (!url || !url.startsWith('https://res.cloudinary.com/')) {
        continue;
      }
      
      allImagePromises.push((async () => {
        return new Promise((resolve) => {
          const req = https.get(url, (res) => {
            resolve({
              productId: product.get('productId'),
              url,
              status: res.statusCode
            });
          }).on('error', () => {
            resolve({
              productId: product.get('productId'),
              url,
              status: 'ERROR'
            });
          });
          
          req.setTimeout(5000, () => {
            req.destroy();
            resolve({
              productId: product.get('productId'),
              url,
              status: 'TIMEOUT'
            });
          });
        });
      })());
    }
  }
  
  // Batch processing
  const batchSize = 100;
  const results = [];
  for (let i = 0; i < allImagePromises.length; i += batchSize) {
    const batch = allImagePromises.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
    process.stdout.write(`Processed ${Math.min(i + batchSize, allImagePromises.length)} / ${allImagePromises.length} images...\r`);
  }
  
  console.log('\n');

  const brokenByProduct = {};
  
  for (const res of results) {
    totalImagesChecked++;
    if (res.status !== 200) {
      totalBrokenImages++;
      if (!brokenByProduct[res.productId]) {
        brokenByProduct[res.productId] = [];
      }
      brokenByProduct[res.productId].push({ url: res.url, status: res.status });
    }
  }
  
  const issueProductIds = Object.keys(brokenByProduct);
  productsWithBrokenImages = issueProductIds.length;
  
  console.log(`=== Analysis Results ===`);
  console.log(`Total Products in DB: ${totalProducts}`);
  console.log(`Products with NO images: ${productsWithNoImages}`);
  console.log(`Total Images Checked: ${totalImagesChecked}`);
  console.log(`Total BROKEN Images (404/Error): ${totalBrokenImages}`);
  console.log(`Products with AT LEAST ONE broken image: ${productsWithBrokenImages}`);
  console.log(`\nSample of 5 affected products:`);
  
  for (let i = 0; i < Math.min(5, issueProductIds.length); i++) {
    const pid = issueProductIds[i];
    console.log(`\nProduct: ${pid}`);
    console.log(`Broken Images: ${brokenByProduct[pid].length}`);
    brokenByProduct[pid].forEach(b => console.log(` - [${b.status}] ${b.url}`));
  }

  mongoose.connection.close();
}

checkAllProducts().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
