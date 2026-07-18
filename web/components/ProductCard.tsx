import Reveal from "@/components/Reveal";
import AddToCartButton from "@/components/AddToCartButton";
import ProductArt, { artKindFor, tintFor } from "@/components/ProductArt";
import { naira } from "@/lib/format";
import type { PublicProduct } from "@/lib/catalog/types";
import styles from "@/components/ProductCard.module.css";

export default function ProductCard({ product, showCategory = false }: { product: PublicProduct; showCategory?: boolean }) {
  return (
    <Reveal className={styles.productCard}>
      <div className={styles.productImage} style={product.imageUrl ? undefined : { background: tintFor(product.id) }}>
        {product.imageUrl ? (
          // Uploaded via the admin panel (local /uploads or Supabase Storage URL)
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.productPhoto} src={product.imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <ProductArt kind={artKindFor(product.name, product.category)} size={64} />
        )}
        <span className={styles.productTag}>{product.tag}</span>
        {product.soldOut && <span className={styles.soldOutBadge}>Sold out</span>}
      </div>
      <div className={styles.productBody}>
        <div className={styles.productRating}>
          <span className={styles.productStars}>★★★★★</span>
          <span className={styles.productRatingNum}>{product.rating}</span>
        </div>
        <div className={styles.productName}>{product.name}</div>
        {showCategory && product.category && <div className={styles.productCategory}>{product.category}</div>}
        {product.description && <div className={styles.productDesc}>{product.description}</div>}
        {product.colors.length > 0 && (
          <div className={styles.productColors} aria-label={`Available colors: ${product.colors.join(", ")}`}>
            {product.colors.map((c) => (
              <span key={c} className={styles.productColor}>
                {c}
              </span>
            ))}
          </div>
        )}
        <div className={styles.productPriceRow}>
          <span className={styles.productPrice}>{naira(product.price)}</span>
        </div>
        <AddToCartButton id={product.id} name={product.name} price={product.price} soldOut={product.soldOut} />
      </div>
    </Reveal>
  );
}
