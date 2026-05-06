import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  collection: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  details: string[];
  dimensions: string;
  material: string;
  finish: string;
  images: string[];
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  variant: any | null;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variant?: any | null) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1, variant = null) => {
        set((state) => {
          const cartItemId = variant ? `${product.id}-${variant.id}` : product.id;
          const existing = state.items.find((i) => i.cartItemId === cartItemId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.cartItemId === cartItemId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { cartItemId, product, variant, quantity }] };
        });
      },
      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.cartItemId !== cartItemId),
        }));
      },
      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.cartItemId === cartItemId ? { ...i, quantity } : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => {
        const activePrice = i.variant ? i.variant.price : i.product.price;
        return sum + activePrice * i.quantity;
      }, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'balaji-enterprise-cart',
    }
  )
);
