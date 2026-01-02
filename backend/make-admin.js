const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
} else {
    console.warn('.env file not found, using environment variables');
}

async function makeAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hs-global');
        console.log('Connected to MongoDB');

        // Get email from command line argument or use default
        const email = process.argv[2];

        if (!email) {
            console.error('Please provide an email address');
            console.log('Usage: node make-admin.js <email>');
            console.log('Example: node make-admin.js admin@example.com');
            process.exit(1);
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.error(`User with email "${email}" not found`);
            console.log('Please make sure the user exists in the database');
            process.exit(1);
        }

        // Check if already admin
        if (user.role === 'admin') {
            console.log(`User "${user.name}" (${user.email}) is already an admin`);
            process.exit(0);
        }

        // Update to admin
        user.role = 'admin';
        await user.save();

        console.log('✅ Success!');
        console.log(`User "${user.name}" (${user.email}) is now an admin`);
        console.log('They can now access the admin dashboard at /admin');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

makeAdmin();
