import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/server/api';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const title = `Privacy Policy | ${SITE_NAME}`;
  const description =
    'How HS Global Export collects, uses and protects your personal data when you browse, enquire or order our furniture and semi-precious stone products.';
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
        This Privacy Policy explains how {SITE_NAME} &mdash; a brand operated by <strong>HS Global Trader</strong>, a
        sole proprietorship registered in India (GSTIN: 24LDVPK5381D1Z1) &mdash; collects, uses and safeguards your
        information when you visit{' '}
        <a href={SITE_URL} className="underline">hsglobalexport.com</a>, submit an enquiry, or place an order. For
        the purposes of data protection law, including the EU/UK GDPR and India&rsquo;s Digital Personal Data
        Protection Act, we are the data controller.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Information we collect</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
        <li>Contact and identity details you provide (name, email, phone, billing and shipping address).</li>
        <li>Order, transaction and communication details needed to fulfil and support your purchase.</li>
        <li>Payment information, which is processed securely by our payment providers (we do not store full card details).</li>
        <li>Usage and device data such as pages viewed, IP address and browser type, collected via cookies and analytics.</li>
      </ul>

      <h2 className="mt-8 text-xl font-medium text-gray-900">How and why we use your information</h2>
      <p className="mt-3 leading-relaxed">We use your data on the following legal bases:</p>
      <ul className="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
        <li><strong>To perform our contract with you</strong> &mdash; to process, manufacture, ship and support your orders and respond to enquiries and quotations.</li>
        <li><strong>For our legitimate interests</strong> &mdash; to operate, secure and improve the website and prevent fraud, including order verification.</li>
        <li><strong>With your consent</strong> &mdash; to send marketing communications and to set non-essential cookies.</li>
        <li><strong>To meet legal obligations</strong> &mdash; for tax, accounting and regulatory requirements.</li>
      </ul>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Marketing</h2>
      <p className="mt-3 leading-relaxed">
        We send marketing emails or SMS only where you have given consent. You can opt out at any time using the
        unsubscribe link or by contacting us.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Who we share your information with</h2>
      <p className="mt-3 leading-relaxed">
        We share data only with service providers who help us run our business, and only as needed to deliver our
        service &mdash; including payment processors (Razorpay, PayPal, Payoneer), shipping and logistics carriers
        (such as DHL, FedEx and India Post), and our hosting, analytics, email and customer-support tools. We do not
        sell your personal data. We may also disclose data where required by law.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">International data transfers</h2>
      <p className="mt-3 leading-relaxed">
        As we operate from India and serve customers worldwide, your data may be processed in countries outside your
        own, including India. Where required, we take appropriate safeguards to protect your data in line with
        applicable law.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">How long we keep your data</h2>
      <p className="mt-3 leading-relaxed">
        We keep customer and order data only as long as needed to provide our service and to meet tax, accounting and
        legal requirements, after which it is deleted or anonymised.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Your rights</h2>
      <p className="mt-3 leading-relaxed">
        Depending on your location, you may have the right to access, correct, delete, restrict or object to the
        processing of your personal data, to data portability, and to withdraw consent at any time. You can also opt
        out of marketing at any time. To exercise your rights, contact us using the details below. If you are in the
        EU or UK, you also have the right to lodge a complaint with your local data protection authority. See our{' '}
        <a href="/cookies" className="underline">Cookie Policy</a> for how to manage cookies.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Security</h2>
      <p className="mt-3 leading-relaxed">
        We apply reasonable technical and organisational measures to protect your data against unauthorised access,
        loss or misuse. No method of transmission over the internet is completely secure, but we work to safeguard
        your information.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Children&rsquo;s privacy</h2>
      <p className="mt-3 leading-relaxed">
        Our website is intended for users aged 18 and over. We do not knowingly collect personal data from children.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Changes to this policy</h2>
      <p className="mt-3 leading-relaxed">
        We may update this Privacy Policy from time to time. The version published on this page is the one that
        applies.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Contact</h2>
      <p className="mt-3 leading-relaxed">
        For any privacy request, email{' '}
        <a href="mailto:inquiry@hsglobalexport.com" className="underline">inquiry@hsglobalexport.com</a>, call{' '}
        <a href="tel:+918107115116" className="underline">+91&nbsp;81071&nbsp;15116</a>, or write to HS Global
        Trader, C-108, Titanium Business Park, Makarba, Ahmedabad &ndash; 380051, Gujarat, India.
      </p>
    </main>
  );
}
