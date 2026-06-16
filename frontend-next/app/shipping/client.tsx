'use client';
import Services from '@/views/Services';
// SSR: rendered on the server for crawlable content, hydrated on the client.
export default function Client() {
  return <Services />;
}
