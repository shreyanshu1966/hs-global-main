// Generates JSON manifests of asset file paths to replace Vite's
// import.meta.glob (unsupported by webpack/Next). The app only uses the path
// KEYS (to build category structure / derive Cloudinary URLs), so a path map
// is sufficient.
import fs from 'fs';
import path from 'path';

function listFiles(dir, exts) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listFiles(p, exts));
    else if (exts.test(e.name)) out.push(p);
  }
  return out;
}

const IMG = /\.(webp|jpe?g|png)$/i;

function manifest(absDir, keyPrefix) {
  const files = listFiles(absDir, IMG);
  const map = {};
  for (const f of files) {
    const rel = path.relative(absDir, f).split(path.sep).join('/');
    const key = `${keyPrefix}/${rel}`;
    map[key] = key;
  }
  return map;
}

// 1) Furniture assets → keys like /src/assets/furnitures/...
const furn = manifest(path.resolve('src/assets/furnitures'), '/src/assets/furnitures');
fs.writeFileSync('src/data/_glob-furnitures.json', JSON.stringify(furn, null, 0));

// 2) Collection (slabs) assets → keys like /src/assets/Collection/...
const coll = manifest(path.resolve('src/assets/Collection'), '/src/assets/Collection');
fs.writeFileSync('src/data/_glob-collection.json', JSON.stringify(coll, null, 0));

// 3) Public gallery → keys like /gallery/... (also the public URL)
const gal = manifest(path.resolve('public/gallery'), '/gallery');
fs.writeFileSync('src/data/_glob-gallery.json', JSON.stringify(gal, null, 0));

console.log(
  `glob manifests: furnitures=${Object.keys(furn).length}, collection=${Object.keys(coll).length}, gallery=${Object.keys(gal).length}`
);
