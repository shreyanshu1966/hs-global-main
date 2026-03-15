import { Product, productService } from '../../services/productService';
import { getProductCloudinaryUrl } from '../../utils/productCloudinary';

export interface ItsbitsCardItem {
  id: string;
  image: string;
  title: string;
  designer: string;
  price: string;
  originalPrice?: string;
  href: string;
  createdAt?: string;
}

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const toTitleCase = (value: string) =>
  value
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const getItsbitsProductImage = (product: Product): string => {
  const imagePath =
    product.sortedImages?.[0] ||
    product.images?.[0] ||
    product.image ||
    '/products-hero.webp';

  return imagePath.startsWith('http') || imagePath.startsWith('/')
    ? imagePath
    : getProductCloudinaryUrl(imagePath);
};

const getPriceLabels = (product: Product): { price: string; originalPrice?: string } => {
  const basePrice = product.priceINR || 0;
  const hasDiscount = Boolean(product.discount?.enabled && product.discount.percentage > 0 && basePrice > 0);

  if (basePrice <= 0) {
    return { price: 'Request Quote' };
  }

  if (!hasDiscount) {
    return { price: inrFormatter.format(basePrice) };
  }

  const finalPrice = basePrice - (basePrice * product.discount!.percentage) / 100;
  return {
    price: inrFormatter.format(finalPrice),
    originalPrice: inrFormatter.format(basePrice),
  };
};

export const mapProductToItsbitsCard = (product: Product): ItsbitsCardItem => {
  const categoryLabel = toTitleCase(product.subcategory || product.category || 'HS Global Collection');
  const { price, originalPrice } = getPriceLabels(product);

  return {
    id: product.productId || product._id,
    image: getItsbitsProductImage(product),
    title: product.name,
    designer: categoryLabel,
    price,
    originalPrice,
    href: `/products/${product.productId || product._id}`,
    createdAt: product.createdAt,
  };
};

export const parseCategoryFromLink = (viewAllLink: string): string | undefined => {
  const [path, queryString] = viewAllLink.split('?');

  if (!path.startsWith('/products')) {
    return undefined;
  }

  if (!queryString) {
    return undefined;
  }

  const params = new URLSearchParams(queryString);
  return params.get('cat') || params.get('category') || undefined;
};

const isMarbleFurniture = (product: Product): boolean => {
  if ((product.category || '').toLowerCase() !== 'furniture') {
    return false;
  }

  const searchable = [
    product.name,
    product.description,
    product.subcategory,
    product.furnitureSpecs?.material,
    product.furnitureSpecs?.type,
    ...(product.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchable.includes('marble');
};

export const fetchItsbitsProducts = async (options: {
  limit?: number;
  category?: string;
  featured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  marbleFurnitureOnly?: boolean;
}): Promise<ItsbitsCardItem[]> => {
  const {
    limit = 10,
    category,
    featured = false,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    marbleFurnitureOnly = false,
  } = options;

  const requiredCategory = marbleFurnitureOnly ? 'furniture' : category;

  const applyFilters = (items: Product[]): Product[] => {
    if (!marbleFurnitureOnly) {
      return items;
    }

    return items.filter(isMarbleFurniture);
  };

  if (requiredCategory) {
    const response = await productService.getProductsByCategory(requiredCategory, {
      limit,
      sortBy,
      sortOrder,
    });

    if (!response.success || !Array.isArray(response.data.products)) {
      return [];
    }

    return applyFilters(response.data.products).map(mapProductToItsbitsCard);
  }

  const response = featured
    ? await productService.getFeaturedProducts(limit)
    : await productService.getAllProducts({
        limit,
        sortBy,
        sortOrder,
      });

  if (!response.success || !Array.isArray(response.data)) {
    return [];
  }

  return applyFilters(response.data).map(mapProductToItsbitsCard);
};
