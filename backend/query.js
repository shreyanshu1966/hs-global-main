const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const doc = await db.collection('products').findOne({});
  console.log(JSON.stringify(doc, null, 2));

  // Let's also look for a product that might have a similar name
  // Title: Buy White Marble Bathtub Freestanding Luxury Stone Tub
  const tub = await db.collection('products').findOne({ name: { $regex: 'Bathtub', $options: 'i' } });
  console.log("Found tub:", JSON.stringify(tub, null, 2));

  await client.close();
}

run().catch(console.error);
