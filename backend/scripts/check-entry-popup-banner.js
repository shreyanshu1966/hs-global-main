/**
 * Read-only diagnostic: inspect the entry-popup left-panel banner image
 * stored in PopupConfig (live DB) and report its real pixel dimensions
 * vs. the container it renders into, to explain "banner not fitting" reports.
 */
const mongoose = require('mongoose');
const axios = require('axios');
const sharp = require('sharp');
require('dotenv').config({ path: __dirname + '/../.env' });

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);

  const PopupConfig = mongoose.model('PopupConfig', new mongoose.Schema({}, { strict: false, collection: 'popupconfigs' }));
  const docs = await PopupConfig.find({});
  console.log(`\nFound ${docs.length} popupconfigs document(s)`);

  for (const doc of docs) {
    const entry = doc.get('entryPopup') || {};
    console.log('\n--- key:', doc.get('key'), '---');
    console.log('entryPopup.enabled:', entry.enabled);
    console.log('entryPopup.heading:', entry.heading);
    console.log('entryPopup.backgroundImage:', entry.backgroundImage);

    const url = entry.backgroundImage;
    if (!url) {
      console.log('=> No background image set (panel renders solid #111827).');
      continue;
    }

    try {
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
      const buf = Buffer.from(res.data);
      const meta = await sharp(buf).metadata();
      const ratio = meta.width / meta.height;
      console.log(`=> HTTP ${res.status}, content-type ${res.headers['content-type']}, size ${(buf.length / 1024).toFixed(1)}KB`);
      console.log(`=> Image: ${meta.width}x${meta.height} (${meta.format}), aspect ratio ${ratio.toFixed(3)}`);

      // Container: fixed 210px wide, height = flex-stretched to match right panel (~500-560px desktop)
      const containerW = 210, containerH = 530;
      const containerRatio = containerW / containerH;
      console.log(`=> Container: ~${containerW}x${containerH}, aspect ratio ${containerRatio.toFixed(3)}`);

      if (ratio > containerRatio * 1.5) {
        console.log('=> DIAGNOSIS: image is much wider/landscape than the narrow tall container.');
        console.log('   With background-size:cover this crops in tight and only a thin vertical');
        console.log('   sliver of the source image is visible — matches "banner not fitting/visible" reports.');
      } else {
        console.log('=> Aspect ratio is reasonably close to the container; cover-crop loss should be minor.');
      }
    } catch (err) {
      console.log('=> FAILED to fetch/parse image:', err.message);
      console.log('=> DIAGNOSIS: broken/unreachable image URL — panel falls back to solid #111827 (banner invisible).');
    }
  }

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
