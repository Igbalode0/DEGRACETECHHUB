"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

export type CartItem = { id: string; name: string; price: number; qty: number };
type AddableProduct = { id: string; name: string; price: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: AddableProduct) => void;
  changeQty: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
};

const STORAGE_KEY = "dg_cart";
const CartContext = createContext<CartContextValue | null>(null);

// A minimal external store over localStorage so the cart hydrates without a
// server/client markup mismatch (see useSyncExternalStore's getServerSnapshot)
// and stays in sync across tabs via the native "storage" event.
let cachedRaw: string | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): string {
  if (cachedRaw === null) {
    try {
      cachedRaw = localStorage.getItem(STORAGE_KEY) ?? "[]";
    } catch {
      cachedRaw = "[]";
    }
  }
  return cachedRaw;
}

function getServerSnapshot(): string {
  return "[]";
}

function setSnapshot(raw: string) {
  cachedRaw = raw;
  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // localStorage unavailable — cart just won't persist
  }
  listeners.forEach((l) => l());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    cachedRaw = e.newValue ?? "[]";
    callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function parseItems(raw: string): CartItem[] {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const items = useMemo(() => parseItems(raw), [raw]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = useCallback(
    (product: AddableProduct) => {
      const existing = items.find((i) => i.id === product.id);
      const next = existing
        ? items.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
        : [...items, { id: product.id, name: product.name, price: product.price, qty: 1 }];
      setSnapshot(JSON.stringify(next));
      setIsOpen(true);
    },
    [items],
  );

  const changeQty = useCallback(
    (id: string, delta: number) => {
      const next = items.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0);
      setSnapshot(JSON.stringify(next));
    },
    [items],
  );

  const removeItem = useCallback(
    (id: string) => {
      setSnapshot(JSON.stringify(items.filter((i) => i.id !== id)));
    },
    [items],
  );

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count,
      total,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addToCart,
      changeQty,
      removeItem,
    }),
    [items, count, total, isOpen, addToCart, changeQty, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
