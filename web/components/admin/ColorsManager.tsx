"use client";

import { guessHex } from "@/lib/catalog/media";
import type { ProductColor } from "@/lib/catalog/types";
import styles from "@/app/admin/admin.module.css";

// Colours are structured records, not a comma list: each one owns a swatch,
// optional stock count and SKU, and a stable id that media items tag against.

function newId() {
  return `c_${Math.random().toString(36).slice(2, 10)}`;
}

export default function ColorsManager({
  colors,
  setColors,
  mediaCountFor,
}: {
  colors: ProductColor[];
  setColors: (next: ProductColor[]) => void;
  /** How many photos are tagged to a colour — drives the "shared" hint. */
  mediaCountFor: (colorId: string) => number;
}) {
  const update = (id: string, patch: Partial<ProductColor>) =>
    setColors(colors.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const add = () =>
    setColors([...colors, { id: newId(), name: "", hex: "#8e8e93", stock: null, sku: null }]);

  const remove = (id: string) => setColors(colors.filter((c) => c.id !== id));

  return (
    <div className={styles.colorsWrap}>
      {colors.length === 0 && (
        <p className={styles.mediaEmpty}>
          No colours yet. Add one to offer colour choices and to tag photos to a specific finish.
        </p>
      )}

      {colors.length > 0 && (
        <div className={styles.colorHead}>
          <span>Colour</span>
          <span>Swatch</span>
          <span>Stock</span>
          <span>SKU</span>
          <span />
        </div>
      )}

      <ul className={styles.colorList}>
        {colors.map((c) => {
          const own = mediaCountFor(c.id);
          return (
            <li key={c.id} className={styles.colorRow}>
              <div className={styles.colorNameCell}>
                <input
                  className={styles.input}
                  value={c.name}
                  placeholder="e.g. Midnight Black"
                  onChange={(e) => {
                    const name = e.target.value;
                    // Auto-suggest a swatch until the admin picks one deliberately.
                    const patch: Partial<ProductColor> = { name };
                    if (c.hex === "#8e8e93" || c.hex === guessHex(c.name)) patch.hex = guessHex(name);
                    update(c.id, patch);
                  }}
                />
                <span className={styles.colorHint}>
                  {own > 0 ? `${own} photo${own === 1 ? "" : "s"}` : "uses shared photos"}
                </span>
              </div>

              <div className={styles.swatchCell}>
                <input
                  type="color"
                  className={styles.colorPicker}
                  value={c.hex}
                  onChange={(e) => update(c.id, { hex: e.target.value })}
                  aria-label={`${c.name || "Colour"} swatch`}
                />
                <input
                  className={styles.hexInput}
                  value={c.hex}
                  onChange={(e) => update(c.id, { hex: e.target.value })}
                  aria-label={`${c.name || "Colour"} hex code`}
                  maxLength={7}
                />
              </div>

              <input
                className={styles.input}
                type="number"
                min={0}
                placeholder="—"
                value={c.stock ?? ""}
                onChange={(e) => update(c.id, { stock: e.target.value === "" ? null : Number(e.target.value) })}
                aria-label={`${c.name || "Colour"} stock`}
              />

              <input
                className={styles.input}
                placeholder="optional"
                value={c.sku ?? ""}
                onChange={(e) => update(c.id, { sku: e.target.value || null })}
                aria-label={`${c.name || "Colour"} SKU`}
              />

              <button
                type="button"
                className={styles.miniBtnDanger}
                onClick={() => remove(c.id)}
                aria-label={`Remove ${c.name || "colour"}`}
                title="Remove colour"
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>

      <button type="button" className={styles.ghostBtn} onClick={add}>
        + Add colour
      </button>
    </div>
  );
}
