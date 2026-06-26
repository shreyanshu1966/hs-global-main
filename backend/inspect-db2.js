const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function inspectDb() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const product = await db.collection('products').findOne({ 
    $or: [
      { sku: 'HSMBTWH5' },
      { productId: 'HSMBTWH5' },
      { _id: 'HSMBTWH5' }
    ]
  });
  console.log(JSON.stringify(product, null, 2));

  await client.close();
}

inspectDb().catch(console.error);
