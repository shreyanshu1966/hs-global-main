const mongoose = require('mongoose');
const https = require('https');

async function analyzeCloudinaryImages() {
  await mongoose.connect('mongodb://localhost:27017/hs_global_export');

  const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('Product', productSchema);

  // Focus on the specific product user mentioned + a few others
  let products = await Product.find({ productId: 'marble-arch-console-table-modern-stone-entryway-table' });
  const more = await Product.find({}).limit(4);
  products = products.concat(more);

  const issues = [];

  for (const product of products) {
    const images = product.get('images') || [];
    if (images.length === 0) continue;
    
    let statuses = [];
    let hasBroken = false;

    const promises = images.map((img, i) => {
      return new Promise((resolve) => {
        let url = typeof img === 'object' ? img.url : img;
        if (!url || !url.startsWith('https://res.cloudinary.com/')) {
          return resolve({ index: i, url, status: 'Not Cloudinary' });
        }
        
        const req = https.get(url, (res) => {
          resolve({ index: i, url, status: res.statusCode });
        }).on('error', () => resolve({ index: i, url, status: 'ERROR' }));
        
        req.setTimeout(3000, () => {
          req.destroy();
          resolve({ index: i, url, status: 'TIMEOUT' });
        });
      });
    });

    statuses = await Promise.all(promises);
    
    if (statuses.some(s => s.status !== 200 && s.status !== 'Not Cloudinary')) {
      issues.push({
        productId: product.get('productId'),
        statuses
      });
    }
  }

  console.log(`Checked ${products.length} products. Found issues in ${issues.length} of them.`);
  if (issues.length > 0) {
    console.log(JSON.stringify(issues, null, 2));
  }

  mongoose.connection.close();
}

analyzeCloudinaryImages().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
