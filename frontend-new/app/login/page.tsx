import type { Metadata } from 'next';
import Client from './client';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <h1 className="sr-only">Login to HS Global Export</h1>
      <Client />
    </>
  );
}
