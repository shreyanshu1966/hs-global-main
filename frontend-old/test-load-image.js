import { loadImageUrl } from './src/data/slabs.loader';

// Test the loadImageUrl function
const testPath = "/src/assets/Collection/Granite/Alaska/Alaska Pink/ALASKA-PINK-.webp";

loadImageUrl(testPath).then(url => {
  console.log('Test result:', url);
}).catch(err => {
  console.error('Test failed:', err);
});