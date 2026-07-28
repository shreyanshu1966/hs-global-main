/**
 * Gallery Video Uploader -> GoDaddy FTP
 *
 * Walks frontend-new/public/videos/**\/video.mp4 and uploads each file to
 * GoDaddy hosting at /home/m6yvujf4sxmn/public_html/videos/gallery/<same relative path>,
 * mirroring the local folder structure. Resumable: skips files that already
 * exist remotely with a matching size. Writes/updates video-gallery-urls.json
 * (repo root) with the resulting public video URLs.
 */

const fs = require('fs');
const path = require('path');
const ftp = require(path.join(__dirname, '../backend/node_modules/basic-ftp'));

const envText = fs.readFileSync(path.join(__dirname, '../backend/.env'), 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
}

const VIDEOS_DIR = path.join(__dirname, '../frontend-new/public/videos');
const MANIFEST_PATH = path.join(__dirname, '../video-gallery-urls.json');
const REMOTE_BASE = '/home/m6yvujf4sxmn/public_html/videos/gallery';
const PUBLIC_URL_BASE = 'https://www.hsglobalexport.com/videos/gallery';

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

function deriveMeta(relPath) {
    const parts = relPath.split('/').filter(Boolean);
    const category = parts[0];
    let subCategory = null;
    let title;
    if (parts.length === 3) {
        title = parts[1];
    } else if (parts.length === 4) {
        subCategory = parts[1];
        title = parts[2];
    } else {
        title = parts[parts.length - 2] || parts[0];
    }
    return { category, subCategory, title };
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
    const client = new ftp.Client(30000);
    client.ftp.verbose = false;

    await client.access({
        host: env.FTP_HOST,
        port: parseInt(env.FTP_PORT || '21'),
        user: env.FTP_USER,
        password: env.FTP_PASSWORD,
        secure: false,
    });
    console.log('Connected to GoDaddy FTP.');

    let uploaded = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < videoFiles.length; i++) {
        const localPath = videoFiles[i];
        const relPath = path.relative(VIDEOS_DIR, localPath).split(path.sep).join('/');
        const remoteDir = `${REMOTE_BASE}/${relPath.split('/').slice(0, -1).join('/')}`;
        const remoteFile = `${remoteDir}/video.mp4`;
        const localSize = fs.statSync(localPath).size;
        const publicUrl = `${PUBLIC_URL_BASE}/${relPath}`;

        process.stdout.write(`[${i + 1}/${videoFiles.length}] ${relPath} ... `);

        try {
            // Resume support: skip if remote file already matches local size
            let remoteExists = false;
            try {
                const remoteSize = await client.size(remoteFile);
                if (remoteSize === localSize) remoteExists = true;
            } catch {
                remoteExists = false;
            }

            if (remoteExists) {
                console.log('already uploaded, skipping.');
                skipped++;
            } else {
                await client.ensureDir(remoteDir);
                await client.cd('/'); // ensureDir changes cwd; reset for absolute paths below
                await client.uploadFrom(localPath, remoteFile);
                console.log('uploaded.');
                uploaded++;
            }

            const { category, subCategory, title } = deriveMeta(relPath);
            manifest.videos[relPath] = {
                ...(manifest.videos[relPath] || {}),
                category,
                subCategory,
                title,
                videoUrl: publicUrl,
                size: localSize,
            };

            // Persist incrementally so a crash mid-run doesn't lose progress
            saveManifest(manifest);
        } catch (e) {
            errors++;
            console.log('FAILED:', e.message);
        }
    }

    client.close();
    console.log(`\nDone. Uploaded ${uploaded}, skipped ${skipped}, errors ${errors}.`);
    console.log(`Manifest written to ${MANIFEST_PATH}`);
}

main().catch((e) => {
    console.error('Fatal error:', e.message);
    process.exit(1);
});
