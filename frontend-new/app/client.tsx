'use client';
import Home from '@/views/Home';
// SSR: rendered on the server for crawlable content, hydrated on the client.
export default function Client() {
  return <Home />;
}
