import type { Category, Subcategory, Product } from './products';
import { getProductCloudinaryUrl } from '../utils/productCloudinary';

type FileUrl = string;

// Get all file paths from import.meta.glob for structure building only
const fileModules = import.meta.glob('/src/assets/Collection/**/*.{webp,jpg,jpeg,png}', {
  query: '?url',
  import: 'default',
  eager: false
}) as Record<string, () => Promise<FileUrl>>;

// Get all file paths synchronously for structure building
const filePaths = Object.keys(fileModules);

const toTitle = (s: string): string => {
  return s
    .replace(/%20/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b(\w)/g, (_m, c) => c.toUpperCase());
};

const decodeSeg = (s: string): string => {
  try { return decodeURIComponent(s); } catch { return s; }
};

const sanitizeStoneName = (raw: string): string => {
  const decoded = toTitle(decodeSeg(raw));
  const cleaned = decoded
    .replace(/\b(Marble|Granite|Onyx|Travertine|Sandstone)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length ? cleaned : decoded;
};

const GENERIC_NAMES = new Set([
  'White', 'Black', 'Brown', 'Beige', 'Green', 'Red', 'Pink', 'Yellow', 'Gold', 'Blue', 'Grey', 'Gray', 'Silver', 'Orange', 'Rainbow', 'Multi Color', 'Multicolor', 'Cream'
]);

const disambiguate = (name: string, categoryKey: string, groupKey?: string): string => {
  const n = name.trim();
  if (GENERIC_NAMES.has(n)) {
    if (categoryKey === 'Granite' && groupKey) return `${sanitizeStoneName(groupKey)} ${n}`;
    return `${toTitle(categoryKey)} ${n}`;
  }
  return n;
};

interface BuildMaps {
  [category: string]: {
    [subOrProduct: string]: {
      [product: string]: {
        imagePaths: string[];
        standPaths: string[];
      };
    } | {
      __imagePaths: string[];
      __standPaths: string[];
    };
  };
}

// Cache for loaded image URLs
const imageUrlCache = new Map<string, string>();

/**
 * Convert local path to Cloudinary URL
 * Path format: /src/assets/Collection/... -> Collection/...
 */
function pathToCloudinaryUrl(absPath: string): string {
  const idx = absPath.indexOf('/Collection/');
  if (idx === -1) return absPath;

  const relativePath = absPath.slice(idx + 1); // Remove leading slash: "Collection/..."
  return getProductCloudinaryUrl(relativePath);
}

// Helper to load a single image URL with caching (now uses Cloudinary)
export const loadImageUrl = async (path: string): Promise<string> => {
  if (imageUrlCache.has(path)) {
    return imageUrlCache.get(path)!;
  }

  // Convert to Cloudinary URL
  const cloudinaryUrl = pathToCloudinaryUrl(path);
  imageUrlCache.set(path, cloudinaryUrl);
  return cloudinaryUrl;
};

// Helper to load multiple image URLs
export const loadImageUrls = async (paths: string[]): Promise<string[]> => {
  return Promise.all(paths.map(path => loadImageUrl(path)));
};

let cachedCategories: Category[] | null = null;

export const generateSlabCategories = (): Category[] => {
  if (cachedCategories) {
    return cachedCategories;
  }

  const maps: BuildMaps = {};

  // Build structure using paths only (no loading yet)
  for (const absPath of filePaths) {
    const idx = absPath.indexOf('/Collection/');
    if (idx === -1) continue;
    const rel = absPath.slice(idx + '/Collection/'.length);
    const parts = rel.split('/');
    if (parts.length < 2) continue;

    const decodedParts = parts.map(p => decodeSeg(p));
    const lowerParts = decodedParts.map(p => p.toLowerCase());
    if (
      lowerParts.includes('not found') ||
      lowerParts.includes('notfound') ||
      lowerParts.some(p => p === 'not found' || p === 'notfound') ||
      lowerParts.some(p => p.includes('not found') || p.includes('notfound') || p.includes('not fount'))
    ) {
      continue;
    }

    const category = decodeSeg(parts[0]);
    if (!maps[category]) maps[category] = {} as any;

    if (category === 'Granite') {
      if (parts.length < 3) continue;
      const group = decodeSeg(parts[1]);
      const product = decodeSeg(parts[2]);
      const isStand = parts.map(p => p.toLowerCase()).includes('stand');
      if (!((maps[category] as any)[group])) (maps[category] as any)[group] = {} as any;
      if (!(((maps[category] as any)[group] as any)[product])) {
        (((maps[category] as any)[group] as any)[product]) = {
          imagePaths: [],
          standPaths: []
        } as any;
      }
      const entry = (((maps[category] as any)[group] as any)[product]) as { imagePaths: string[]; standPaths: string[] };
      (isStand ? entry.standPaths : entry.imagePaths).push(absPath);
    } else {
      const product = decodeSeg(parts[1]);
      const isStand = parts.map(p => p.toLowerCase()).includes('stand');
      if (!((maps[category] as any)[product])) {
        (maps[category] as any)[product] = {
          __imagePaths: [],
          __standPaths: []
        } as any;
      }
      if (isStand) {
        (((maps[category] as any)[product] as any).__standPaths as string[]).push(absPath);
      } else {
        (((maps[category] as any)[product] as any).__imagePaths as string[]).push(absPath);
      }
    }
  }

  const categories: Category[] = [];

  Object.entries(maps).forEach(([categoryKey, subMap]) => {
    const cat: Category = {
      id: categoryKey.toLowerCase().replace(/\s+/g, '-'),
      name: toTitle(categoryKey),
      subcategories: []
    };

    if (categoryKey === 'Granite') {
      Object.entries(subMap as Record<string, Record<string, { imagePaths: string[]; standPaths: string[] }>>).forEach(([groupKey, productsMap]) => {
        const sub: Subcategory = {
          id: groupKey.toLowerCase().replace(/\s+/g, '-'),
          name: sanitizeStoneName(groupKey),
          products: []
        };
        Object.entries(productsMap).forEach(([prodKey, data]) => {
          const allPaths = [...data.standPaths, ...data.imagePaths];
          const baseName = sanitizeStoneName(prodKey);
          const p: Product = {
            id: `${cat.id}-${sub.id}-${prodKey.toLowerCase().replace(/\s+/g, '-')}`,
            name: disambiguate(baseName, categoryKey, groupKey),
            category: 'slabs',
            subcategory: sub.id,
            image: '', // Will be loaded lazily
            images: allPaths, // Store paths instead of URLs
            description: `${disambiguate(baseName, categoryKey, groupKey)} granite slab — durable, low‑porosity, and ideal for countertops, flooring, and exterior cladding. Sourced from trusted quarries with strict QA.`
          };
          (sub.products as Product[]).push(p);
        });
        cat.subcategories.push(sub);
      });
    } else if (categoryKey === 'Marble') {
      const sub: Subcategory = {
        id: 'marble',
        name: 'Marble',
        products: []
      };
      Object.entries(subMap as Record<string, { __imagePaths: string[]; __standPaths: string[] }>).forEach(([prodKey, data]) => {
        const allPaths = [...(data.__standPaths || []), ...(data.__imagePaths || [])];
        const baseName = sanitizeStoneName(prodKey);
        const p: Product = {
          id: `${cat.id}-${prodKey.toLowerCase().replace(/\s+/g, '-')}`,
          name: disambiguate(baseName, categoryKey),
          category: 'slabs',
          subcategory: 'marble',
          image: '',
          images: allPaths,
          description: `${disambiguate(baseName, categoryKey)} marble slab — classic veining and premium finish for luxury interiors, countertops, vanities and wall cladding.`
        };
        (sub.products as Product[]).push(p);
      });
      (sub.products as Product[]).sort((a, b) => a.name.localeCompare(b.name));
      cat.subcategories.push(sub);
    } else if (categoryKey === 'Onyx' || categoryKey === 'Sandstone' || categoryKey === 'Travertine') {
      const subId = categoryKey.toLowerCase();
      const sub: Subcategory = {
        id: subId,
        name: toTitle(categoryKey),
        products: []
      };
      Object.entries(subMap as Record<string, { __imagePaths: string[]; __standPaths: string[] }>).forEach(([prodKey, data]) => {
        const allPaths = [...(data.__standPaths || []), ...(data.__imagePaths || [])];
        const baseName = sanitizeStoneName(prodKey);
        const p: Product = {
          id: `${cat.id}-${subId}-${prodKey.toLowerCase().replace(/\s+/g, '-')}`,
          name: disambiguate(baseName, categoryKey),
          category: 'slabs',
          subcategory: subId,
          image: '',
          images: allPaths,
          description: `${disambiguate(baseName, categoryKey)} ${toTitle(categoryKey)} — premium natural stone suitable for interiors, counters and wall features.`
        };
        (sub.products as Product[]).push(p);
      });
      (sub.products as Product[]).sort((a, b) => a.name.localeCompare(b.name));
      cat.subcategories.push(sub);
    } else {
      Object.entries(subMap as Record<string, { __imagePaths: string[] }>).forEach(([prodKey, data]) => {
        const sub: Subcategory = {
          id: prodKey.toLowerCase().replace(/\s+/g, '-'),
          name: toTitle(prodKey),
          products: [
            {
              id: `${cat.id}-${prodKey.toLowerCase().replace(/\s+/g, '-')}`,
              name: sanitizeStoneName(prodKey),
              category: 'slabs',
              subcategory: cat.id,
              image: '',
              images: data.__imagePaths,
              description: `${sanitizeStoneName(prodKey)} ${toTitle(cat.name)} slab — premium natural stone with refined aesthetics, suitable for luxury interiors and architectural applications.`
            }
          ]
        };
        cat.subcategories.push(sub);
      });
    }

    cat.subcategories.sort((a, b) => a.name.localeCompare(b.name));
    cat.subcategories.forEach(s => {
      if (s.products) s.products.sort((a, b) => a.name.localeCompare(b.name));
    });

    categories.push(cat);
  });

  const order = ['granite', 'marble', 'onyx', 'sandstone', 'travertine'];
  categories.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

  cachedCategories = categories;

  return categories;
};

export default generateSlabCategories;