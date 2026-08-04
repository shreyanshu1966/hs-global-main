/**
 * Upload ONLY the 4 newly added gallery videos to Cloudinary (poster + video),
 * and update video-gallery-urls.json for just those entries.
 *
 * Does not touch any of the existing ~104 gallery video entries.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const VIDEOS_DIR = path.join(__dirname, '../frontend-new/public/videos');
const TEMP_DIR = path.join(__dirname, '../temp-video-posters-new');
const MANIFEST_PATH = path.join(__dirname, '../video-gallery-urls.json');
const POSTER_FOLDER = 'hs-global/gallery-videos-posters';
const VIDEO_FOLDER = 'hs-global/gallery-videos';

const RELATIVE_PATHS = [
    'Tables/Coffee Table/Marble Sphere Base Glass Coffee Table/video.mp4',
    'Semi Precious Stone/Amethyst Purple Stone Slab/video.mp4',
    'Cabinets/Black Fluted Marble Cabinet with Gold Trim/video.mp4',
    'Tables/Center Table/Beige Travertine Fluted Pedestal Table/video.mp4',
];

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

function deriveMeta(relPath) {
    const parts = relPath.split('/').filter(Boolean);
    const category = parts[0];
    let subCategory = null;
    let title;
    if (parts.length === 3) {
        title = parts[1];
    } else {
        subCategory = parts[1];
        title = parts[2];
    }
    return { category, subCategory, title };
}

function extractPoster(videoPath, posterPath) {
    fs.mkdirSync(path.dirname(posterPath), { recursive: true });
    try {
        execFileSync('ffmpeg', ['-y', '-ss', '1', '-i', videoPath, '-frames:v', '1', '-q:v', '3', posterPath], { stdio: 'pipe' });
    } catch (e) {
        execFileSync('ffmpeg', ['-y', '-ss', '0', '-i', videoPath, '-frames:v', '1', '-q:v', '3', posterPath], { stdio: 'pipe' });
    }
}

function loadManifest() {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

function saveManifest(manifest) {
    manifest.generated = new Date().toISOString();
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

async function main() {
    const manifest = loadManifest();

    for (const relPath of RELATIVE_PATHS) {
        const videoPath = path.join(VIDEOS_DIR, relPath);
        if (!fs.existsSync(videoPath)) {
            console.error(`✗ Not found: ${relPath}`);
            process.exit(1);
        }
        const { category, subCategory, title } = deriveMeta(relPath);
        const publicId = relPath.replace(/\.mp4$/i, '').replace(/[^a-zA-Z0-9/_-]/g, '_');
        const posterFile = path.join(TEMP_DIR, relPath.replace(/\.mp4$/i, '.jpg'));

        console.log(`\n[${relPath}]`);

        extractPoster(videoPath, posterFile);
        const posterResult = await cloudinary.uploader.upload(posterFile, {
            folder: POSTER_FOLDER,
            public_id: publicId,
            use_filename: false,
            unique_filename: false,
            overwrite: true,
            resource_type: 'image',
            transformation: [{ width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
        });
        console.log(`  poster -> ${posterResult.secure_url}`);

        const videoResult = await cloudinary.uploader.upload(videoPath, {
            folder: VIDEO_FOLDER,
            public_id: publicId,
            use_filename: false,
            unique_filename: false,
            overwrite: true,
            resource_type: 'video',
        });
        console.log(`  video  -> ${videoResult.secure_url}`);

        manifest.videos[relPath] = {
            category,
            subCategory,
            title,
            posterUrl: posterResult.secure_url,
            videoUrl: videoResult.secure_url,
            size: videoResult.bytes,
        };

        saveManifest(manifest);
    }

    try { fs.rmSync(TEMP_DIR, { recursive: true, force: true }); } catch (_) {}

    console.log('\nDone. Manifest updated for the 4 new videos only.');
}

main().catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
});
