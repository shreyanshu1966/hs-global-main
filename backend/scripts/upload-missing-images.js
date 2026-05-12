const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(localPath, publicId) {
    return new Promise(async (resolve, reject) => {
        const compressedBuffer = await sharp(localPath)
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

        const uploadStream = cloudinary.uploader.upload_stream(
            { public_id: publicId, format: 'webp', overwrite: true },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        uploadStream.end(compressedBuffer);
    });
}

async function fixMissingImages() {
    try {
        await mongoose.connect('mongodb://localhost:27017/hs_global_export');
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
        
        const step1Data = JSON.parse(fs.readFileSync(path.join(__dirname, 'etsy-products-data-step1.json'), 'utf-8'));
        
        const productsMissingImages = await Product.find({
            $or: [
                { image: { $in: [null, '', undefined] } },
                { image: { $exists: false } },
                { images: { $size: 0 } },
                { images: { $exists: false } }
            ]
        });

        console.log(`Found ${productsMissingImages.length} products in DB with missing images.`);

        for (const dbProd of productsMissingImages) {
            // Find this product in step1Data by slug or name
            const step1Prod = step1Data.find(p => p.slug === dbProd.productId || p.productCode === dbProd.productId);
            
            if (!step1Prod) {
                console.log(`❌ Could not find ${dbProd.productId} in step1 data.`);
                continue;
            }

            if (!step1Prod.localImages || step1Prod.localImages.length === 0) {
                console.log(`⚠️  ${dbProd.productId} still has NO local images found on disk (even after recursive search).`);
                continue;
            }

            console.log(`\n📤 Uploading ${step1Prod.localImages.length} images for ${dbProd.productId}...`);
            const cloudinaryUrls = [];
            
            for (const imgPath of step1Prod.localImages) {
                const fileBase = path.basename(imgPath, path.extname(imgPath));
                const publicId = `hs-global/furniture/etsy/${step1Prod.productCode}/${fileBase}`;
                try {
                    const url = await uploadImage(imgPath, publicId);
                    cloudinaryUrls.push(url);
                    console.log(`  ✅ Uploaded: ${url}`);
                } catch (err) {
                    console.error(`  ❌ Failed: ${err.message}`);
                }
            }

            if (cloudinaryUrls.length > 0) {
                await Product.updateOne(
                    { _id: dbProd._id },
                    { 
                        $set: { 
                            image: cloudinaryUrls[0], 
                            images: cloudinaryUrls,
                            sortedImages: cloudinaryUrls
                        } 
                    }
                );
                console.log(`💾 Updated DB for ${dbProd.productId}`);
            }
        }

    } catch (err) {
        console.error('Fatal Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Script complete.');
    }
}

fixMissingImages();
