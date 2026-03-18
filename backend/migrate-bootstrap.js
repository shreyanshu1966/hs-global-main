const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const backendRoot = __dirname;
const envPath = path.join(backendRoot, '.env');

if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
}

const args = process.argv.slice(2);

const getArgValue = (flag) => {
    const index = args.findIndex((arg) => arg === flag);
    if (index === -1) return undefined;
    return args[index + 1];
};

const hasFlag = (flag) => args.includes(flag);

const adminEmail = getArgValue('--admin-email') || process.env.ADMIN_EMAIL;
const adminName = getArgValue('--admin-name') || process.env.ADMIN_NAME;
const adminPassword = getArgValue('--admin-password') || process.env.ADMIN_PASSWORD;
const adminPhone = getArgValue('--admin-phone') || process.env.ADMIN_PHONE;

const skipReviews = hasFlag('--skip-reviews');
const skipAdmin = hasFlag('--skip-admin');
const dryRun = hasFlag('--dry-run');

const runNodeScript = (scriptRelativePath, scriptArgs = []) => {
    return new Promise((resolve, reject) => {
        const fullScriptPath = path.join(backendRoot, scriptRelativePath);
        const child = spawn(process.execPath, [fullScriptPath, ...scriptArgs], {
            cwd: backendRoot,
            stdio: 'inherit',
            env: process.env,
        });

        child.on('error', (error) => reject(error));
        child.on('exit', (code) => {
            if (code === 0) {
                resolve();
                return;
            }
            reject(new Error(`${scriptRelativePath} exited with code ${code}`));
        });
    });
};

const run = async () => {
    console.log('============================================');
    console.log('HS Global DB Bootstrap: Furniture + Reviews + Admin');
    console.log('============================================');

    if (dryRun) {
        console.log('Mode: DRY RUN (furniture migration only)');
        await runNodeScript(path.join('scripts', 'migrate-furniture-db.js'), ['--dry-run']);
        console.log('Dry run finished.');
        return;
    }

    console.log('Step 1/3: Migrating furniture products...');
    await runNodeScript(path.join('scripts', 'migrate-furniture-db.js'), ['--apply']);

    if (!skipReviews) {
        console.log('Step 2/3: Seeding reviews...');
        await runNodeScript('seed-reviews.js');
    } else {
        console.log('Step 2/3: Skipped review seeding (--skip-reviews).');
    }

    if (!skipAdmin) {
        if (!adminEmail) {
            throw new Error('Admin setup requires --admin-email (or ADMIN_EMAIL in .env).');
        }

        const adminArgs = [adminEmail];

        if (adminName && adminPassword) {
            adminArgs.push(adminName, adminPassword);
            if (adminPhone) {
                adminArgs.push(adminPhone);
            }
        }

        console.log('Step 3/3: Creating/promoting admin user...');
        await runNodeScript('create-admin.js', adminArgs);
    } else {
        console.log('Step 3/3: Skipped admin setup (--skip-admin).');
    }

    console.log('============================================');
    console.log('Bootstrap completed successfully.');
    console.log('============================================');
};

run().catch((error) => {
    console.error('Bootstrap failed:', error.message);
    process.exitCode = 1;
});
