#!/usr/bin/env node

/**
 * Authentication System Setup Script
 * 
 * This script helps set up the authentication system by:
 * 1. Checking if .env file exists
 * 2. Generating a secure JWT_SECRET if needed
 * 3. Validating MongoDB connection
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

console.log('🔐 Authentication System Setup\n');

// Check if .env exists
if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env file not found!');

    if (fs.existsSync(envExamplePath)) {
        console.log('📋 Copying .env.example to .env...');
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Created .env file\n');
    } else {
        console.log('❌ .env.example not found. Creating basic .env file...');
        const basicEnv = `# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/hs_global

# JWT Secret
JWT_SECRET=${crypto.randomBytes(32).toString('hex')}

# Server Configuration
PORT=3000
NODE_ENV=development
`;
        fs.writeFileSync(envPath, basicEnv);
        console.log('✅ Created basic .env file\n');
    }
}

// Read .env file
let envContent = fs.readFileSync(envPath, 'utf8');

// Check for JWT_SECRET
if (!envContent.includes('JWT_SECRET=') || envContent.includes('JWT_SECRET=your-')) {
    console.log('🔑 Generating secure JWT_SECRET...');
    const jwtSecret = crypto.randomBytes(32).toString('hex');

    if (envContent.includes('JWT_SECRET=')) {
        // Replace existing placeholder
        envContent = envContent.replace(/JWT_SECRET=.*/g, `JWT_SECRET=${jwtSecret}`);
    } else {
        // Add new JWT_SECRET
        envContent += `\n# JWT Secret\nJWT_SECRET=${jwtSecret}\n`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Generated and saved JWT_SECRET\n');
} else {
    console.log('✅ JWT_SECRET already configured\n');
}

// Check MongoDB URI
if (!envContent.includes('MONGODB_URI=') || envContent.includes('MONGODB_URI=your_')) {
    console.log('⚠️  MongoDB URI not configured!');
    console.log('📝 Please update MONGODB_URI in .env file');
    console.log('   Example: MONGODB_URI=mongodb://localhost:27017/hs_global\n');
}

console.log('✨ Setup complete!\n');
console.log('Next steps:');
console.log('1. Review and update .env file with your configuration');
console.log('2. Ensure MongoDB is running');
console.log('3. Start the server: npm start');
console.log('4. Test authentication at http://localhost:5173/signup\n');
