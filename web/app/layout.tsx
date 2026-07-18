import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://degracetechhub.vercel.app"),
  title: "DE-GRACE TECH HUB — Gadget Store & Repair Hub",
  description:
    "Whether you need a phone repaired, a new laptop, premium accessories, or expert technical support, DE-GRACE TECH HUB delivers quality you can trust.",
  openGraph: {
    type: "website",
    siteName: "DE-GRACE TECH HUB",
    title: "DE-GRACE TECH HUB — Gadget Store & Repair Hub",
    description:
      "Genuine devices, expert repairs, and friendly support in Lagos. Shop the latest gadgets or book a repair with warranty.",
    images: [{ url: "/images/technician.jpg", width: 1024, height: 559, alt: "DE-GRACE technician repairing a smartphone" }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
