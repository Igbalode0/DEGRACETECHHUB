"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { naira } from "@/lib/format";
import { shopCategories } from "@/lib/data";
import type { CatalogProduct } from "@/lib/catalog/types";
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

  const submit = (formData: FormData) => {
    setError(null);
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
        <button type="button" className={styles.primaryBtn} onClick={() => setEditing({ product: null })}>
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
                    <button type="button" className={styles.ghostBtn} onClick={() => setEditing({ product: p })}>
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

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span>Available colors (comma-separated)</span>
                  <input
                    className={styles.input}
                    name="colors"
                    placeholder="Black, Silver, Gold"
                    defaultValue={editing.product?.colors.join(", ") ?? ""}
                  />
                </label>
                <label className={styles.field}>
                  <span>Tag</span>
                  <input className={styles.input} name="tag" maxLength={20} defaultValue={editing.product?.tag ?? "New"} />
                </label>
              </div>

              <label className={styles.field}>
                <span>Product image {editing.product?.imageUrl ? "(replaces current)" : ""}</span>
                <input className={styles.fileInput} name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" />
              </label>

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
