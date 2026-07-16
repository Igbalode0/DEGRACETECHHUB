import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Password-gated admin session: the login action checks ADMIN_PASSWORD (from
// .env.local) and sets an HMAC-signed, httpOnly, expiring cookie. No token in
// the cookie ever contains the password itself. When the project moves to
// Supabase Auth, only this file needs to change — callers use requireAdmin().

const COOKIE = "dg_admin";
const SESSION_HOURS = 24 * 7;

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("Set ADMIN_PASSWORD in web/.env.local to enable the admin panel");
  return s;
}

function sign(exp: number): string {
  return createHmac("sha256", secret()).update(String(exp)).digest("base64url");
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createAdminSession() {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function destroyAdminSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const dot = raw.indexOf(".");
  if (dot < 1) return false;
  const exp = Number(raw.slice(0, dot));
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const given = Buffer.from(raw.slice(dot + 1));
  const expected = Buffer.from(sign(exp));
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Call at the top of every admin page and server action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
