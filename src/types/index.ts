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
  discountPercentage: number;
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
  checkout: string;
  cashOnDelivery: string;
  backToCart: string;
  fullName: string;
  phoneNumber: string;
  wilaya: string;
  selectWilaya: string;
  wilayaRequired: string;
  deliveryMethod: string;
  domicile: string;
  stopDesk: string;
  deliveryMethodRequired: string;
  baladia: string;
  deliveryAddress: string;
  paymentMethod: string;
  orderItems: string;
  removeItem: string;
  decreaseQuantity: string;
  increaseQuantity: string;
  finalTotal: string;
  items: string;
  subtotal: string;
  delivery: string;
  total: string;
  confirmOrder: string;
  emptyCart: string;
  continueCustomizing: string;
  orderConfirmed: string;
  thankYou: string;
  orderFollowUp: string;
  orderSubmitError: string;
  language: string;
}

export type Language = 'fr' | 'ar' | 'en';
export type Theme = 'light' | 'dark';
export type SortOption = 'featured' | 'price-low' | 'price-high';
export type PrintingSide = 'FRONT' | 'BACK' | 'BOTH';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface CartItem {
  id: string;
  productId: string;
  productSlug: string;
  variantId: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  color: string;
  size: string;
  fit: string;
  customizationData: unknown;
  mockupFrontDataUrl?: string | null;
  mockupBackDataUrl?: string | null;
  designFrontDataUrl?: string | null;
  designBackDataUrl?: string | null;
  createdAt: string;
}

export type DeliveryMethod = 'A_DOMICILE' | 'STOP_DESK';

export interface CheckoutCustomer {
  customerName: string;
  phone: string;
  wilaya: string;
  deliveryMethod: DeliveryMethod | '';
  baladia: string;
  address: string;
}

export interface ApiOrderItem {
  id: string;
  productId: string;
  variantId: string | null;
  productNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  color: string | null;
  size: string | null;
  fit: string | null;
  customizationData: unknown;
  mockupFrontUrl: string | null;
  mockupBackUrl: string | null;
  designFrontUrl: string | null;
  designBackUrl: string | null;
  customizationJsonUrl: string | null;
  createdAt: string;
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  wilaya: string;
  deliveryMethod: DeliveryMethod;
  baladia: string;
  address: string;
  subtotal: number;
  deliveryCost: number;
  total: number;
  paymentMethod: 'COD';
  status: OrderStatus;
  confirmedAt: string | null;
  processingAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  items: ApiOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiOrdersResponse {
  status: string;
  data: {
    orders: Array<Omit<ApiOrder, 'items'> & { items: Array<{ id: string; quantity: number }> }>;
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export interface ApiOrderResponse {
  status: string;
  data: {
    order: ApiOrder;
  };
}

export interface DashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalOrders: number;
  statusCounts: Partial<Record<OrderStatus, number>>;
  itemsSold: number;
  averageOrderValue: number;
  topProducts: Array<{ product: string; quantity: number }>;
  recentOrders: Array<Pick<ApiOrder, 'id' | 'orderNumber' | 'customerName' | 'total' | 'status' | 'createdAt'>>;
  ordersByDay: Array<{ date: string; orders: number; revenue: number }>;
}
