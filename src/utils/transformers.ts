import type { ApiProduct, Product } from '../types';

/**
 * Transform API product to display product format
 */
export function transformApiProduct(apiProduct: ApiProduct): Product {
  // Extract unique colors from variants
  const colors = Array.from(
    new Set(apiProduct.variants.map((v) => v.colorHex))
  );

  // Get the first image or use placeholder
  const image = apiProduct.images[0] || 'https://placehold.co/400x500/ffffff/cccccc?text=Product';

  // Calculate badge (we don't have oldPrice in API, so badge logic can be based on featured or custom logic)
  // For now, keep it simple - no badge unless we add custom logic later
  const badge = null;
  const oldPrice = null;

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    slug: apiProduct.slug,
    category: apiProduct.category.name,
    categorySlug: apiProduct.category.slug,
    price: apiProduct.price,
    oldPrice,
    badge,
    image,
    images: apiProduct.images,
    colors,
    featured: apiProduct.featured,
    description: apiProduct.description,
  };
}

/**
 * Transform multiple API products
 */
export function transformApiProducts(apiProducts: ApiProduct[]): Product[] {
  return apiProducts.map(transformApiProduct);
}
