// products.ts — FINAL (INR ONLY, no conversion here)

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  image: string;
  description: string;
  priceINR?: number;        // <-- INR only
  images?: string[];
  available?: boolean;
  hasVideo?: boolean;       // Pre-computed video availability
  sortedImages?: string[];  // Pre-sorted images for performance
}

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  products?: Product[];
  subcategories?: Subcategory[];
}

import generateSlabCategories from "./slabs.loader";
import { getFurnitureSpecs } from "./furnitureSpecs";
import { getProductCloudinaryUrl } from '../utils/productCloudinary';

// Get furniture file paths for structure building
const furnitureFilesGlob = import.meta.glob(
  "/src/assets/furnitures/**/*.{webp,jpg,jpeg,png}",
  {
    query: "?url",
    import: "default",
    eager: true,
  }
) as Record<string, string>;

/**
 * Convert furniture path to Cloudinary URL
 * Path format: /src/assets/furnitures/... -> furnitures/...
 */
function furniturePathToCloudinaryUrl(absPath: string): string {
  const idx = absPath.indexOf('/furnitures/');
  if (idx === -1) return absPath;

  const relativePath = absPath.slice(idx + 1); // Remove leading slash: "furnitures/..."
  return getProductCloudinaryUrl(relativePath);
}

// Convert all furniture file paths to Cloudinary URLs
const furnitureFiles: Record<string, string> = {};
Object.keys(furnitureFilesGlob).forEach(path => {
  furnitureFiles[path] = furniturePathToCloudinaryUrl(path);
});

const decode = (s: string) => decodeURIComponent(s.replace(/\+/g, " "));
const toSlug = (s: string) =>
  decode(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const toTitle = (s: string) =>
  decode(s)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

const SUBCATEGORY_TO_PRODUCT_TYPE: Record<string, string> = {
  "coffee table": "Table",
  "console table": "Table",
  "dining table": "Table",
  "side table": "Table",
  "center table": "Table",
  pedestal: "Wash Basin",
  countertop: "Wash Basin",
  benches: "Bench",
  "flower pots": "Flower Pot",
  "water fountain": "Water Fountain",
  bowls: "Bowl",
  urli: "Urli",
  sculpture: "Sculpture",
};

// Extract INR pricing from furnitureSpecs
const getFurniturePriceINR = (
  productName: string,
  subcategory: string
): { priceINR: number | undefined; available: boolean } => {

  const specs = getFurnitureSpecs(productName);

  if (!specs?.priceINR) {
    return { priceINR: undefined, available: false };
  }

  const expected = SUBCATEGORY_TO_PRODUCT_TYPE[normalize(subcategory)];
  if (expected && specs.product !== expected) {
    return { priceINR: undefined, available: false };
  }

  return {
    priceINR: specs.priceINR,
    available: true,
  };
};

export const isProductAvailable = (productName: string, subcategory: string) => {
  return getFurniturePriceINR(productName, subcategory).available;
};

// Pre-sort images at build time to avoid runtime regex operations
const sortImagesByPriority = (images: string[], category: string): string[] => {
  if (category !== 'furniture') {
    const stand = images.filter(img => img.toLowerCase().includes('/stand/'));
    const others = images.filter(img => !img.toLowerCase().includes('/stand/'));
    return [...stand, ...others];
  }

  const patterns = [
    /^1\./i, /^01\./i, /main/i, /cover/i, /primary/i, /_01\./i, /^1-/i,
    /stand/i, /front/i, /hero/i, /^a\./i
  ];

  const score = (img: string) => {
    const name = img.split('/').pop()?.toLowerCase() || '';
    for (let i = 0; i < patterns.length; i++) {
      if (patterns[i].test(name)) return i;
    }
    const num = name.match(/^(\d+)\./);
    return num ? 1000 + Number(num[1]) : 10000;
  };

  return [...images].sort((a, b) => score(a) - score(b));
};

// Build furniture categories
const buildFurnitureCategories = (): Subcategory[] => {
  type Agg = { id: string; name: string; images: string[]; image: string };

  const tree = new Map<string, Map<string | null, Map<string, Agg>>>();

  // group all furniture images
  Object.entries(furnitureFiles).forEach(([path, url]) => {
    const parts = path.split("/").filter(Boolean);
    const i = parts.indexOf("furnitures");
    if (i === -1) return;

    const rawMain = parts[i + 1] ? decode(parts[i + 1]) : null;
    const main = rawMain
      ? /(wash\s*basins?|washbasins)/i.test(rawMain)
        ? "Wash Basins"
        : toTitle(rawMain)
      : null;
    if (!main) return;

    let sub: string | null = null;
    let product: string | null = null;

    if ((main === "Tables" || main === "Wash Basins") && parts[i + 3]) {
      sub = toTitle(parts[i + 2]);
      product = toTitle(parts[i + 3]);
    } else if (parts[i + 2]) {
      sub = null;
      product = toTitle(parts[i + 2]);
    } else return;

    const fileName = decode(parts[parts.length - 1]);
    if (!/\.(webp|jpg|jpeg|png)$/i.test(fileName)) return;

    if (!tree.has(main)) tree.set(main, new Map());
    const subMap = tree.get(main)!;
    if (!subMap.has(sub)) subMap.set(sub, new Map());
    const prodMap = subMap.get(sub)!;

    if (!prodMap.has(product!)) {
      const id =
        ["furniture", main, sub || "root", product!].map(toSlug).join("-");
      prodMap.set(product!, { id, name: product!, images: [], image: "" });
    }

    const agg = prodMap.get(product!)!;
    if (!agg.images.includes(url)) agg.images.push(url);
  });

  // choose main image
  tree.forEach((subMap) =>
    subMap.forEach((prodMap) => {
      const arr = [...prodMap.values()];
      arr.forEach((p) => {
        p.image =
          p.images.find((i) => /1\.|01|main|cover|stand/i.test(i)) ||
          p.images[0] ||
          "";
      });
      prodMap.clear();
      arr.forEach((p) => prodMap.set(p.name, p));
    })
  );

  const result: Subcategory[] = [];

  const pushMain = (main: string, children?: string[]) => {
    const subMap = tree.get(main);
    if (!subMap) return;

    if (children?.length) {
      const subs: Subcategory[] = [];

      children.forEach((child) => {
        const prodMap = subMap.get(toTitle(child)) || new Map();

        const products = [...prodMap.values()].map<Product>((p) => {
          const { priceINR, available } = getFurniturePriceINR(p.name, child);
          const sortedImages = sortImagesByPriority(p.images, "furniture");

          return {
            id: p.id,
            name: p.name,
            category: "furniture",
            subcategory: child,
            image: p.image,
            images: p.images,
            sortedImages,
            description: `${p.name} - ${child}`,
            priceINR,
            available,
            hasVideo: true, // Assume all furniture has video, handle 404 gracefully
          };
        });

        if (products.length)
          subs.push({ id: toSlug(child), name: child, products });
      });

      if (subs.length)
        result.push({ id: toSlug(main), name: main, subcategories: subs });

    } else {
      const prodMap = subMap.get(null) || new Map();

      const products = [...prodMap.values()].map<Product>((p) => {
        const { priceINR, available } = getFurniturePriceINR(p.name, main);
        const sortedImages = sortImagesByPriority(p.images, "furniture");

        return {
          id: p.id,
          name: p.name,
          category: "furniture",
          subcategory: main,
          image: p.image,
          images: p.images,
          sortedImages,
          description: `${p.name} - ${main}`,
          priceINR,
          available,
          hasVideo: true,
        };
      });

      if (products.length)
        result.push({ id: toSlug(main), name: main, products });
    }
  };

  pushMain("Tables", [
    "Coffee Table",
    "Console Table",
    "Dining Table",
    "Side Table",
    "Center Table",
  ]);
  pushMain("Wash Basins", ["Pedestal", "Countertop"]);
  pushMain("Benches");
  pushMain("Flower Pots");
  pushMain("Water Fountain");
  pushMain("Bowls");
  pushMain("Urli");
  pushMain("Sculptures");
  pushMain("Others");

  return result;
};

export const categories: Category[] = [
  {
    id: "furniture",
    name: "Furniture",
    subcategories: buildFurnitureCategories(),
  },
  {
    id: "slabs",
    name: "Slabs",
    subcategories: generateSlabCategories(),
  },
];

export const getAllProducts = (): Product[] => {
  const out: Product[] = [];

  const extract = (subs: Subcategory[]) => {
    subs.forEach((s) => {
      if (s.products) out.push(...s.products);
      if (s.subcategories) extract(s.subcategories);
    });
  };

  categories.forEach((c) => extract(c.subcategories));
  return out;
};
