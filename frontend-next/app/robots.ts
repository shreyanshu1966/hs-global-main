import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/server/api';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/login',
          '/login-otp',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
          '/checkout',
          '/checkout-success',
          '/profile',
          '/wishlist',
          '/orders',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
