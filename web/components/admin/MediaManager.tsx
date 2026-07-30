"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VIEW_TYPES, type ProductColor, type ProductMedia, type ViewType } from "@/lib/catalog/types";
import styles from "@/app/admin/admin.module.css";

// One row of the editor's media library. Items already saved carry a url;
// items just dropped in carry a File plus a local preview until the form is
// submitted, which is what makes "preview before save" work.
export type EditorMedia = {
  id: string;
  kind: ProductMedia["kind"];
  url?: string;
  file?: File;
  previewUrl?: string;
  colorId: string | null;
  view: ViewType;
};

const VIEW_LABELS: Record<ViewType, string> = {
  front: "Front",
  back: "Back",
  left: "Left",
  right: "Right",
  top: "Top",
  bottom: "Bottom",
  angle: "45° angle",
  closeup: "Close-up",
  lifestyle: "Lifestyle",
  packaging: "Packaging",
  other: "Other",
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

function newId() {
  return `m_${Math.random().toString(36).slice(2, 10)}`;
}

export default function MediaManager({
  media,
  setMedia,
  colors,
  coverId,
  setCoverId,
}: {
  media: EditorMedia[];
  setMedia: (next: EditorMedia[]) => void;
  colors: ProductColor[];
  coverId: string | null;
  setCoverId: (id: string | null) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrls = useRef<string[]>([]);

  // Revoke preview blobs when the editor unmounts so we don't leak memory.
  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const incoming = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (incoming.length === 0) return;
      const added: EditorMedia[] = incoming.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        objectUrls.current.push(previewUrl);
        return { id: newId(), kind: "image", file, previewUrl, colorId: null, view: "other" };
      });
      const next = [...media, ...added];
      setMedia(next);
      if (!coverId) setCoverId(next[0].id);
    },
    [media, setMedia, coverId, setCoverId],
  );

  const update = (id: string, patch: Partial<EditorMedia>) =>
    setMedia(media.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const remove = (id: string) => {
    const next = media.filter((m) => m.id !== id);
    setMedia(next);
    if (coverId === id) setCoverId(next[0]?.id ?? null);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= media.length || from === to) return;
    const next = [...media];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setMedia(next);
  };

  const onDropFiles = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const untaggedCount = media.filter((m) => m.colorId === null).length;

  return (
    <div className={styles.mediaWrap}>
      {/* drop zone */}
      <div
        className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDropFiles}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
      >
        <div className={styles.dropIcon} aria-hidden="true">
          ⇪
        </div>
        <div className={styles.dropTitle}>Drag photos here, or click to browse</div>
        <div className={styles.dropHint}>
          Unlimited images · JPEG, PNG, WebP, GIF or AVIF · up to 5 MB each
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {media.length === 0 ? (
        <p className={styles.mediaEmpty}>No photos yet. The first one you add becomes the cover image.</p>
      ) : (
        <>
          <div className={styles.mediaMeta}>
            <span>
              {media.length} {media.length === 1 ? "image" : "images"}
            </span>
            <span className={styles.mediaMetaDim}>
              {untaggedCount} shared across all colours · drag a card to reorder
            </span>
          </div>

          <ul className={styles.mediaGrid}>
            {media.map((m, i) => (
              <li
                key={m.id}
                className={`${styles.mediaCard} ${dragId === m.id ? styles.mediaCardDragging : ""}`}
                draggable
                onDragStart={() => setDragId(m.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!dragId) return;
                  move(
                    media.findIndex((x) => x.id === dragId),
                    i,
                  );
                  setDragId(null);
                }}
              >
                <div className={styles.mediaThumbWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.previewUrl ?? m.url} alt="" className={styles.mediaThumb} />
                  {coverId === m.id && <span className={styles.coverBadge}>Cover</span>}
                  {m.file && <span className={styles.pendingBadge}>New</span>}
                </div>

                <div className={styles.mediaControls}>
                  <label className={styles.mediaField}>
                    <span>Colour</span>
                    <select
                      className={styles.miniSelect}
                      value={m.colorId ?? ""}
                      onChange={(e) => update(m.id, { colorId: e.target.value || null })}
                    >
                      <option value="">All colours (shared)</option>
                      {colors.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.mediaField}>
                    <span>View</span>
                    <select
                      className={styles.miniSelect}
                      value={m.view}
                      onChange={(e) => update(m.id, { view: e.target.value as ViewType })}
                    >
                      {VIEW_TYPES.map((v) => (
                        <option key={v} value={v}>
                          {VIEW_LABELS[v]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className={styles.mediaActions}>
                  <button
                    type="button"
                    className={styles.miniBtn}
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                    aria-label="Move earlier"
                    title="Move earlier"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className={styles.miniBtn}
                    onClick={() => move(i, i + 1)}
                    disabled={i === media.length - 1}
                    aria-label="Move later"
                    title="Move later"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    className={`${styles.miniBtn} ${coverId === m.id ? styles.miniBtnOn : ""}`}
                    onClick={() => setCoverId(m.id)}
                    disabled={coverId === m.id}
                    title="Use as cover image"
                  >
                    Cover
                  </button>
                  <button
                    type="button"
                    className={styles.miniBtnDanger}
                    onClick={() => remove(m.id)}
                    aria-label="Remove image"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
