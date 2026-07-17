"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { CartItem } from "@/types/commerce";

const CART_KEY = "billbird-cart-v1";

interface CartTotals {
  subtotal: number;
  lensCharges: number;
  shipping: number;
  vat: number;
  discount: number;
  total: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  totals: CartTotals;
  addItem: (item: Omit<CartItem, "id">) => string;
  updateItem: (id: string, patch: Partial<CartItem>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function calculateItemTotal(item: Pick<CartItem, "framePrice" | "quantity" | "lensSelection">) {
  return (item.framePrice + (item.lensSelection?.lensPrice ?? 0)) * item.quantity;
}

function calculateTotals(items: CartItem[]): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.framePrice * item.quantity, 0);
  const lensCharges = items.reduce(
    (sum, item) => sum + (item.lensSelection?.lensPrice ?? 0) * item.quantity,
    0,
  );
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const discount = subtotal + lensCharges > 900 ? 50 : 0;
  const shipping = subtotal + lensCharges > 500 || quantity === 0 ? 0 : 25;
  const taxable = Math.max(0, subtotal + lensCharges + shipping - discount);
  const vat = Math.round(taxable * 0.05);
  const total = taxable + vat;

  return { subtotal, lensCharges, shipping, vat, discount, total, quantity };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = window.localStorage.getItem(CART_KEY);
        if (raw) setItems(JSON.parse(raw) as CartItem[]);
      } catch {
        setItems([]);
      } finally {
        setHydrated(true);
      }
    });
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    const id = `${item.productId}-${Date.now()}`;
    const nextItem: CartItem = {
      ...item,
      id,
      totalPrice: calculateItemTotal(item),
    };
    setItems((current) => [nextItem, ...current]);
    return id;
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<CartItem>) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const merged = { ...item, ...patch };
        return { ...merged, totalPrice: calculateItemTotal(merged) };
      }),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, quantity: Math.max(1, quantity) };
        return { ...next, totalPrice: calculateItemTotal(next) };
      }),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const totals = useMemo(() => calculateTotals(items), [items]);

  const value = useMemo(
    () => ({
      items,
      hydrated,
      totals,
      addItem,
      updateItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [addItem, clearCart, hydrated, items, removeItem, totals, updateItem, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
