export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.plantathome.in';
export const APP_NAME = 'PlantAtHome';
export const CURRENCY = '₹';
export const DEFAULT_LANGUAGE = 'en';
export const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ?? '';

export const SHOP_SLUGS = {
  plants:    'plants',
  equipment: 'equipment',
  fruits:    'fresh-fruits',
};

export const PAGE_SIZE = 20;

export const STORAGE_KEYS = {
  token:       'pa_token',
  user:        'pa_user',
  cart:        'pa_cart',
  onboarded:   'pa_onboarded',
};

export const ENDPOINTS = {
  // Auth
  login:           '/api/token',
  register:        '/api/register',
  me:              '/api/me',
  logout:          '/api/logout',
  changePassword:  '/api/change-password',
  // Products
  products:        '/api/products',
  product:         (slug: string) => `/api/products/${slug}`,
  // Categories
  categories:      '/api/categories',
  // Types (shop types)
  types:           '/api/types',
  // Orders
  orders:          '/api/orders',
  order:           (trackingNumber: string) => `/api/orders/${trackingNumber}`,
  // Settings
  settings:        '/api/settings',
  // Addresses
  addresses:       '/api/address',
  address:         (id: number) => `/api/address/${id}`,
  // Profile
  updateUser:      (id: number) => `/api/users/${id}`,
  // Search
  search:          '/api/products',
};
