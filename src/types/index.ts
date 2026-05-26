export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profile?: {
    id: number;
    avatar?: { original: string; thumbnail: string };
    bio?: string;
    contact?: string;
  };
  address?: Address[];
  is_active: boolean;
  created_at: string;
}

export interface Address {
  id: number;
  title: string;
  type: 'billing' | 'shipping';
  default: boolean;
  address: {
    country: string;
    city: string;
    state: string;
    zip: string;
    street_address: string;
  };
  customer_id: number;
}

export interface MediaImage {
  original: string;
  thumbnail: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  image?: MediaImage;
  details?: string;
  parent_id?: number;
  type_id?: number;
  type?: ShopType;
  products_count?: number;
  children?: Category[];
}

export interface ShopType {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  settings?: any;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  sale_price?: number;
  min_price?: number;
  max_price?: number;
  sku?: string;
  quantity: number;
  in_stock: boolean;
  is_taxable: boolean;
  status: string;
  product_type: 'simple' | 'variable';
  unit?: string;
  image?: MediaImage;
  gallery?: MediaImage[];
  categories?: Category[];
  type_id?: number;
  type?: ShopType;
  language: string;
  visibility: string;
  // Extra plant-specific data in description
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  tracking_number: string;
  customer_id: number;
  customer_name: string;
  customer_contact: string;
  amount: number;
  sales_tax: number;
  paid_total: number;
  total: number;
  discount?: number;
  delivery_fee?: number;
  payment_gateway: string;
  payment_status: string;
  order_status: string;
  shipping_address?: Address['address'];
  billing_address?: Address['address'];
  delivery_time?: string;
  note?: string;
  products?: OrderProduct[];
  created_at: string;
  updated_at: string;
  children?: Order[];
}

export interface OrderProduct {
  id: number;
  name: string;
  slug: string;
  image?: MediaImage;
  unit_price: number;
  order_quantity: number;
  subtotal: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface AuthResponse {
  token: string;
  permissions: string[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
