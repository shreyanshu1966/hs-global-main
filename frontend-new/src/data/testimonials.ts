// Shared testimonial data — consumed by the Testimonials UI component and by the
// home page server component to emit Organization review JSON-LD. Keep this file
// free of JSX so it can be imported on the server.
//
// Placeholder sample content — replace the copy with verified client reviews.

export interface Testimonial {
  name: string;
  role: string;
  location: string;
  rating: number; // 1-5
  quote: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Daniel Whitmore',
    role: 'Interior Designer',
    location: 'London, UK',
    rating: 5,
    quote:
      'The marble console tables arrived flawlessly crated and exactly matched the samples. Communication through production and shipping was impeccable — a genuine direct-manufacturer experience.',
  },
  {
    name: 'Sophia Alvarez',
    role: 'Boutique Hotel Owner',
    location: 'Miami, USA',
    rating: 5,
    quote:
      'We furnished an entire lobby with their semi-precious stone pieces. The craftsmanship is on par with brands charging three times as much, and delivery was fully insured to our door.',
  },
  {
    name: 'Rahul Mehta',
    role: 'Architect',
    location: 'Dubai, UAE',
    rating: 5,
    quote:
      'Custom dimensions, honed finish, veining matched across slabs — they nailed every spec on our RFQ. Their pre-shipment inspection videos gave us total confidence before the container left port.',
  },
];

// Average rating across all testimonials, rounded to one decimal — used for the
// Organization AggregateRating in JSON-LD.
export const TESTIMONIALS_AVG_RATING =
  Math.round((TESTIMONIALS.reduce((sum, t) => sum + t.rating, 0) / TESTIMONIALS.length) * 10) / 10;
