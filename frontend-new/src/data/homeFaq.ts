// Home-page FAQ data. Every answer is drawn directly from HS Global Export's own
// policy pages — no invented facts. Kept JSX-free so it can be imported by both
// the HomeFAQ UI component and the FAQPage JSON-LD in app/page.tsx.
//
// Sources:
//   /shipping-policy  — Shipping, Returns & Refunds Policy
//   /terms            — Terms of Service & User Agreement
//   /privacy          — Privacy Policy
//   /cookies          — Cookie Policy & Preferences

export interface HomeFaqItem {
  question: string;
  answer: string;
  /** Source policy page the answer is grounded in. */
  href: string;
  hrefLabel: string;
}

export const HOME_FAQ_ITEMS: HomeFaqItem[] = [
  {
    question: 'Which countries do you ship to?',
    answer:
      'We ship worldwide, including to India, the USA, the UK, Europe, the UAE, Saudi Arabia, Qatar, Russia and Australia. If your country is not listed at checkout, contact us for a shipping quote.',
    href: '/shipping-policy',
    hrefLabel: 'Shipping Policy',
  },
  {
    question: 'How long do production and delivery take?',
    answer:
      'Most pieces are made to order or handcrafted, so production typically takes 30 to 60 days after payment is received. After dispatch, delivery is around 30 days for domestic (India) orders and up to 60 days for international orders, depending on the product, destination and customs clearance.',
    href: '/shipping-policy',
    hrefLabel: 'Shipping Policy',
  },
  {
    question: 'Who pays import duties and customs charges?',
    answer:
      'International orders are shipped on a Delivery Duty Unpaid (DDU) basis. Any import duties, customs charges, taxes or clearance fees levied by the destination country are the buyer’s responsibility and are not included in the product or shipping price.',
    href: '/shipping-policy',
    hrefLabel: 'Shipping Policy',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept payment through Razorpay, PayPal and Payoneer. Payment terms may also be set out in your quotation or invoice, and title to the goods passes to you only once payment is received in full.',
    href: '/terms',
    hrefLabel: 'Terms of Service',
  },
  {
    question: 'What is your returns and refunds policy?',
    answer:
      'We accept returns within 15 days of delivery for eligible items, which must be unused and returned in their original packaging with all accessories included. If an item arrives damaged, share a clear unboxing video and photos and we will arrange a replacement or refund. Custom-made, personalised, used, opened or clearance items may not be eligible for return.',
    href: '/shipping-policy',
    hrefLabel: 'Returns & Refunds',
  },
  {
    question: 'Will the product look exactly like the photos?',
    answer:
      'Our furniture and stone are natural, handcrafted materials, so colour, grain, veining, texture and finish vary from piece to piece. Images are representative and small variations are normal and not a defect.',
    href: '/terms',
    hrefLabel: 'Terms of Service',
  },
  {
    question: 'How do you handle my personal data?',
    answer:
      'As the data controller under the EU/UK GDPR and India’s Digital Personal Data Protection Act, we collect only the details needed to fulfil your orders and enquiries. Payments are processed securely by our providers — we do not store full card details — and we never sell your personal data.',
    href: '/privacy',
    hrefLabel: 'Privacy Policy',
  },
];
