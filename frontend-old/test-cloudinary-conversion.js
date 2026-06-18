// Quick test to verify Cloudinary URL conversion
// This file can be run in browser console to test the conversion

console.log('Testing Cloudinary URL conversion...');

// Test path that should be in the system
const testPath = "/src/assets/Collection/Granite/Alaska/Alaska Pink/ALASKA-PINK-.webp";

// Simulate the path conversion logic
function pathToCloudinaryUrl(absPath) {
  const idx = absPath.indexOf('/Collection/');
  if (idx === -1) return absPath;
  
  const relativePath = absPath.slice(idx + 1); // Remove leading slash: "Collection/..."
  console.log('Converted path:', relativePath);
  return `Should lookup: ${relativePath} in product-cloudinary-urls.json`;
}

const result = pathToCloudinaryUrl(testPath);
console.log('Result:', result);

// Check what the actual Cloudinary URL should be
console.log('Expected Cloudinary URL: https://res.cloudinary.com/dpztytsoz/image/upload/v1766927334/hs-global/products/Collection/Granite/Alaska/Alaska%20Pink/ALASKA-PINK-.jpg');