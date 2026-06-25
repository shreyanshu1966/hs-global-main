const { MongoClient } = require('mongodb');
const path = require('path');
// When run from backend/ dir, .env is in same dir; otherwise check backend/ subdir
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function fixSeoRecords() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) { console.error('No MONGO_URI found in backend/.env'); process.exit(1); }

  const client = new MongoClient(uri);
  await client.connect();
  console.log('Connected to MongoDB');

  // Try both collection names (pageseos or pageseo)
  const collections = await client.db().listCollections().toArray();
  const colNames = collections.map(c => c.name);
  console.log('Collections:', colNames);
  const colName = colNames.find(n => n.toLowerCase().includes('pageseo')) || 'pageseos';
  const col = client.db().collection(colName);
  console.log('Using collection:', colName);

  // Show all existing records first
  const all = await col.find({}, { projection: { path: 1, title: 1, canonical: 1 } }).toArray();
  console.log('\nExisting PageSeo records:');
  all.forEach(r => console.log(' path:', r.path, '| title:', (r.title || '').substring(0, 70), '| canonical:', r.canonical));

  // Fix 1: Homepage canonical pointing to /Old
  const homeDoc = await col.findOne({ path: '/' });
  if (homeDoc && homeDoc.canonical && homeDoc.canonical.includes('/Old')) {
    const r = await col.updateOne({ path: '/' }, { $set: { canonical: 'https://www.hsglobalexport.com/' } });
    console.log('\nHomepage canonical fix: updated', r.modifiedCount, 'doc(s)');
  } else {
    console.log('\nHomepage canonical:', homeDoc?.canonical, '(no fix needed or doc not found)');
  }

  // Fix 2: Gallery typo 'Galarry'
  const galleryDoc = await col.findOne({ path: '/gallery' });
  console.log('Gallery title:', galleryDoc?.title);
  if (galleryDoc?.title && galleryDoc.title.includes('alarry')) {
    const r = await col.updateOne(
      { path: '/gallery' },
      { $set: { title: 'Luxury Marble & Stone Gallery | HS Global Export' } }
    );
    console.log('Gallery typo fix: updated', r.modifiedCount, 'doc(s)');
  }

  // Fix 3: About page wrong title (has 'Marble Sink' product copy)
  const aboutDoc = await col.findOne({ path: '/about' });
  console.log('About title:', aboutDoc?.title);
  if (aboutDoc?.title && (aboutDoc.title.toLowerCase().includes('marble sink') || aboutDoc.title.toLowerCase().includes('granite sink'))) {
    const r = await col.updateOne(
      { path: '/about' },
      {
        $set: {
          title: 'About Us | Premium Marble & Granite Manufacturer — HS Global Export',
          description: 'HS Global Export is a leading manufacturer and exporter of premium marble and granite products, delivering handcrafted stone solutions to the USA, UK and worldwide.',
        }
      }
    );
    console.log('About page fix: updated', r.modifiedCount, 'doc(s)');
  }

  // Fix 4: Products page typo 'wold'
  const productsDoc = await col.findOne({ path: '/products' });
  console.log('Products title:', productsDoc?.title);
  if (productsDoc?.title && productsDoc.title.toLowerCase().includes('wold')) {
    const r = await col.updateOne(
      { path: '/products' },
      { $set: { title: 'Best Marble & Granite Company | USA, UK & Worldwide | HS Global Export' } }
    );
    console.log('Products typo fix: updated', r.modifiedCount, 'doc(s)');
  }

  // Show updated records
  const updated = await col.find({}, { projection: { path: 1, title: 1, canonical: 1 } }).toArray();
  console.log('\nFinal PageSeo records:');
  updated.forEach(r => console.log(' path:', r.path, '| title:', (r.title || '').substring(0, 70)));

  await client.close();
  console.log('\nDone!');
}

fixSeoRecords().catch(err => { console.error(err); process.exit(1); });
