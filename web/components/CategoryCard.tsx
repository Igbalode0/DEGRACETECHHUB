"use client";

import Link from "next/link";
import Reveal from "@/components/Reveal";
import styles from "@/app/(site)/page.module.css";

export default function CategoryCard({ name, emoji, href }: { name: string; emoji: string; href: string }) {
  return (
    <Reveal as={Link} href={href} className={styles.catCard}>
      <div className={`${styles.catImage} placeholder-fill`}>
        <span className={styles.catEmoji}>{emoji}</span>
      </div>
      <div className={styles.catBody}>
        <div className={styles.catName}>{name}</div>
        <div className={styles.catCta}>View Collection →</div>
      </div>
    </Reveal>
  );
}
