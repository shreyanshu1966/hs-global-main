'use client';
import Blogs from '@/views/Blogs';
// SSR: seeded with server-fetched blog list, hydrated on the client.
export default function Client({ initialBlogs }: { initialBlogs?: any[] }) {
  return <Blogs initialBlogs={initialBlogs} />;
}
