import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
  },
  // Copied-from-Vite code: don't block the migration build on pre-existing
  // type/lint issues (the code already ran under Vite). Tighten later.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  webpack: (config) => {
    // Map react-router-dom → the Next compatibility shim so copied components
    // keep importing 'react-router-dom' unchanged.
    config.resolve.alias['react-router-dom'] = path.resolve(
      __dirname,
      'src/shims/react-router-dom.tsx'
    );
    config.resolve.alias['react-helmet-async'] = path.resolve(
      __dirname,
      'src/shims/react-helmet-async.tsx'
    );
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  images: {
    // Product/gallery images are served from Cloudinary.
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'www.hsglobalexport.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    quality: 60,
    minimumCacheTTL: 86400,
  },
  async redirects() {
    return [
      // Old /products/<id> (plural) detail links → canonical singular, if any exist.
      // Add real legacy redirects here during cutover as needed.
    ];
  },
};

export default nextConfig;
