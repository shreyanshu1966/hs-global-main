import type { Metadata } from 'next';
import Client from './client';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Live Chat Management | HS Global Admin',
  robots: { index: false, follow: false }
};

export default function Page() {
  return <Client />;
}
