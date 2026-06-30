import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/server/api';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const title = `Shipping, Returns & Refunds Policy | ${SITE_NAME}`;
  const description =
    'How HS Global Export ships worldwide: processing times, carriers, delivery, customs duties, tracking, and our returns and refunds policy.';
  const canonical = `${SITE_URL}/shipping-policy`;
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
      <h1 className="text-3xl font-medium text-gray-900">Shipping, Returns &amp; Refunds Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: June 2026</p>

      <p className="mt-6 leading-relaxed">
        This policy explains how {SITE_NAME} (a brand of HS Global Trader) processes, ships and delivers orders, and
        how returns and refunds are handled. It forms part of our{' '}
        <a href="/terms" className="underline">Terms of Service</a>.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Where we ship</h2>
      <p className="mt-3 leading-relaxed">
        We ship worldwide, including to India, the USA, the UK, Europe, the UAE, Saudi Arabia, Qatar, Russia and
        Australia. If your country is not listed at checkout, please contact us for a shipping quote.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Processing and production time</h2>
      <p className="mt-3 leading-relaxed">
        Many of our pieces are made to order or handcrafted. Production and processing typically take{' '}
        <strong>30 to 60 days after payment is received</strong>, depending on the size, scale and material of the
        product. We will keep you informed of your order&rsquo;s progress.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Carriers and delivery timeframes</h2>
      <p className="mt-3 leading-relaxed">
        We ship through trusted carriers such as DHL, FedEx and India Post. Indicative delivery times after dispatch
        are approximately <strong>30 days for domestic (India) orders</strong> and{' '}
        <strong>up to 60 days for international orders</strong>, depending on the product, destination and customs
        clearance. These are estimates and not guaranteed delivery dates.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Shipping costs</h2>
      <p className="mt-3 leading-relaxed">
        Shipping costs are calculated based on destination, weight and order value, and are shown before you complete
        your purchase. In some cases, free shipping may apply above a minimum order amount.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Customs, duties and import taxes</h2>
      <p className="mt-3 leading-relaxed">
        International orders are shipped on a <strong>Delivery Duty Unpaid (DDU)</strong> basis. This means any import
        duties, customs charges, taxes or clearance fees levied by the destination country are{' '}
        <strong>the buyer&rsquo;s responsibility</strong> and are not included in the product or shipping price.
        Please check your local import rules before ordering.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Order tracking</h2>
      <p className="mt-3 leading-relaxed">
        Once your order is dispatched, we provide tracking details so you can follow your shipment until it is
        delivered.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Lost, damaged or delayed packages</h2>
      <p className="mt-3 leading-relaxed">
        If an item arrives damaged, please share a clear unboxing video and photos so we can verify the issue. Once
        confirmed, we will arrange a replacement or process a refund of the applicable amount, depending on the case.
        For delayed or lost shipments, please contact us and we will work with the carrier to resolve the matter.
      </p>

      <h2 className="mt-10 text-2xl font-medium text-gray-900">Returns &amp; Refunds</h2>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Returns window</h2>
      <p className="mt-3 leading-relaxed">
        We accept returns within <strong>15 days of delivery</strong> for eligible items. If the item is found
        damaged or needs replacement, we will either refund the amount or send a replacement, as applicable. In such
        cases no additional product charge will be taken, though shipping charges may apply depending on the
        situation.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Return conditions</h2>
      <p className="mt-3 leading-relaxed">
        The item must be unused and returned in its original packaging, with all accessories and parts included
        wherever applicable.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Who pays for return shipping</h2>
      <p className="mt-3 leading-relaxed">
        If the item arrives damaged, please share a proper unboxing video as proof. After verification, we will
        arrange a replacement at no extra product cost. If you simply no longer want the product, the return shipping
        cost will be borne by you, and the product amount will be refunded as per this policy.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Refund method and timeframe</h2>
      <p className="mt-3 leading-relaxed">
        Once a return is approved, the refund will be issued to your original payment method or wallet within a
        reasonable processing time, depending on the payment option used.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Non-returnable items</h2>
      <p className="mt-3 leading-relaxed">
        Custom-made, personalised, used, opened or clearance items may not be eligible for return.
      </p>

      <h2 className="mt-8 text-xl font-medium text-gray-900">Contact</h2>
      <p className="mt-3 leading-relaxed">
        For shipping, returns or refund queries, email{' '}
        <a href="mailto:inquiry@hsglobalexport.com" className="underline">inquiry@hsglobalexport.com</a> or call{' '}
        <a href="tel:+918107115116" className="underline">+91&nbsp;81071&nbsp;15116</a>.
      </p>
    </main>
  );
}
