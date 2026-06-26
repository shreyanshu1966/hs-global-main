import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/server/api';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const title = `Cookie Policy & Preferences | ${SITE_NAME}`;
  const description =
    'What cookies HS Global Export uses, why we use them, and how you can manage your cookie preferences.';
  const canonical = `${SITE_URL}/cookies`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { type: 'website', siteName: SITE_NAME, title, description, url: canonical },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-gray-800">
      <h1 className="text-3xl font-medium text-gray-900">Cookie Policy &amp; Preferences</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: June 2026</p>

      <p className="mt-6 leading-relaxed">
        {SITE_NAME} uses cookies and similar technologies to run the website, remember your preferences and
        understand how the site is used.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Types of cookies we use</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
        <li><strong>Essential</strong> &mdash; required for core features such as the cart and secure checkout.</li>
        <li><strong>Preferences</strong> &mdash; remember choices like language and region.</li>
        <li><strong>Analytics</strong> &mdash; help us measure traffic and improve the site.</li>
      </ul>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Managing your preferences</h2>
      <p className="mt-3 leading-relaxed">
        You can control or delete cookies through your browser settings at any time. Blocking some cookies may
        affect how parts of the site work. This site also uses Google reCAPTCHA, which is governed by Google&rsquo;s{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>{' '}
        and{' '}
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">Terms of Service</a>.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">More information</h2>
      <p className="mt-3 leading-relaxed">
        See our <a href="/privacy" className="underline">Privacy Policy</a> for how we handle personal data, or
        email <a href="mailto:inquiry@hsglobalexport.com" className="underline">inquiry@hsglobalexport.com</a>.
      </p>
    </main>
  );
}
