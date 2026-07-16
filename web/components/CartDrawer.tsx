"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { CartIcon, CloseIcon } from "@/components/icons";
import { naira } from "@/lib/format";
import { WHATSAPP_URL } from "@/lib/data";
import styles from "@/components/CartDrawer.module.css";

export default function CartDrawer() {
  const { items, count, total, isOpen, closeCart, changeQty, removeItem } = useCart();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={closeCart}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>
            Your Cart <span className={styles.titleCount}>({count})</span>
          </div>
          <button type="button" aria-label="Close" className={styles.closeBtn} onClick={closeCart}>
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <CartIcon width={30} height={30} />
            </div>
            <div className={styles.emptyText}>Your cart is empty</div>
            <Link href="/shop" className={styles.browseBtn} onClick={closeCart}>
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map((item) => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemThumb} />
                  <div className={styles.itemBody}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemPrice}>{naira(item.price)}</div>
                    <div className={styles.qtyRow}>
                      <button type="button" className={styles.qtyBtn} onClick={() => changeQty(item.id, -1)}>
                        &minus;
                      </button>
                      <span className={styles.qtyValue}>{item.qty}</span>
                      <button type="button" className={styles.qtyBtn} onClick={() => changeQty(item.id, 1)}>
                        +
                      </button>
                      <button type="button" className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.footer}>
              <div className={styles.subtotalRow}>
                <span className={styles.subtotalLabel}>Subtotal</span>
                <span className={styles.subtotalValue}>{naira(total)}</span>
              </div>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className={styles.checkoutBtn}>
                Checkout via WhatsApp
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
