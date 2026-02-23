module.exports = {
  apps: [
    // Main Backend API Server
    {
      name: 'hs-backend-api',
      script: './backend/server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        ALLOWED_ORIGINS: 'https://www.hsglobalexport.com,https://hsglobalexport.com,http://localhost:5173,http://localhost:3000'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        ALLOWED_ORIGINS: 'https://www.hsglobalexport.com,https://hsglobalexport.com,http://localhost:5173,http://localhost:3000'
      }
    }
  ]
};
