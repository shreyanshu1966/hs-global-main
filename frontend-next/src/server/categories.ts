// Static nav config for categories/subcategories (avoids an API call just to
// render the menu). Counts are indicative; product data is always fetched live.
export interface CategoryDef {
  slug: string;
  label: string;
  subcategories: string[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    slug: 'furniture',
    label: 'Furniture',
    subcategories: [
      'Bathtub', 'Bowl', 'Center Table', 'Chaise Chair', 'Clock', 'Coffee Table',
      'Console Table', 'Dining Table', 'Mirror Frame', 'Pedestal Sink', 'Side Table', 'Sink', 'Vase',
    ],
  },
  {
    slug: 'semi-precious-stone',
    label: 'Semi-Precious Stone',
    subcategories: [
      'Agate', 'Amazonite', 'Amethyst', 'Gemstone', 'Jasper', 'Mother Of Pearl',
      'Quartz', 'Semiprecious Stone', 'Tiger Eye', 'Petrified Wood',
    ],
  },
  {
    slug: 'leather',
    label: 'Leather',
    subcategories: [
      'Bed', 'Bench', 'Box', 'Cabinet', 'Chair', 'Coffee Table', 'Console Table',
      'Dresser', 'Mirror', 'Mirror Frame', 'Side Table', 'Sofa', 'Stool',
    ],
  },
  {
    slug: 'handcrafted',
    label: 'Handcrafted',
    subcategories: ['Coffee Table', 'Console Table', 'Dining Table', 'Side Table', 'Sofa'],
  },
];

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label || slug.replace(/-/g, ' ');
}
