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
    },
    // SEO SSR Server (for bot detection and meta tags)
    {
      name: 'hs-seo-ssr',
      script: './backend/seo-ssr-server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        SSR_PORT: 4000,
        SITE_URL: 'https://www.hsglobalexport.com'
      },
      env_production: {
        NODE_ENV: 'production',
        SSR_PORT: 4000,
        SITE_URL: 'https://www.hsglobalexport.com'
      }
    }
  ]
};
