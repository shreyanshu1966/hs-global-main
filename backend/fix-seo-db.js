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

  // Fix 1: Homepage canonical pointing to /Old and missing title/description
  const homeDoc = await col.findOne({ path: '/' });
  if (homeDoc) {
    const updateFields = {};
    if (homeDoc.canonical && homeDoc.canonical.includes('/Old')) {
      updateFields.canonical = 'https://www.hsglobalexport.com/';
    }
    if (!homeDoc.title || homeDoc.title.trim() === '') {
      updateFields.title = 'Marble & Granite Furniture Manufacturer & Exporter | HS Global Export';
    }
    if (!homeDoc.description || homeDoc.description.trim() === '') {
      updateFields.description = 'HS Global Export — premium granite & marble solutions. Handcrafted products with worldwide delivery to the USA, UK and beyond.';
    }
    if (Object.keys(updateFields).length > 0) {
      const r = await col.updateOne({ path: '/' }, { $set: updateFields });
      console.log('\nHomepage fix: updated', r.modifiedCount, 'doc(s)');
    } else {
      console.log('\nHomepage: no fix needed');
    }
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
  
  // Fix 5: Remove hardcoded ellipses '...' from any PageSeo title
  const docsWithEllipses = await col.find({ title: { $regex: /\.\.\./ } }).toArray();
  for (const doc of docsWithEllipses) {
    const newTitle = doc.title.replace(/\.\.\./g, '').trim();
    await col.updateOne({ _id: doc._id }, { $set: { title: newTitle } });
  }
  console.log(`\nRemoved ellipses from ${docsWithEllipses.length} PageSeo records`);

  // Fix 6: Remove hardcoded ellipses '...' from products collection
  const productsCol = client.db().collection('products');
  if (productsCol) {
    const productsWithEllipses = await productsCol.find({ "seo.metaTitle": { $regex: /\.\.\./ } }).toArray();
    for (const p of productsWithEllipses) {
      const newTitle = p.seo.metaTitle.replace(/\.\.\./g, '').trim();
      await productsCol.updateOne({ _id: p._id }, { $set: { "seo.metaTitle": newTitle } });
    }
    console.log(`Removed ellipses from ${productsWithEllipses.length} Product records`);
  }
  const updated = await col.find({}, { projection: { path: 1, title: 1, canonical: 1 } }).toArray();
  console.log('\nFinal PageSeo records:');
  updated.forEach(r => console.log(' path:', r.path, '| title:', (r.title || '').substring(0, 70)));

  await client.close();
  console.log('\nDone!');
}

fixSeoRecords().catch(err => { console.error(err); process.exit(1); });
