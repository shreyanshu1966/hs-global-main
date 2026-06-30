import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/server/api';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const title = `Terms of Service & User Agreement | ${SITE_NAME}`;
  const description =
    'The terms governing your use of the HS Global Export website and the purchase of our wooden, marble and leather furniture and semi-precious stone products.';
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
        {SITE_NAME} is a brand operated by <strong>HS Global Trader</strong>, a sole proprietorship registered in
        India (GSTIN: 24LDVPK5381D1Z1), with its registered office at C-108, Titanium Business Park, Makarba,
        Ahmedabad &ndash; 380051, Gujarat, India (&ldquo;{SITE_NAME}&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;,
        &ldquo;our&rdquo;). These Terms of Service and User Agreement (&ldquo;Terms&rdquo;) govern your access to and
        use of this website and any order you place with us. By accessing the website or placing an order, you
        agree to be bound by these Terms.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">1. Eligibility</h2>
      <p className="mt-3 leading-relaxed">
        You must be at least 18 years old and able to enter into a legally binding contract to use this website or
        place an order. We sell to both businesses (B2B) and individual consumers (B2C). By using the website, you
        confirm that the information you provide is accurate and that you are authorised to make the purchase.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">2. Your account</h2>
      <p className="mt-3 leading-relaxed">
        If you create an account, you are responsible for keeping your login details confidential and for all
        activity under your account. Please provide accurate, current information and keep it up to date. We may
        suspend or terminate accounts that are misused or that breach these Terms.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">3. Our products</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
        <li>We offer wooden furniture, marble furniture, leather furniture and semi-precious stone products.</li>
        <li>
          As natural and handcrafted materials, products vary in colour, grain, veining, texture and finish; images
          are representative and small variations are normal and not a defect.
        </li>
        <li>Many items are made to order or customised; production timelines apply once payment is received.</li>
        <li>We make reasonable efforts to display products and details accurately, but cannot guarantee that your
          screen accurately reflects colours.</li>
      </ul>

      <h2 className="mt-8 text-xl font-medium text-gray-900">4. Quotations, orders and order acceptance</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
        <li>Quotations are valid for the period stated and are subject to availability.</li>
        <li>
          Your order is an offer to buy. A contract is formed only when we confirm acceptance of your order and the
          required payment is received.
        </li>
        <li>
          We may verify orders for fraud prevention and may contact you to confirm payment, shipping or identity
          details before dispatch. We reserve the right to refuse, cancel or limit any order, including where a
          pricing or description error has occurred or where verification cannot be completed.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-medium text-gray-900">5. Pricing and payment</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
        <li>
          Prices are shown in the applicable currency for your region and represent the price of the product only.
          Any taxes, duties or other charges are <strong>not included</strong> in the listed price and may apply in
          addition.
        </li>
        <li>We accept payment through Razorpay, PayPal and Payoneer. Payment terms may also be set out in your
          quotation or invoice.</li>
        <li>Title to goods passes to you only once payment has been received in full.</li>
      </ul>

      <h2 className="mt-8 text-xl font-medium text-gray-900">6. Shipping, returns and refunds</h2>
      <p className="mt-3 leading-relaxed">
        Processing times, delivery, customs, returns and refunds are described in our{' '}
        <a href="/shipping-policy" className="underline">Shipping, Returns &amp; Refunds Policy</a>, which forms part
        of these Terms. International orders are shipped on a Delivery Duty Unpaid (DDU) basis, meaning import
        duties and taxes are the buyer&rsquo;s responsibility.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">7. Intellectual property</h2>
      <p className="mt-3 leading-relaxed">
        All content on this website &mdash; including text, images, designs, graphics, logos and layout &mdash; is
        owned by or licensed to {SITE_NAME} and is protected by applicable laws. You may not copy, reproduce,
        distribute or use any content for commercial purposes without our prior written permission.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">8. Acceptable use</h2>
      <p className="mt-3 leading-relaxed">
        You agree to use this website lawfully and not to misuse it, introduce malicious code, attempt unauthorised
        access, scrape data, or interfere with its operation or security.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">9. Disclaimers and limitation of liability</h2>
      <p className="mt-3 leading-relaxed">
        The website and products are provided without warranties beyond those required by law. To the maximum
        extent permitted by law, our total liability for any order is limited to the value of that order, and we are
        not liable for indirect, incidental or consequential loss. Nothing in these Terms excludes liability that
        cannot be excluded under applicable law.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">10. Indemnification</h2>
      <p className="mt-3 leading-relaxed">
        You agree to indemnify and hold {SITE_NAME} harmless from any claims, losses or expenses arising out of your
        breach of these Terms or your misuse of the website.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">11. Governing law and dispute resolution</h2>
      <p className="mt-3 leading-relaxed">
        These Terms are governed by the laws of India. Any dispute shall be subject to the exclusive jurisdiction of
        the courts at Ahmedabad, Gujarat, India, or resolved through arbitration where expressly agreed in writing
        between the parties.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">12. Changes to these Terms</h2>
      <p className="mt-3 leading-relaxed">
        We may update these Terms from time to time. The version published on this page applies to your use of the
        website and any order placed after it is posted.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">13. Contact</h2>
      <p className="mt-3 leading-relaxed">
        Questions about these Terms? Email{' '}
        <a href="mailto:inquiry@hsglobalexport.com" className="underline">inquiry@hsglobalexport.com</a>, call{' '}
        <a href="tel:+918107115116" className="underline">+91&nbsp;81071&nbsp;15116</a>, or write to HS Global
        Trader, C-108, Titanium Business Park, Makarba, Ahmedabad &ndash; 380051, Gujarat, India.
      </p>
    </main>
  );
}
