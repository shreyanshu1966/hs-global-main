/**
 * Gallery Video Poster Generator + Cloudinary Uploader
 *
 * Walks frontend-new/public/videos/**\/video.mp4, extracts a poster frame
 * with ffmpeg, uploads the poster to Cloudinary, and writes/updates
 * video-gallery-urls.json (repo root) with poster URLs keyed by the video's
 * relative path (e.g. "Sculptures/Anibus/video.mp4").
 *
 * Does NOT touch the video files themselves (see upload-gallery-videos-to-godaddy.js
 * for that) - this script only produces poster images.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const VIDEOS_DIR = path.join(__dirname, '../frontend-new/public/videos');
const TEMP_DIR = path.join(__dirname, '../temp-video-posters');
const MANIFEST_PATH = path.join(__dirname, '../video-gallery-urls.json');
const CLOUDINARY_FOLDER = 'hs-global/gallery-videos-posters';

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

function extractPoster(videoPath, posterPath) {
    fs.mkdirSync(path.dirname(posterPath), { recursive: true });
    try {
        execFileSync('ffmpeg', [
            '-y', '-ss', '1', '-i', videoPath,
            '-frames:v', '1', '-q:v', '3', posterPath,
        ], { stdio: 'pipe' });
    } catch (e) {
        // Fallback for very short clips where seeking to 1s fails
        execFileSync('ffmpeg', [
            '-y', '-ss', '0', '-i', videoPath,
            '-frames:v', '1', '-q:v', '3', posterPath,
        ], { stdio: 'pipe' });
    }
}

async function uploadPoster(posterPath, publicId) {
    const result = await cloudinary.uploader.upload(posterPath, {
        folder: CLOUDINARY_FOLDER,
        public_id: publicId,
        use_filename: false,
        unique_filename: false,
        overwrite: true,
        resource_type: 'image',
        transformation: [{ width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
    });
    return result.secure_url;
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

function deriveMeta(relPath) {
    // relPath like "Sculptures/Anibus/video.mp4" or "Tables/Coffee Table/Panda White/video.mp4"
    const parts = relPath.split('/').filter(Boolean);
    const category = parts[0];
    let subCategory = null;
    let title;
    if (parts.length === 3) {
        // category/title/video.mp4
        title = parts[1];
    } else if (parts.length === 4) {
        // category/subCategory/title/video.mp4
        subCategory = parts[1];
        title = parts[2];
    } else {
        title = parts[parts.length - 2] || parts[0];
    }
    return { category, subCategory, title };
}

async function main() {
    console.log('Scanning for videos in', VIDEOS_DIR);
    const videoFiles = findVideos(VIDEOS_DIR);
    console.log(`Found ${videoFiles.length} videos.`);

    const manifest = loadManifest();
    let processed = 0;
    let uploaded = 0;
    let errors = 0;

    for (const videoPath of videoFiles) {
        const relPath = path.relative(VIDEOS_DIR, videoPath).split(path.sep).join('/');
        const { category, subCategory, title } = deriveMeta(relPath);
        const posterFile = path.join(TEMP_DIR, relPath.replace(/\.mp4$/i, '.jpg'));
        const publicId = relPath.replace(/\.mp4$/i, '').replace(/[^a-zA-Z0-9/_-]/g, '_');

        process.stdout.write(`[${processed + 1}/${videoFiles.length}] ${relPath} ... `);

        try {
            extractPoster(videoPath, posterFile);
            const posterUrl = await uploadPoster(posterFile, publicId);

            manifest.videos[relPath] = {
                ...(manifest.videos[relPath] || {}),
                category,
                subCategory,
                title,
                posterUrl,
            };
            uploaded++;
            console.log('OK ->', posterUrl);
        } catch (e) {
            errors++;
            console.log('FAILED:', e.message);
        }
        processed++;
    }

    saveManifest(manifest);

    try {
        fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    } catch {}

    console.log(`\nDone. Processed ${processed}, uploaded ${uploaded}, errors ${errors}.`);
    console.log(`Manifest written to ${MANIFEST_PATH}`);
}

main().catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
});
