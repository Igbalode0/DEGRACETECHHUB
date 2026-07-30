"use client";

import type { ReactNode } from "react";
import { useQuickView } from "@/lib/quickview-context";
import type { PublicProduct } from "@/lib/catalog/types";

/**
 * Opens the Quick View for a product. Rendered as a real <button> so it is
 * keyboard-reachable and announced correctly; server components can drop it
 * anywhere since the product data is serializable.
 */
export default function QuickViewTrigger({
  product,
  className,
  children,
  ariaLabel,
}: {
  product: PublicProduct;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const { open } = useQuickView();
  return (
    <button type="button" className={className} onClick={() => open(product)} aria-label={ariaLabel ?? `Quick view: ${product.name}`}>
      {children}
    </button>
  );
}
