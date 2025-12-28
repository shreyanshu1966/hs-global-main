const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.warn('⚠️ MONGODB_URI is not defined in .env. MongoDB connection will fail.');
        }

        const conn = await mongoose.connect(uri || 'mongodb://localhost:27017/hs_global', {
            serverSelectionTimeoutMS: 5000,
            dbName: 'hs_global_export', // Explicit DB name
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // Do not exit process, so the server can still run in "degraded" mode (e.g. for health checks)
    }
};

module.exports = connectDB;
