'use client';
import BlogDetail from '@/views/BlogDetail';
// SSR: seeded with server-fetched blog data, hydrated on the client.
export default function BlogClient({ initialData }: { initialData?: any }) {
  return <BlogDetail initialData={initialData} />;
}
