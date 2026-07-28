/**
 * Gallery Video Uploader -> Cloudinary
 *
 * Walks frontend-new/public/videos/**\/video.mp4 and uploads each to
 * Cloudinary (resource_type: video), then updates video-gallery-urls.json
 * (repo root) with the resulting secure video URL, replacing the GoDaddy
 * URL previously stored there. Poster URLs are left untouched.
 */

const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const VIDEOS_DIR = path.join(__dirname, '../frontend-new/public/videos');
const MANIFEST_PATH = path.join(__dirname, '../video-gallery-urls.json');
const CLOUDINARY_FOLDER = 'hs-global/gallery-videos';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

function findVideos(dir) {
    const out = [];
    if (!fs.existsSync(dir)) return out;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            out.push(...findVideos(full));
        } else if (entry.name.toLowerCase() === 'video.mp4') {
            out.push(full);
        }
    }
    return out;
}

function loadManifest() {
    if (fs.existsSync(MANIFEST_PATH)) {
        return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    }
    return { generated: null, videos: {} };
}

function saveManifest(manifest) {
    manifest.generated = new Date().toISOString();
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

async function main() {
    const videoFiles = findVideos(VIDEOS_DIR);
    console.log(`Found ${videoFiles.length} local videos.`);

    const manifest = loadManifest();
    let uploaded = 0;
    let errors = 0;

    for (let i = 0; i < videoFiles.length; i++) {
        const localPath = videoFiles[i];
        const relPath = path.relative(VIDEOS_DIR, localPath).split(path.sep).join('/');
        const publicId = relPath.replace(/\.mp4$/i, '').replace(/[^a-zA-Z0-9/_-]/g, '_');

        process.stdout.write(`[${i + 1}/${videoFiles.length}] ${relPath} ... `);

        try {
            const result = await cloudinary.uploader.upload(localPath, {
                folder: CLOUDINARY_FOLDER,
                public_id: publicId,
                use_filename: false,
                unique_filename: false,
                overwrite: true,
                resource_type: 'video',
            });

            manifest.videos[relPath] = {
                ...(manifest.videos[relPath] || {}),
                videoUrl: result.secure_url,
            };
            saveManifest(manifest);

            uploaded++;
            console.log('OK ->', result.secure_url);
        } catch (e) {
            errors++;
            console.log('FAILED:', e.message);
        }
    }

    console.log(`\nDone. Uploaded ${uploaded}, errors ${errors}.`);
    console.log(`Manifest written to ${MANIFEST_PATH}`);
}

main().catch((e) => {
    console.error('Fatal error:', e.message);
    process.exit(1);
});
