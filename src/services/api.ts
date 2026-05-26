import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL, ENDPOINTS, PAGE_SIZE, STORAGE_KEYS } from '@/constants/config';
import type {
  AuthResponse, User, Product, Category, Order,
  PaginatedResponse, Address, ShopType,
} from '@/types';

// ── Axios instance ────────────────────────────────────────────
const client: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Accept-Language': 'en',
  },
});

// Attach auth token to every request
client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(STORAGE_KEYS.token);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise errors
client.interceptors.response.use(
  (res) => res,
  (err: AxiosError<any>) => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  },
);

export default client;

// ── Auth ──────────────────────────────────────────────────────
export const AuthService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await client.post<AuthResponse>(ENDPOINTS.login, { email, password });
    return data;
  },

  async register(params: {
    name: string; email: string; password: string; phone?: string;
  }): Promise<AuthResponse> {
    const { data } = await client.post<AuthResponse>(ENDPOINTS.register, params);
    return data;
  },

  async me(): Promise<User> {
    const { data } = await client.get<User>(ENDPOINTS.me);
    return data;
  },

  async logout(): Promise<void> {
    await client.post(ENDPOINTS.logout).catch(() => {});
  },
};

// ── Products ──────────────────────────────────────────────────
export const ProductService = {
  async list(params: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    search?: string;
    orderBy?: string;
    sortedBy?: string;
  } = {}): Promise<PaginatedResponse<Product>> {
    const { data } = await client.get<PaginatedResponse<Product>>(ENDPOINTS.products, {
      params: {
        limit: PAGE_SIZE,
        page: 1,
        language: 'en',
        ...params,
      },
    });
    return data;
  },

  async get(slug: string): Promise<Product> {
    const { data } = await client.get<Product>(ENDPOINTS.product(slug));
    return data;
  },

  async featured(type: string = 'plants'): Promise<Product[]> {
    const res = await ProductService.list({ type, orderBy: 'created_at', sortedBy: 'desc', limit: 10 });
    return res.data;
  },

  async search(query: string, type?: string): Promise<Product[]> {
    const res = await ProductService.list({ search: query, type, limit: 20 });
    return res.data;
  },
};

// ── Categories ────────────────────────────────────────────────
export const CategoryService = {
  async list(params: { type?: string; limit?: number } = {}): Promise<Category[]> {
    const { data } = await client.get<PaginatedResponse<Category>>(ENDPOINTS.categories, {
      params: { limit: 100, language: 'en', ...params },
    });
    return data.data ?? (data as any) ?? [];
  },
};

// ── Shop Types ────────────────────────────────────────────────
export const TypeService = {
  async list(): Promise<ShopType[]> {
    const { data } = await client.get<PaginatedResponse<ShopType>>(ENDPOINTS.types, {
      params: { limit: 20, language: 'en' },
    });
    return data.data ?? (data as any) ?? [];
  },
};

// ── Orders ────────────────────────────────────────────────────
export const OrderService = {
  async list(): Promise<Order[]> {
    const { data } = await client.get<PaginatedResponse<Order>>(ENDPOINTS.orders, {
      params: { limit: 50, orderBy: 'created_at', sortedBy: 'desc' },
    });
    return data.data ?? [];
  },

  async get(trackingNumber: string): Promise<Order> {
    const { data } = await client.get<Order>(ENDPOINTS.order(trackingNumber));
    return data;
  },

  async create(payload: {
    products: { product_id: number; order_quantity: number; unit_price: number; subtotal: number }[];
    shipping_address: Address['address'];
    billing_address: Address['address'];
    customer_contact: string;
    payment_gateway: string;
    amount: number;
    sales_tax: number;
    delivery_fee: number;
    discount: number;
    paid_total: number;
    total: number;
    language: string;
  }): Promise<Order> {
    const { data } = await client.post<Order>(ENDPOINTS.orders, payload);
    return data;
  },
};

// ── Addresses ─────────────────────────────────────────────────
export const AddressService = {
  async list(): Promise<Address[]> {
    const { data } = await client.get<Address[]>(ENDPOINTS.addresses);
    return data ?? [];
  },

  async create(payload: Omit<Address, 'id' | 'customer_id'>): Promise<Address> {
    const { data } = await client.post<Address>(ENDPOINTS.addresses, payload);
    return data;
  },

  async update(id: number, payload: Partial<Address>): Promise<Address> {
    const { data } = await client.put<Address>(ENDPOINTS.address(id), payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await client.delete(ENDPOINTS.address(id));
  },
};
