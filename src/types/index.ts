// ─── Core Domain Types ──────────────────────────────────────────────────────

export type Audience = 'Women' | 'Men';

export type JewelleryCollection = 'Gold' | 'Silver' | 'One Gram Gold' | 'Stones';

export type UserRole = 'user' | 'admin';

export type DeliveryStatus =
  | 'Order Placed'
  | 'Confirmed'
  | 'Preparing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type OTPDeliveryMethod = 'email' | 'mobile';

export type OTPPurpose = 'signup' | 'signin';

// ─── User & Auth ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  createdAt: string;
}

// ─── Product ────────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  slug: string;
  name: string;
  audience: Audience;
  collection: JewelleryCollection;
  subcategory: string;
  price?: number;  // Only for One Gram Gold and Stones
  purity?: string;
  weight?: string;  // For all products, especially Gold/Silver
  images: string[];
  description: string;
  stock: number;
  available: boolean;
  featured: boolean;
  bestseller: boolean;
  topValuable: boolean;
  hidden?: boolean;
  sortOrder?: number;
  createdAt?: string;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number | null;
  total: number;
}

// ─── Wishlist ────────────────────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  product: Product;
  addedAt: string;
}

// ─── Delivery Option ─────────────────────────────────────────────────────────

export interface DeliveryOption {
  id: string;
  name: string;
  price: number | null;
  estimatedRange?: string;
  enabled: boolean;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: number;
  productName: string;
  productSlug: string;
  audience: Audience;
  collection: JewelleryCollection;
  subcategory: string;
  price?: number;  // Only for One Gram Gold and Stones
  weight?: string;
  quantity: number;
  image?: string;
}

export interface ShippingAddress {
  name: string;
  mobile: string;
  email: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  postalCode: string;
  note?: string;
}

export interface Order {
  id: string;
  status: DeliveryStatus;
  deliveryOption: string;
  deliveryOptionId: string;
  deliveryCharge: number | null;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  confirmedDeliveryDate?: string;
  customerMobile: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  total: number;
  placedAt: string;
  updatedAt: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  orderCount: number;
  createdAt: string;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface SubcategoryEntry {
  audience: Audience;
  collection: JewelleryCollection;
  name: string;
  isCustom?: boolean;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

// ─── Filter State ─────────────────────────────────────────────────────────────

export interface ProductFilters {
  search?: string;
  audience?: Audience | '';
  collection?: JewelleryCollection | '';
  subcategory?: string;
  available?: boolean | '';
  minPrice?: number | '';
  maxPrice?: number | '';
  page?: number;
  pageSize?: number;
}
