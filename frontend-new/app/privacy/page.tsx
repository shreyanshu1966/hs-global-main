import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/server/api';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const title = `Privacy Policy | ${SITE_NAME}`;
  const description =
    'How HS Global Export collects, uses and protects your personal data when you browse, enquire or order premium granite and marble products.';
  const canonical = `${SITE_URL}/privacy`;
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
      <h1 className="text-3xl font-medium text-gray-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: June 2026</p>

      <p className="mt-6 leading-relaxed">
        This Privacy Policy explains how {SITE_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses and
        safeguards information when you visit{' '}
        <a href={SITE_URL} className="underline">hsglobalexport.com</a>, submit an enquiry, or place an order.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Information we collect</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
        <li>Contact details you provide (name, email, phone, shipping address) when enquiring or ordering.</li>
        <li>Order and transaction details needed to fulfil and ship your purchase.</li>
        <li>Usage data such as pages viewed and device information, collected via cookies and analytics.</li>
      </ul>

      <h2 className="mt-8 text-xl font-medium text-gray-900">How we use your information</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
        <li>To respond to enquiries and provide quotations.</li>
        <li>To process, manufacture, ship and support your orders.</li>
        <li>To improve our website and, where you consent, send updates about our products.</li>
      </ul>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Sharing and security</h2>
      <p className="mt-3 leading-relaxed">
        We share data only with service providers who help us operate (payment, logistics, email and analytics
        partners) and only as needed to deliver our service. We apply reasonable technical and organisational
        measures to protect your data and do not sell it.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Your rights</h2>
      <p className="mt-3 leading-relaxed">
        You may request access to, correction of, or deletion of your personal data, and you can opt out of
        marketing at any time. See our <a href="/cookies" className="underline">Cookie Policy</a> for how to manage cookies.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Contact</h2>
      <p className="mt-3 leading-relaxed">
        For any privacy request, email{' '}
        <a href="mailto:inquiry@hsglobalexport.com" className="underline">inquiry@hsglobalexport.com</a>{' '}
        or write to C-108, Titanium Business Park, Makarba, Ahmedabad &ndash; 380051, India.
      </p>
    </main>
  );
}
