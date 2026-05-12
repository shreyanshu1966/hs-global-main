const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Configuration
const FRONTEND_ASSETS_DIR = path.join(__dirname, '../frontend/src/assets');
const FURNITURE_DIR = path.join(FRONTEND_ASSETS_DIR, 'furnitures');
const SLABS_DIR = path.join(FRONTEND_ASSETS_DIR, 'Collection');
const SPECS_FILE = path.join(__dirname, '../frontend/src/data/furnitureSpecs.ts');

const URLS_FILE = path.join(__dirname, '../product-cloudinary-urls.json');

const Product = require('./models/Product');

// Load URL mappings
let urlMappings = {};
try {
    if (fs.existsSync(URLS_FILE)) {
        const data = JSON.parse(fs.readFileSync(URLS_FILE, 'utf8'));
        urlMappings = data.urls || {};
        console.log(`Loaded ${Object.keys(urlMappings).length} Cloudinary URL mappings`);
    }
} catch (e) {
    console.error('Failed to load Cloudinary mappings:', e.message);
}

// --- UTILS ---

const decode = (s) => {
    try {
        return decodeURIComponent(s.replace(/\+/g, " "));
    } catch (e) {
        return s;
    }
};

const toSlug = (s) =>
    decode(s)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const toTitle = (s) =>
    decode(s)
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());

const normalize = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();

const sanitizeStoneName = (raw) => {
    const decoded = toTitle(decode(raw));
    const cleaned = decoded
        .replace(/\b(Marble|Granite|Onyx|Travertine|Sandstone)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    return cleaned.length ? cleaned : decoded;
};

const GENERIC_NAMES = new Set([
  'White', 'Black', 'Brown', 'Beige', 'Green', 'Red', 'Pink', 'Yellow', 'Gold', 'Blue', 'Grey', 'Gray', 'Silver', 'Orange', 'Rainbow', 'Multi Color', 'Multicolor', 'Cream'
]);

const disambiguate = (name, categoryKey, groupKey) => {
  const n = name.trim();
  if (GENERIC_NAMES.has(n)) {
    if (categoryKey === 'Granite' && groupKey) return `${sanitizeStoneName(groupKey)} ${n}`;
    return `${toTitle(categoryKey)} ${n}`;
  }
  return n;
};

// Recursive file walker
function walkSync(dir, filelist = []) {
    if (!fs.existsSync(dir)) return filelist;
    const files = fs.readdirSync(dir);
    files.forEach(function (file) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            filelist = walkSync(filepath, filelist);
        } else {
            if (/\.(webp|jpg|jpeg|png)$/i.test(file)) {
                filelist.push(filepath);
            }
        }
    });
    return filelist;
}

const getCloudinaryUrl = (absPath) => {
   // Construct relative path as used in the JSON key
   // e.g. furnitures/Tables/...
   let relPath = '';
   if (absPath.includes(path.join('assets', 'furnitures'))) {
       const parts = absPath.split(path.join('assets', 'furnitures'));
       relPath = 'furnitures' + parts[1].replace(/\\/g, '/');
   } else if (absPath.includes(path.join('assets', 'Collection'))) {
       const parts = absPath.split(path.join('assets', 'Collection'));
       relPath = 'Collection' + parts[1].replace(/\\/g, '/');
   } else {
        relPath = path.basename(absPath);
   }
   
   // Lookup in mappings
   // The keys in JSON are like "Collection/..." so relPath should match
   // Note: JSON keys might use forward slashes. relPath uses forward slashes.
   // But we need to handle "src/assets/..." prefix if present in the JSON keys?
   // The file showed keys starting with "Collection/..." directly.
   
   if (urlMappings[relPath] && urlMappings[relPath].cloudinary) {
       return urlMappings[relPath].cloudinary;
   }
   
   // If not found, try adding 'src/assets/' prefix or verify path normalization
   // But for now, fallback to generic URL (which might be broken)
   // https://res.cloudinary.com/dti5vep0b/image/upload/{relPath}
   return `https://res.cloudinary.com/dti5vep0b/image/upload/${relPath}`;
}



// --- FURNITURE SPECS PARSER ---
function parseFurnitureSpecs() {
    console.log('Parsing furniture specs...');
    const content = fs.readFileSync(SPECS_FILE, 'utf8');
    
    // Find start
    const marker = 'const furnitureSpecsData: Record<string, FurnitureSpec> =';
    const startIndex = content.indexOf(marker);
    if (startIndex === -1) { 
        console.error('Start of data object not found');
        return {}; 
    }
    
    // Find the first {
    let cursor = content.indexOf('{', startIndex);
    if (cursor === -1) return {};
    
    const startObjIndex = cursor;
    let braceCount = 1;
    cursor++; // Move into the object
    
    // Scan for matching closing brace
    while (cursor < content.length && braceCount > 0) {
        const char = content[cursor];
        if (char === '{') braceCount++;
        else if (char === '}') braceCount--;
        cursor++;
    }
    
    if (braceCount !== 0) {
        console.error('Unbalanced braces found');
        return {};
    }
    
    let objectString = content.substring(startObjIndex, cursor);
    
    // CLEANUP
    // Remove comments
    objectString = objectString.replace(/^\s*\/\/.*$/gm, '');
    
    try {
        const specs = eval('(' + objectString + ')');
        return specs;
    } catch (e) {
        console.error('Error evaluating specs object:', e.message);
        return {};
    }
}


// --- MAIN MIGRATION LOGIC ---

async function migrate() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export');
    console.log('Connected to MongoDB');

    try {
        // Clear existing? Maybe. Let's update/upsert to be safe.
        // await Product.deleteMany({}); 
        // console.log('Cleared existing products');

        const specsData = parseFurnitureSpecs();
        console.log(`Loaded ${Object.keys(specsData).length} furniture specs`);

        const allProducts = [];

        // 1. Process Furniture
        if (fs.existsSync(FURNITURE_DIR)) {
            console.log('Processing Furniture...');
            const furnitureFiles = walkSync(FURNITURE_DIR);
            
            // Group by product
            const productGroups = {};

            furnitureFiles.forEach(f => {
                // Structure: .../furnitures/Category/Subcategory/ProductName/image.webp
                // OR: .../furnitures/Category/ProductName/image.webp (Handles "Benches" etc)
                
                const parts = f.split(path.sep);
                const furnitureIdx = parts.indexOf('furnitures');
                if (furnitureIdx === -1) return;
                
                const relParts = parts.slice(furnitureIdx + 1);
                // relParts[0] = Category (Tables, Wash Basins)
                // relParts[1] = Subcategory OR Product
                // relParts[2] = Product OR Image
                
                let categoryName = decode(relParts[0]);
                let subcategoryName = null;
                let productName = null;
                
                // Heuristic from products.ts
                 if ((categoryName === "Tables" || categoryName === "Wash Basins" || categoryName === "WashBasins") && relParts.length >= 4) {
                    subcategoryName = decode(relParts[1]); // e.g. Coffee Table
                    productName = decode(relParts[2]);     // e.g. Black Galaxy
                } else if (relParts.length >= 3) {
                    subcategoryName = categoryName;        // e.g. Benches
                    productName = decode(relParts[1]);
                } else {
                    return;
                }
                
                // Normalization
                if (/(wash\s*basins?|washbasins)/i.test(categoryName)) categoryName = "Wash Basins";
                categoryName = toTitle(categoryName);
                if (subcategoryName) subcategoryName = toTitle(subcategoryName);
                if (productName) productName = toTitle(productName);
                
                const key = `${categoryName}|${subcategoryName}|${productName}`;
                
                if (!productGroups[key]) {
                    productGroups[key] = {
                        name: productName,
                        category: 'furniture',
                        subcategory: subcategoryName, // Frontend uses specific subcat names
                        images: []
                    };
                }
                
                productGroups[key].images.push(getCloudinaryUrl(f));
            });

            // Iterate groups and build product objects
            for (const key in productGroups) {
                const p = productGroups[key];
                
                // Find specs
                const normalizedName = normalize(p.name);
                const spec = specsData[normalizedName]; // Look up by name
                
                // Fallback spec lookup (sometimes names slightly differ)
                let finalSpec = spec;
                if (!finalSpec) {
                     // Try partial matches or specific overrides if needed
                     const foundKey = Object.keys(specsData).find(k => normalizedName.includes(k) || k.includes(normalizedName));
                     if (foundKey) finalSpec = specsData[foundKey];
                }
                
                const priceUSD = finalSpec?.priceUSD;
                // If not available in specs, mark unavailable? Frontend does this.
                // But let's migrate everything, just maybe mark unavailable if no price.
                
                const productDoc = {
                    productId: toSlug(p.name),
                    name: p.name,
                    category: 'furniture',
                    subcategory: p.subcategory,
                    description: `${p.name} - ${p.subcategory}. Premium quality stone furniture.`,
                    image: p.images[0], // Need better sorting logic, but first found is okay for now
                    images: p.images,
                    sortedImages: p.images, // TODO: Sort
                    priceUSD: priceUSD || 0,
                    available: !!priceUSD,
                    hasVideo: true,
                    furnitureSpecs: finalSpec || {},
                    status: 'active'
                };
                
                allProducts.push(productDoc);
            }
        }

        // 2. Process Slabs
        if (fs.existsSync(SLABS_DIR)) {
            console.log('Processing Slabs...');
            const slabFiles = walkSync(SLABS_DIR);
            
            const slabGroups = {};
            
            slabFiles.forEach(f => {
                // Structure: .../Collection/Granite/Group/Product/image.webp
                // OR: .../Collection/Marble/Product/image.webp
                
                const parts = f.split(path.sep);
                const collIdx = parts.indexOf('Collection');
                if (collIdx === -1) return;
                
                const relParts = parts.slice(collIdx + 1);
                // relParts[0] = Category (Granite, Marble)
                
                const categoryType = decode(relParts[0]);
                
                if (categoryType.toLowerCase().includes('not found')) return;
                
                let groupName = null;
                let productName = null;
                let isStand = f.toLowerCase().includes('stand');
                
                if (categoryType === 'Granite') {
                    if (relParts.length < 3) return;
                    groupName = decode(relParts[1]);
                    productName = decode(relParts[2]);
                } else {
                    // Marble, etc.
                    productName = decode(relParts[1]);
                }
                
                const realProductName = categoryType === 'Granite' ? productName : productName;
                // We need to construct the unique key
                const key = categoryType === 'Granite' 
                    ? `Granite|${groupName}|${productName}`
                    : `${categoryType}|${productName}`;
                    
                
                if (!slabGroups[key]) {
                    slabGroups[key] = {
                        type: categoryType,
                        group: groupName,
                        rawName: productName,
                        images: [],
                        standImages: []
                    };
                }
                
                if (isStand) {
                    slabGroups[key].standImages.push(getCloudinaryUrl(f));
                } else {
                    slabGroups[key].images.push(getCloudinaryUrl(f));
                }
            });
            
            // Build Slab Products
            for (const key in slabGroups) {
                const s = slabGroups[key];
                
                const baseName = sanitizeStoneName(s.rawName);
                const finalName = disambiguate(baseName, s.type, s.group);
                const subcategory = s.type === 'Granite' ? sanitizeStoneName(s.group) : s.type; // Subcategory ID logic
                
                const allImages = [...s.standImages, ...s.images];
                const mainImage = allImages.length > 0 ? allImages[0] : '';
                
                const productDoc = {
                    productId: toSlug(finalName),
                    name: finalName,
                    category: 'slabs',
                    subcategory: toSlug(subcategory), // use slug as subcategory ID often? Or Name? Model expects String
                    description: `${finalName} ${s.type.toLowerCase()} slab. Durable and ideal for interiors.`,
                    image: mainImage,
                    images: allImages,
                    sortedImages: allImages,
                    // Slabs usually don't have priceUSD in the static file? 
                    // migrate-products.js from before didn't have prices for slabs.
                    priceUSD: 0, 
                    available: true, 
                    slabSpecs: {
                        material: s.type,
                        origin: 'India',
                        finish: 'Polished',
                        thickness: '18-20mm',
                        application: 'Flooring, Countertops, Cladding'
                    },
                    status: 'active'
                };
                
                allProducts.push(productDoc);
            }
        }

        console.log(`Prepared ${allProducts.length} products for migration.`);
        
        // Batch Insert / Upsert
        let successCount = 0;
        let errorCount = 0;

        for (const p of allProducts) {
            try {
                // Use updateOne with upsert to prevent duplicates/errors
                await Product.updateOne(
                    { productId: p.productId },
                    { $set: p },
                    { upsert: true }
                );
                successCount++;
                if (successCount % 10 === 0) process.stdout.write('.');
            } catch (err) {
                console.error(`\nFailed to migrate ${p.name}:`, err.message);
                errorCount++;
            }
        }

        console.log(`\nMigration Complete! Success: ${successCount}, Errors: ${errorCount}`);

    } catch (err) {
        console.error('Fatal Migration Error:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
}

migrate();
