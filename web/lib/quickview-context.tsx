"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { PublicProduct } from "@/lib/catalog/types";
import QuickView from "@/components/quickview/QuickView";

type QuickViewContextValue = {
  open: (product: PublicProduct) => void;
  close: () => void;
};

const QuickViewContext = createContext<QuickViewContextValue | null>(null);

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<PublicProduct | null>(null);
  // Remembered so focus can be restored to the card that opened the dialog.
  const [opener, setOpener] = useState<HTMLElement | null>(null);

  const open = useCallback((p: PublicProduct) => {
    setOpener(document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setProduct(p);
  }, []);

  const close = useCallback(() => {
    setProduct(null);
    opener?.focus();
  }, [opener]);

  const value = useMemo<QuickViewContextValue>(() => ({ open, close }), [open, close]);

  return (
    <QuickViewContext.Provider value={value}>
      {children}
      {/* keyed by product so switching to a related item remounts with fresh state */}
      {product && <QuickView key={product.id} product={product} onClose={close} onSwitch={setProduct} />}
    </QuickViewContext.Provider>
  );
}

export function useQuickView(): QuickViewContextValue {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error("useQuickView must be used within a QuickViewProvider");
  return ctx;
}
