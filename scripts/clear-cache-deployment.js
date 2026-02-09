#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Add timestamp to index.html to force refresh
const indexPath = path.join(__dirname, '../frontend/dist/index.html');
if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  const timestamp = Date.now();
  
  // Add timestamp query parameter to critical resources
  content = content.replace(
    /<link([^>]*href=["'][^"']*\.css[^"']*)["']/g, 
    (match, p1) => `<link${p1}?v=${timestamp}"`
  );
  
  content = content.replace(
    /<script([^>]*src=["'][^"']*\.js[^"']*)["']/g, 
    (match, p1) => `<script${p1}?v=${timestamp}"`
  );
  
  fs.writeFileSync(indexPath, content);
  console.log(`✅ Cache busting applied with timestamp: ${timestamp}`);
} else {
  console.log('❌ dist/index.html not found');
}