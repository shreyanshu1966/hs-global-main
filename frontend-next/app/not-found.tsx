import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-4xl font-semibold text-primary">Page Not Found</h1>
      <p className="mt-4 text-text-secondary">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link href="/" className="mt-8 rounded bg-primary px-6 py-3 text-white hover:opacity-90">
        Back to Home
      </Link>
    </main>
  );
}
