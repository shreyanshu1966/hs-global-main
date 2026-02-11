const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
}

async function updateAdminPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hs-global');
        console.log('Connected to MongoDB');

        const email = 'admin@hsglobal.com';
        const newPassword = 'admin123';

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.error('❌ Admin user not found');
            process.exit(1);
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        user.role = 'admin';
        user.emailVerified = true;
        await user.save();

        console.log('✅ Admin password updated successfully');
        console.log('  Email:', email);
        console.log('  Password:', newPassword);
        console.log('  Role:', user.role);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateAdminPassword();
