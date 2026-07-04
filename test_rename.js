require('dotenv').config({ path: './backend/.env' });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testRename() {
  const oldId = 'hs-global/furniture/etsy/HSMCOTWH5/Gemini_Generated_Image_2mrxze2mrxze2mrx';
  const newId = 'hs-global/furniture/etsy/HSMCOTWH5/1';
  
  try {
    console.log(`Renaming ${oldId} to ${newId}...`);
    const result = await cloudinary.uploader.rename(oldId, newId, { overwrite: true });
    console.log('Success!', result.secure_url);
  } catch (err) {
    console.error('Error:', err);
  }
}

testRename();
