import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/server/api';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const title = `Terms of Service & User Agreement | ${SITE_NAME}`;
  const description =
    'The terms governing your use of the HS Global Export website and the purchase of our granite and marble products.';
  const canonical = `${SITE_URL}/terms`;
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
      <h1 className="text-3xl font-medium text-gray-900">Terms of Service &amp; User Agreement</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: June 2026</p>

      <p className="mt-6 leading-relaxed">
        These terms govern your access to and use of {SITE_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) and any
        order you place with us. By using this website you agree to these terms.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Use of the website</h2>
      <p className="mt-3 leading-relaxed">
        You agree to use this website lawfully and not to misuse, disrupt or attempt to gain unauthorised access
        to it. All content, images and trademarks remain the property of {SITE_NAME} or its licensors.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Products, quotations and orders</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
        <li>As natural stone, products vary in colour, veining and finish; images are representative.</li>
        <li>Quotations are valid for the period stated and are subject to availability.</li>
        <li>An order is confirmed only once we accept it and any required deposit is received.</li>
      </ul>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Pricing and payment</h2>
      <p className="mt-3 leading-relaxed">
        Prices are shown in the applicable currency and may exclude duties, taxes or freight unless stated.
        Payment terms are set out in your quotation or invoice.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Shipping and returns</h2>
      <p className="mt-3 leading-relaxed">
        Delivery timelines, packaging and customs support are described in our{' '}
        <a href="/shipping" className="underline">Shipping Policy</a>. Because items are made to order, please
        contact us before arranging any return.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Liability</h2>
      <p className="mt-3 leading-relaxed">
        To the extent permitted by law, our liability for any order is limited to the value of that order. We are
        not liable for indirect or consequential loss.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Contact</h2>
      <p className="mt-3 leading-relaxed">
        Questions about these terms? Email{' '}
        <a href="mailto:inquiry@hsglobalexport.com" className="underline">inquiry@hsglobalexport.com</a>.
      </p>
    </main>
  );
}
