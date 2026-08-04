// One-off script: update homepage (path '/') PageSeo title/description/keywords.
// Dry-run by default — prints old vs new values and exits without writing.
// Pass --commit to actually perform the update. Backs up the existing doc first.
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const NEW_TITLE = 'HS Global Export : Luxury Furniture & Semi Precious Stone Slabs | Bespoke Interior Products';
const NEW_DESCRIPTION = 'HS Global Export specializes in bespoke furniture, marble furniture, leather furniture, antique wooden furniture and semi precious stone slabs for the USA, UK and worldwide.';
const NEW_KEYWORDS = [
  'HS Global Export', 'Luxury Furniture', 'Bespoke Furniture', 'Luxury Home Furniture',
  'Bespoke Interior Design', 'Semi Precious Stone Slabs', 'Agate Slabs', 'Gemstone Slabs',
  'Furniture Exporter', 'Marble Furniture Manufacturer', 'Luxury Furniture Manufacturer',
  'Luxury Furniture Exporter', 'Natural Stone Exporter', 'USA Furniture Supplier',
  'UK Furniture Supplier', 'Global Furniture Exporter in USA', 'United States', 'UK',
  'United Kingdom', 'Europe', 'Australia', 'Saudi Arabia', 'Dubai', 'UAE', 'Netherlands',
  'Canada', 'Singapore', 'South Africa', 'Global Exporter',
];

async function main() {
  const commit = process.argv.includes('--commit');
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) { console.error('No MONGO_URI/MONGODB_URI found in backend/.env'); process.exit(1); }

  const client = new MongoClient(uri);
  await client.connect();
  console.log('Connected to MongoDB:', uri.replace(/\/\/.*@/, '//<redacted>@'));

  const col = client.db().collection('pageseos');
  const doc = await col.findOne({ path: '/' });
  if (!doc) { console.error("No PageSeo document found for path '/'"); process.exit(1); }

  console.log('\n--- Current values ---');
  console.log('title:', doc.title);
  console.log('description:', doc.description);
  console.log('keywords:', (doc.keywords || []).join(', '));

  console.log('\n--- New values ---');
  console.log('title:', NEW_TITLE);
  console.log('description:', NEW_DESCRIPTION);
  console.log('keywords:', NEW_KEYWORDS.join(', '));

  if (!commit) {
    console.log('\nDry run only — no changes written. Re-run with --commit to apply.');
    await client.close();
    return;
  }

  const backupDir = path.join(__dirname, 'backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const backupFile = path.join(backupDir, `home-seo-backup-${Date.now()}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(doc, null, 2));
  console.log('\nBacked up current doc to:', backupFile);

  const result = await col.updateOne(
    { path: '/' },
    { $set: { title: NEW_TITLE, description: NEW_DESCRIPTION, keywords: NEW_KEYWORDS } }
  );
  console.log('Update applied, modifiedCount:', result.modifiedCount);

  await client.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
