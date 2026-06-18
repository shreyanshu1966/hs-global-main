'use client';
import Contact from '@/views/Contact';
// SSR: rendered on the server for crawlable content, hydrated on the client.
export default function Client() {
  return <Contact />;
}
