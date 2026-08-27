// API Response Types (matching backend structure)
export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ApiProductVariant {
  id: string;
  color: string;
  colorHex: string;
  size: string;
  priceOverride: number | null;
  stock: number;
  available: boolean;
}

export type ProductType = 'TSHIRT' | 'HOODIE' | 'POLO' | 'JOGGER' | 'TOTE_BAG' | 'CAP' | 'OTHER';

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sizeChartImage?: string | null;
  price: number;
  images: string[];
  active: boolean;
  featured: boolean;
  type: ProductType;
  supportsDoublePrint: boolean;
  categoryId: string;
  category: ApiCategory;
  variants: ApiProductVariant[];
  createdAt: string;
  updatedAt: string;
  productImages?: AdminProductImage[];
  printAreas?: PrintAreaConfig[];
}

export interface ApiProductsResponse {
  status: string;
  data: {
    products: ApiProduct[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export interface ApiProductResponse {
  status: string;
  data: {
    product: ApiProduct;
  };
}

export interface AdminProductImage {
  id: string;
  color: string;
  side: 'FRONT' | 'BACK';
  url: string;
  fileName?: string | null;
  variants: { variantId: string; imageId: string }[];
}

export interface PrintAreaConfig {
  side: 'FRONT' | 'BACK';
  x: number;
  y: number;
  width: number;
  height: number;
  enabled: boolean;
}

// Frontend Display Types (for components)
export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  price: number;
  oldPrice: number | null;
  badge: string | null;
  image: string;
  images: string[];
  colors: string[];
  featured: boolean;
  description: string | null;
}

export interface Translation {
  navHome: string;
  navCatalog: string;
  navHowItWorks: string;
  navAbout: string;
  heroTitle: string;
  heroSubtitle: string;
  cartText: string;
  pageEyebrow: string;
  pageTitle: string;
  pageSubtitle: string;
  searchPlaceholder: string;
  filterAll: string;
  filterTshirt: string;
  filterHoodie: string;
  filterPolo: string;
  filterTotebag: string;
  filterOversize: string;
  filterCap: string;
  sortFeatured: string;
  sortPriceLow: string;
  sortPriceHigh: string;
  customizeBtn: string;
  modalTitle: string;
  modalText: string;
  noProducts: string;
  loading: string;
  error: string;
  retry: string;
  // Product detail page
  productColor: string;
  productSize: string;
  productQuantity: string;
  productPrintingSide: string;
  printingSideFront: string;
  printingSideBack: string;
  printingSideBoth: string;
  backToCatalog: string;
  selectColor: string;
  selectSize: string;
  // Customization workspace
  addImage: string;
  addText: string;
  font: string;
  textColor: string;
  removeText: string;
  removeImage: string;
  rotate: string;
  flip: string;
  duplicate: string;
  printableArea: string;
  unitPrice: string;
  price: string;
  addToCart: string;
  order: string;
  customizedProduct: string;
  chooseSize: string;
  validateOrder: string;
}

export type Language = 'fr' | 'ar' | 'en';
export type Theme = 'light' | 'dark';
export type SortOption = 'featured' | 'price-low' | 'price-high';
export type PrintingSide = 'FRONT' | 'BACK' | 'BOTH';
