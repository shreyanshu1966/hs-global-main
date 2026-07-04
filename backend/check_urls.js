const https = require('https');

const urls = [
  "https://res.cloudinary.com/dynd1aan0/image/upload/v1779285821/hs-global/furniture/etsy/HSMCOTWH5/1.webp",
  "https://res.cloudinary.com/dynd1aan0/image/upload/v1779285823/hs-global/furniture/etsy/HSMCOTWH5/2.webp",
  "https://res.cloudinary.com/dynd1aan0/image/upload/v1779285824/hs-global/furniture/etsy/HSMCOTWH5/3.webp"
];

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (e) => {
      resolve({ url, error: e.message });
    });
  });
}

async function run() {
  for (const url of urls) {
    const result = await checkUrl(url);
    console.log(`${result.status} - ${result.url}`);
  }
}

run();
