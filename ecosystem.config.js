module.exports = {
  apps: [
    // Main Backend API Server
    // Name + cwd match the live, serving PM2 process so deploys reload the
    // right app. cwd must be the backend dir so server.js loads backend/.env.
    {
      name: 'project-backend',
      script: 'server.js',
      cwd: __dirname + '/backend',
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
    },

    // Next.js Frontend
    {
      name: 'hs-frontend',
      script: 'node_modules/.bin/next',
      args: 'start --port 3001',
      cwd: __dirname + '/frontend-new',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      }
    }
  ]
};
