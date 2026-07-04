require('dotenv').config({ path: './backend/.env' });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function fetchAllAssets() {
  let allAssets = [];
  let nextCursor = null;

  console.log('Fetching assets from Cloudinary...');

  do {
    const options = {
      type: 'upload',
      prefix: 'hs-global/',
      max_results: 500,
    };
    if (nextCursor) {
      options.next_cursor = nextCursor;
    }

    try {
      const result = await cloudinary.api.resources(options);
      
      const mapped = result.resources.map(r => ({
        public_id: r.public_id,
        secure_url: r.secure_url,
        format: r.format,
      }));
      allAssets = allAssets.concat(mapped);
      
      console.log(`Fetched ${mapped.length} assets... Total so far: ${allAssets.length}`);
      
      nextCursor = result.next_cursor;
    } catch (error) {
      console.error('Error fetching assets:', error);
      break;
    }
  } while (nextCursor);

  fs.writeFileSync('cloudinary_all_api_assets.json', JSON.stringify(allAssets, null, 2));
  console.log(`Done. Saved ${allAssets.length} assets to cloudinary_all_api_assets.json`);
}

fetchAllAssets();
