export const ROUTES = {
  HOME: '/',
  WOMEN: '/women',
  MEN: '/men',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:slug',
  WISHLIST: '/wishlist',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER_CONFIRMATION: '/orders/confirmation/:orderId',
  ORDERS: '/orders',
  PROFILE: '/profile',
  ABOUT: '/about',
  CONTACT: '/contact',
  ADMIN: '/admin',
  ADMIN_OVERVIEW: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_ADMINISTRATORS: '/admin/administrators',
} as const;

export const PROTECTED_ROUTES = [
  '/wishlist',
  '/cart',
  '/checkout',
  '/orders',
  '/profile',
];

export const ADMIN_ROUTES = ['/admin'];
