/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface CartProduct {
  productId: number;
  name: string;
  description: string;
  price: number;
  imgName: string;
  sku: string;
  unit: string;
  supplierId: number;
  discount?: number;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  addItem: (product: CartProduct, quantity: number) => void;
  removeItem: (productId: number) => void;
  setItemQuantity: (productId: number, quantity: number) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'octocat-cart';
const DISCOUNT_RATE = 0.05;
const SHIPPING_FEE = 10;

const isCartItem = (value: unknown): value is CartItem => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const item = value as Record<string, unknown>;
  return (
    Number.isInteger(item.productId) &&
    typeof item.name === 'string' &&
    typeof item.description === 'string' &&
    typeof item.price === 'number' &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    typeof item.imgName === 'string' &&
    typeof item.sku === 'string' &&
    typeof item.unit === 'string' &&
    typeof item.supplierId === 'number' &&
    Number.isInteger(item.quantity) &&
    Number(item.quantity) > 0 &&
    (item.discount === undefined ||
      (typeof item.discount === 'number' &&
        Number.isFinite(item.discount) &&
        item.discount >= 0 &&
        item.discount <= 1))
  );
};

const readStoredItems = (): CartItem[] => {
  try {
    const storedItems = localStorage.getItem(STORAGE_KEY);
    if (!storedItems) {
      return [];
    }
    const parsed: unknown = JSON.parse(storedItems);
    if (Array.isArray(parsed) && parsed.every(isCartItem)) {
      return parsed;
    }
    console.warn('Stored cart data is invalid and has been reset.');
  } catch (error) {
    console.error('Could not read stored cart data.', error);
  }
  return [];
};

const roundCurrency = (amount: number) => Math.round(amount * 100) / 100;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredItems);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Could not save cart data.', error);
    }
  }, [items]);

  const value = useMemo(() => {
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    const subtotal = roundCurrency(
      items.reduce(
        (sum, item) =>
          sum + item.price * (1 - (item.discount ?? 0)) * item.quantity,
        0,
      ),
    );
    const discount = roundCurrency(subtotal * DISCOUNT_RATE);
    const shipping = items.length > 0 ? SHIPPING_FEE : 0;

    return {
      items,
      itemCount,
      subtotal,
      discount,
      shipping,
      total: roundCurrency(subtotal - discount + shipping),
      addItem: (product: CartProduct, quantity: number) => {
        if (!Number.isInteger(quantity) || quantity <= 0) {
          return;
        }
        setItems((currentItems) => {
          const existingItem = currentItems.find(
            (item) => item.productId === product.productId,
          );
          return existingItem
            ? currentItems.map((item) =>
                item.productId === product.productId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              )
            : [...currentItems, { ...product, quantity }];
        });
      },
      removeItem: (productId: number) => {
        setItems((currentItems) =>
          currentItems.filter((item) => item.productId !== productId),
        );
      },
      setItemQuantity: (productId: number, quantity: number) => {
        if (!Number.isInteger(quantity) || quantity < 1) {
          return;
        }
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        );
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
