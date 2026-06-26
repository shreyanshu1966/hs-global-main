const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function inspectDb() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  console.log("--- products ---");
  const products = await db.collection('products').find({}).limit(3).toArray();
  for (const p of products) {
    console.log(`id: ${p._id}, productId: ${p.productId}, name: ${p.name}`);
  }

  await client.close();
}

inspectDb().catch(console.error);
