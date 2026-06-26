const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (file === 'page.tsx') {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            
            // replace `seo?.title ??` with `seo?.title ||`
            content = content.replace(/seo\?\.title\s*\?\?/g, 'seo?.title ||');
            content = content.replace(/seo\?\.description\s*\?\?/g, 'seo?.description ||');
            content = content.replace(/seo\?\.canonical\s*\?\?/g, 'seo?.canonical ||');
            
            content = content.replace(/cat\?\.seo\?\.metaTitle\s*\?\?/g, 'cat?.seo?.metaTitle ||');
            content = content.replace(/cat\?\.seo\?\.metaDescription\s*\?\?/g, 'cat?.seo?.metaDescription ||');
            content = content.replace(/cat\?\.seo\?\.canonicalUrl\s*\?\?/g, 'cat?.seo?.canonicalUrl ||');

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

walkDir(appDir);
