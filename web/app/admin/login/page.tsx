import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { loginAction } from "@/app/admin/actions";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: "Admin Login — DE-GRACE TECH HUB",
  robots: { index: false },
};

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <div className={styles.loginWrap}>
      <form className={styles.loginCard} action={loginAction}>
        <div className={styles.loginBadge}>DG</div>
        <h1 className={styles.loginTitle}>Admin Panel</h1>
        <p className={styles.loginHint}>Enter the admin password to manage products.</p>
        {error && <div className={styles.loginError}>Wrong password — try again.</div>}
        <input
          className={styles.input}
          type="password"
          name="password"
          placeholder="Admin password"
          aria-label="Admin password"
          autoFocus
          required
        />
        <button type="submit" className={styles.primaryBtn}>
          Sign in
        </button>
      </form>
    </div>
  );
}
