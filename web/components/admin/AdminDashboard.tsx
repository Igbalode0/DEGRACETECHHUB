"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { naira } from "@/lib/format";
import { shopCategories } from "@/lib/data";
import type { CatalogProduct, ProductColor } from "@/lib/catalog/types";
import { colorsOf, mediaOf } from "@/lib/catalog/media";
import MediaManager, { type EditorMedia } from "@/components/admin/MediaManager";
import ColorsManager from "@/components/admin/ColorsManager";
import {
  deleteProductAction,
  saveProductAction,
  toggleActiveAction,
  toggleSoldOutAction,
} from "@/app/admin/actions";
import styles from "@/app/admin/admin.module.css";

type Editing = { product: CatalogProduct | null } | null;

export default function AdminDashboard({ products }: { products: CatalogProduct[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [, startToggle] = useTransition();

  // Media and colours are edited as structured state, then serialised on save.
  const [media, setMedia] = useState<EditorMedia[]>([]);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [coverId, setCoverId] = useState<string | null>(null);

  /** Opens the editor seeded from a product (or blank for a new one). */
  const openEditor = (product: CatalogProduct | null) => {
    const existingMedia = product ? mediaOf(product) : [];
    setMedia(
      existingMedia.map((m) => ({
        id: m.id,
        kind: m.kind,
        url: m.url,
        colorId: m.colorId,
        view: m.view,
      })),
    );
    setColors(product ? colorsOf(product) : []);
    setCoverId(product?.coverMediaId ?? existingMedia[0]?.id ?? null);
    setError(null);
    setEditing({ product });
  };

  const submit = (formData: FormData) => {
    setError(null);
    // Files ride along as "newFiles"; the JSON records the order, tags and
    // which entry maps to which upload.
    let uploadIndex = 0;
    const payload = media.map((m) => {
      if (m.file) {
        formData.append("newFiles", m.file);
        return { id: m.id, kind: m.kind, uploadIndex: uploadIndex++, colorId: m.colorId, view: m.view };
      }
      return { id: m.id, kind: m.kind, url: m.url, colorId: m.colorId, view: m.view };
    });
    formData.set("mediaJson", JSON.stringify(payload));
    formData.set("colorsJson", JSON.stringify(colors.filter((c) => c.name.trim())));
    formData.set("coverMediaId", coverId ?? "");

    startSaving(async () => {
      const result = await saveProductAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditing(null);
      router.refresh();
    });
  };

  const toggle = (action: (id: string) => Promise<void>, id: string) =>
    startToggle(async () => {
      await action(id);
      router.refresh();
    });

  const remove = (p: CatalogProduct) => {
    if (!window.confirm(`Delete “${p.name}” permanently? Customers will no longer see it.`)) return;
    toggle(deleteProductAction, p.id);
  };

  return (
    <>
      <div className={styles.tableTop}>
        <button type="button" className={styles.primaryBtn} onClick={() => openEditor(null)}>
          + Add product
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Category</th>
              <th>Colors</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={p.active ? "" : styles.rowHidden}>
                <td>
                  <div className={styles.prodCell}>
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className={styles.thumb} src={p.imageUrl} alt="" />
                    ) : (
                      <div className={`${styles.thumb} ${styles.thumbEmpty}`}>{p.name.slice(0, 1)}</div>
                    )}
                    <div>
                      <div className={styles.prodName}>{p.name}</div>
                      {p.description && <div className={styles.prodDesc}>{p.description}</div>}
                    </div>
                  </div>
                </td>
                <td className={styles.priceCell}>{naira(p.price)}</td>
                <td>{p.category}</td>
                <td className={styles.colorsCell}>{p.colors.length ? p.colors.join(", ") : "—"}</td>
                <td>
                  <div className={styles.badges}>
                    <button
                      type="button"
                      className={`${styles.badge} ${p.active ? styles.badgeOn : styles.badgeOff}`}
                      onClick={() => toggle(toggleActiveAction, p.id)}
                      title={p.active ? "Visible in the shop — click to hide" : "Hidden from the shop — click to show"}
                    >
                      {p.active ? "Active" : "Hidden"}
                    </button>
                    <button
                      type="button"
                      className={`${styles.badge} ${p.soldOut ? styles.badgeWarn : styles.badgeStock}`}
                      onClick={() => toggle(toggleSoldOutAction, p.id)}
                      title={p.soldOut ? "Click to mark back in stock" : "Click to mark sold out"}
                    >
                      {p.soldOut ? "Sold out" : "In stock"}
                    </button>
                  </div>
                </td>
                <td>
                  <div className={styles.rowActions}>
                    <button type="button" className={styles.ghostBtn} onClick={() => openEditor(p)}>
                      Edit
                    </button>
                    <button type="button" className={styles.dangerBtn} onClick={() => remove(p)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className={styles.modalOverlay} onClick={() => !saving && setEditing(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Product form">
            <h2 className={styles.modalTitle}>{editing.product ? `Edit ${editing.product.name}` : "Add product"}</h2>
            {error && <div className={styles.formError}>{error}</div>}

            <form action={submit} className={styles.form}>
              {editing.product && <input type="hidden" name="id" value={editing.product.id} />}

              <label className={styles.field}>
                <span>Product name</span>
                <input className={styles.input} name="name" defaultValue={editing.product?.name ?? ""} required maxLength={80} />
              </label>

              <label className={styles.field}>
                <span>Brief description</span>
                <textarea
                  className={styles.textarea}
                  name="description"
                  rows={2}
                  maxLength={300}
                  placeholder="One or two lines customers will see"
                  defaultValue={editing.product?.description ?? ""}
                />
              </label>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span>Price (₦)</span>
                  <input
                    className={styles.input}
                    name="price"
                    type="number"
                    min={1}
                    step={1}
                    defaultValue={editing.product?.price ?? ""}
                    required
                  />
                </label>
                <label className={styles.field}>
                  <span>Category</span>
                  <select className={styles.input} name="category" defaultValue={editing.product?.category ?? "Smartphones"}>
                    {shopCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className={styles.field}>
                <span>Tag</span>
                <input className={styles.input} name="tag" maxLength={20} defaultValue={editing.product?.tag ?? "New"} />
              </label>

              <section className={styles.editorBlock}>
                <div className={styles.editorBlockHead}>
                  <h3 className={styles.editorBlockTitle}>Available colours</h3>
                  <span className={styles.editorBlockHint}>Swatch, stock and SKU per finish</span>
                </div>
                <ColorsManager
                  colors={colors}
                  setColors={setColors}
                  mediaCountFor={(id) => media.filter((m) => m.colorId === id).length}
                />
              </section>

              <section className={styles.editorBlock}>
                <div className={styles.editorBlockHead}>
                  <h3 className={styles.editorBlockTitle}>Product media</h3>
                  <span className={styles.editorBlockHint}>Tag a photo to a colour, or leave it shared</span>
                </div>
                <MediaManager
                  media={media}
                  setMedia={setMedia}
                  colors={colors}
                  coverId={coverId}
                  setCoverId={setCoverId}
                />
              </section>

              <details className={styles.moreFields} open={false}>
                <summary className={styles.moreSummary}>Quick View details</summary>

                <div className={styles.moreBody}>
                  <label className={styles.field}>
                    <span>Storage options (comma-separated)</span>
                    <input
                      className={styles.input}
                      name="storageOptions"
                      placeholder="128GB, 256GB, 512GB, 1TB"
                      defaultValue={editing.product?.storageOptions?.join(", ") ?? ""}
                    />
                  </label>

                  <label className={styles.field}>
                    <span>Key features — one per line, as “icon | label”</span>
                    <textarea
                      className={styles.textarea}
                      name="features"
                      rows={4}
                      placeholder={"📸 | 48MP Triple Camera\n🔋 | Up to 29 hours battery\n⚡ | Fast charging"}
                      defaultValue={editing.product?.features?.map((f) => `${f.icon} | ${f.label}`).join("\n") ?? ""}
                    />
                  </label>

                  <label className={styles.field}>
                    <span>Specifications — one per line, as “Label: value”</span>
                    <textarea
                      className={styles.textarea}
                      name="specs"
                      rows={5}
                      placeholder={"Display: 6.1-inch OLED\nProcessor: A17 Pro\nRAM: 8GB\nBattery: 3,274 mAh\nWarranty: 1 year"}
                      defaultValue={editing.product?.specs?.map((s) => `${s.label}: ${s.value}`).join("\n") ?? ""}
                    />
                  </label>

                  <label className={styles.field}>
                    <span>What&apos;s in the box (comma-separated)</span>
                    <input
                      className={styles.input}
                      name="included"
                      placeholder="Phone, USB-C cable, SIM tool, Documentation"
                      defaultValue={editing.product?.included?.join(", ") ?? ""}
                    />
                  </label>
                </div>
              </details>

              <div className={styles.toggleRow}>
                <label className={styles.check}>
                  <input type="checkbox" name="active" defaultChecked={editing.product?.active ?? true} />
                  <span>Active (visible in shop)</span>
                </label>
                <label className={styles.check}>
                  <input type="checkbox" name="soldOut" defaultChecked={editing.product?.soldOut ?? false} />
                  <span>Sold out</span>
                </label>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.ghostBtn} onClick={() => setEditing(null)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={saving}>
                  {saving ? "Saving…" : editing.product ? "Save changes" : "Add product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
