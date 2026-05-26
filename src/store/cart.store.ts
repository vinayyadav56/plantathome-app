import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, CURRENCY } from '@/constants/config';
import type { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  isLoading: boolean;

  // Computed
  totalItems: number;
  totalAmount: number;

  // Actions
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: number) => void;
  updateQty: (productId: number, qty: number) => void;
  clearCart: () => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
  formattedTotal: () => string;
}

const persist = async (items: CartItem[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(items));
  } catch {}
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  get totalItems() {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },

  get totalAmount() {
    return get().items.reduce((sum, i) => sum + i.subtotal, 0);
  },

  addItem: (product, qty = 1) => {
    const items = [...get().items];
    const idx = items.findIndex((i) => i.product.id === product.id);
    if (idx >= 0) {
      items[idx].quantity += qty;
      items[idx].subtotal = items[idx].quantity * (product.sale_price ?? product.price);
    } else {
      const price = product.sale_price ?? product.price;
      items.push({ product, quantity: qty, subtotal: price * qty });
    }
    set({ items });
    persist(items);
  },

  removeItem: (productId) => {
    const items = get().items.filter((i) => i.product.id !== productId);
    set({ items });
    persist(items);
  },

  updateQty: (productId, qty) => {
    if (qty <= 0) { get().removeItem(productId); return; }
    const items = get().items.map((i) =>
      i.product.id === productId
        ? { ...i, quantity: qty, subtotal: qty * (i.product.sale_price ?? i.product.price) }
        : i,
    );
    set({ items });
    persist(items);
  },

  clearCart: () => {
    set({ items: [] });
    AsyncStorage.removeItem(STORAGE_KEYS.cart);
  },

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.cart);
      if (raw) set({ items: JSON.parse(raw) });
    } catch {}
  },

  saveToStorage: async () => {
    await persist(get().items);
  },

  formattedTotal: () => {
    return `${CURRENCY}${get().items.reduce((s, i) => s + i.subtotal, 0).toLocaleString('en-IN')}`;
  },
}));
