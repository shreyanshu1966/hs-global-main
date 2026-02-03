require('dotenv').config();
const ftp = require('basic-ftp');

async function testFTPConnection() {
    console.log('🧪 Testing FTP Connection to GoDaddy...\n');
    
    const configs = [
        {
            name: 'Original (ftp.hsglobalexport.com)',
            host: 'ftp.hsglobalexport.com',
        },
        {
            name: 'Without FTP prefix (hsglobalexport.com)',
            host: 'hsglobalexport.com',
        },
        {
            name: 'WWW prefix (www.hsglobalexport.com)',
            host: 'www.hsglobalexport.com',
        }
    ];

    const user = process.env.FTP_USER;
    const password = process.env.FTP_PASSWORD;
    const port = parseInt(process.env.FTP_PORT || '21');

    console.log('Testing with credentials:');
    console.log(`User: ${user}`);
    console.log(`Port: ${port}`);
    console.log(`Password: ${password ? '****' + password.slice(-4) : 'NOT SET'}\n`);

    for (const config of configs) {
        const client = new ftp.Client();
        client.ftp.verbose = true; // Show detailed logs
        
        console.log(`\n📡 Testing: ${config.name}`);
        console.log(`Host: ${config.host}`);
        console.log('─'.repeat(50));
        
        try {
            await client.access({
                host: config.host,
                port: port,
                user: user,
                password: password,
                secure: false
            });
            
            console.log(`\n✅ SUCCESS! Connection established to ${config.host}`);
            console.log(`\n🎯 Update your .env file with:`);
            console.log(`FTP_HOST=${config.host}\n`);
            
            // Try to list directory
            console.log('📁 Testing directory access...');
            const list = await client.list();
            console.log('Directory listing successful:');
            list.slice(0, 5).forEach(item => {
                console.log(`  - ${item.name} (${item.type})`);
            });
            
            client.close();
            console.log('\n✅ All tests passed!\n');
            return;
            
        } catch (error) {
            console.log(`\n❌ FAILED: ${error.message}`);
            client.close();
        }
    }
    
    console.log('\n\n⚠️  All connection attempts failed!');
    console.log('\n💡 Troubleshooting steps:');
    console.log('1. Check GoDaddy cPanel → Files → FTP Accounts');
    console.log('2. Look for "FTP Server" or "Hostname" in your FTP account settings');
    console.log('3. Try using your server IP address instead of hostname');
    console.log('4. Verify username and password are correct');
    console.log('5. Ensure FTP is enabled (not just SFTP)');
    console.log('6. Check if firewall/antivirus is blocking FTP port 21\n');
}

testFTPConnection().catch(console.error);
