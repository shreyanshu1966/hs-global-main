#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'final_missing_products_report.json'), 'utf8'));
console.log('WOODEN missing:', report.wooden.missing.map((m) => m.code).join(','));
console.log('MARBLE missing:', report.marble.missing.map((m) => m.code).join(','));
