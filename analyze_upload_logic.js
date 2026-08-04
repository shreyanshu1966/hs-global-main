const fs = require('fs');

const assets = JSON.parse(fs.readFileSync('cloudinary_all_api_assets.json'));
let mappingData = null;
try {
  mappingData = JSON.parse(fs.readFileSync('cloudinary-all-urls.json'));
} catch(e) {}

console.log('Total API Assets:', assets.length);
if (mappingData && mappingData.urls) {
  const urls = mappingData.urls;
  console.log('Total Mapping Entries:', Object.keys(urls).length);
  
  // Show 5 random mappings
  const keys = Object.keys(urls);
  console.log('\nSample Mappings:');
  for(let i = 0; i < 5; i++) {
    const k = keys[Math.floor(Math.random() * keys.length)];
    console.log(`Original: ${k}`);
    console.log(`Cloudinary: ${urls[k].cloudinary || urls[k].variants?.mobile?.url || urls[k].url || JSON.stringify(urls[k])}\n`);
  }

  // Find a mapping related to one of the missing products, like HSMSTBE9
  const missingCode = 'HSMSTBE9';
  const matches = keys.filter(k => k.includes(missingCode));
  console.log(`\nFound ${matches.length} mappings for ${missingCode}`);
  if (matches.length > 0) {
    console.log(`Original: ${matches[0]}`);
    console.log(`Cloudinary: ${JSON.stringify(urls[matches[0]])}`);
  }
}
