"use client";

import { useCart } from "@/lib/cart-context";
import { CartIcon } from "@/components/icons";
import styles from "@/components/ProductCard.module.css";

export default function AddToCartButton({
  id,
  name,
  price,
  soldOut = false,
}: {
  id: string;
  name: string;
  price: number;
  soldOut?: boolean;
}) {
  const { addToCart } = useCart();
  return (
    <button
      type="button"
      className={styles.addToCartBtn}
      onClick={() => addToCart({ id, name, price })}
      disabled={soldOut}
    >
      <CartIcon width={15} height={15} />
      {soldOut ? "Sold Out" : "Add to Cart"}
    </button>
  );
}
