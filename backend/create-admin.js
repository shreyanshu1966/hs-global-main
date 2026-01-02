const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
} else {
    console.warn('.env file not found, using environment variables');
}

async function createOrUpdateAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hs-global');
        console.log('Connected to MongoDB');

        // Get email from command line argument
        const email = process.argv[2];
        const name = process.argv[3];
        const password = process.argv[4];

        if (!email) {
            console.error('Please provide an email address');
            console.log('\nUsage:');
            console.log('  To promote existing user: node create-admin.js <email>');
            console.log('  To create new admin:      node create-admin.js <email> <name> <password>');
            console.log('\nExamples:');
            console.log('  node create-admin.js user@example.com');
            console.log('  node create-admin.js admin@example.com "Admin User" "SecurePassword123"');
            process.exit(1);
        }

        // Find user by email
        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            // User exists, just update to admin
            if (user.role === 'admin') {
                console.log(`✅ User "${user.name}" (${user.email}) is already an admin`);
                process.exit(0);
            }

            user.role = 'admin';
            await user.save();

            console.log('✅ Success!');
            console.log(`User "${user.name}" (${user.email}) is now an admin`);
            console.log('They can now access the admin dashboard at /admin');
        } else {
            // User doesn't exist, create new admin user
            if (!name || !password) {
                console.error(`\n❌ User with email "${email}" not found`);
                console.log('\nTo create a new admin user, provide name and password:');
                console.log(`  node create-admin.js ${email} "Admin Name" "SecurePassword123"`);
                process.exit(1);
            }

            // Create new admin user
            user = new User({
                email: email.toLowerCase(),
                name: name,
                password: password, // Will be hashed by the pre-save hook
                role: 'admin',
                emailVerified: true // Auto-verify admin users
            });

            await user.save();

            console.log('✅ Success!');
            console.log(`New admin user created:`);
            console.log(`  Name: ${user.name}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Password: ${password}`);
            console.log('\n⚠️  IMPORTANT: Save these credentials securely!');
            console.log('They can now login and access the admin dashboard at /admin');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createOrUpdateAdmin();
