export type Product = {
  id: string;
  name: string;
  price: number;
  rating: string;
  tag: string;
  slug: string;
  category?: string;
};

export const products: Product[] = [
  { id: "iphone15pro", name: "iPhone 15 Pro", price: 1850000, rating: "4.9", tag: "Featured", slug: "iphone-15-pro" },
  { id: "galaxys25", name: "Samsung Galaxy S25", price: 1450000, rating: "4.8", tag: "New", slug: "galaxy-s25" },
  { id: "macbookair", name: "MacBook Air", price: 1650000, rating: "4.9", tag: "Popular", slug: "macbook-air" },
  { id: "applewatch", name: "Apple Watch", price: 520000, rating: "4.7", tag: "Featured", slug: "apple-watch" },
  { id: "airpodspro", name: "AirPods Pro", price: 380000, rating: "4.8", tag: "Best seller", slug: "airpods-pro" },
  { id: "fastcharger", name: "Fast Chargers", price: 25000, rating: "4.6", tag: "Deal", slug: "fast-charger" },
  { id: "powerbank", name: "Power Banks", price: 45000, rating: "4.7", tag: "Deal", slug: "power-bank" },
  { id: "phonecase", name: "Phone Cases", price: 12000, rating: "4.5", tag: "Accessory", slug: "phone-case" },
];

export const shopCategories = ["Smartphones", "Laptops", "Tablets", "Smartwatches", "Accessories"] as const;
export type ShopCategory = (typeof shopCategories)[number];

export const shopProducts: (Product & { category: ShopCategory })[] = [
  { id: "iphone15pro", name: "iPhone 15 Pro", price: 1850000, rating: "4.9", tag: "Featured", category: "Smartphones", slug: "iphone-15-pro" },
  { id: "galaxys25", name: "Samsung Galaxy S25", price: 1450000, rating: "4.8", tag: "New", category: "Smartphones", slug: "galaxy-s25" },
  { id: "iphone14", name: "iPhone 14", price: 1180000, rating: "4.7", tag: "Deal", category: "Smartphones", slug: "iphone-14" },
  { id: "pixel8", name: "Google Pixel 8", price: 990000, rating: "4.6", tag: "New", category: "Smartphones", slug: "pixel-8" },
  { id: "macbookair", name: "MacBook Air M3", price: 1650000, rating: "4.9", tag: "Popular", category: "Laptops", slug: "macbook-air" },
  { id: "macbookpro", name: 'MacBook Pro 14"', price: 2850000, rating: "4.9", tag: "Pro", category: "Laptops", slug: "macbook-pro" },
  { id: "dellxps", name: "Dell XPS 13", price: 1420000, rating: "4.7", tag: "Featured", category: "Laptops", slug: "dell-xps-13" },
  { id: "hpspectre", name: "HP Spectre x360", price: 1350000, rating: "4.6", tag: "New", category: "Laptops", slug: "hp-spectre" },
  { id: "ipadpro", name: 'iPad Pro 11"', price: 1290000, rating: "4.8", tag: "Pro", category: "Tablets", slug: "ipad-pro" },
  { id: "ipadair", name: "iPad Air", price: 720000, rating: "4.7", tag: "Popular", category: "Tablets", slug: "ipad-air" },
  { id: "galaxytab", name: "Galaxy Tab S9", price: 830000, rating: "4.6", tag: "New", category: "Tablets", slug: "galaxy-tab-s9" },
  { id: "applewatch", name: "Apple Watch Series 9", price: 520000, rating: "4.7", tag: "Featured", category: "Smartwatches", slug: "apple-watch" },
  { id: "watchse", name: "Apple Watch SE", price: 330000, rating: "4.6", tag: "Deal", category: "Smartwatches", slug: "apple-watch-se" },
  { id: "galaxywatch", name: "Galaxy Watch 6", price: 390000, rating: "4.5", tag: "New", category: "Smartwatches", slug: "galaxy-watch-6" },
  { id: "airpodspro", name: "AirPods Pro", price: 380000, rating: "4.8", tag: "Best seller", category: "Accessories", slug: "airpods-pro" },
  { id: "earbuds", name: "Wireless Earbuds", price: 95000, rating: "4.5", tag: "Deal", category: "Accessories", slug: "wireless-earbuds" },
  { id: "fastcharger", name: "Fast Charger 30W", price: 25000, rating: "4.6", tag: "Deal", category: "Accessories", slug: "fast-charger" },
  { id: "powerbank", name: "Power Bank 20K", price: 45000, rating: "4.7", tag: "Deal", category: "Accessories", slug: "power-bank" },
  { id: "phonecase", name: "Premium Phone Case", price: 12000, rating: "4.5", tag: "Accessory", category: "Accessories", slug: "phone-case" },
];

export type Service = {
  key: "repairs" | "software" | "sales";
  title: string;
  items: string[];
};

export const services: Service[] = [
  {
    key: "repairs",
    title: "Device Repairs",
    items: ["Screen Replacement", "Battery Replacement", "Charging Port Repair", "Water Damage", "Camera Repair"],
  },
  {
    key: "software",
    title: "Software Solutions",
    items: ["Phone Flashing", "Unlocking", "Virus Removal", "System Installation", "Data Recovery"],
  },
  {
    key: "sales",
    title: "Gadget Sales",
    items: ["Smartphones", "Laptops", "Tablets", "Smartwatches", "Accessories"],
  },
];

export const categories = [
  { name: "Smartphones", emoji: "📱" },
  { name: "Laptops", emoji: "💻" },
  { name: "Smartwatches", emoji: "⌚" },
  { name: "Accessories", emoji: "🎧" },
];

export const reasons = [
  "Genuine Quality Parts",
  "Fast Repairs",
  "Affordable Prices",
  "Experienced Technicians",
  "Warranty on Repairs",
  "Friendly Customer Support",
];

export const steps = [
  { n: "01", title: "Bring Your Device", desc: "Walk in or book online. Tell us what's wrong and we take it from there." },
  { n: "02", title: "Free Diagnosis", desc: "Our technicians inspect your device and give you an honest, upfront quote." },
  { n: "03", title: "Professional Repair", desc: "Genuine parts, expert hands, and a quality check on every repair." },
  { n: "04", title: "Pick Up Like New", desc: "Collect your device working like new — backed by our warranty." },
];

export const reviews = [
  { text: "My phone looked brand new after repair.", name: "Chidinma O.", role: "Verified customer", initial: "C" },
  { text: "Very affordable and professional.", name: "Tunde A.", role: "Verified customer", initial: "T" },
  { text: "Best gadget store I've used.", name: "Grace E.", role: "Verified customer", initial: "G" },
  { text: "Fixed my MacBook the same day. Incredible service.", name: "Ibrahim K.", role: "Verified customer", initial: "I" },
  { text: "Genuine parts and a real warranty. Highly recommend.", name: "Blessing N.", role: "Verified customer", initial: "B" },
];

export const contacts = [
  { key: "phone", label: "Phone Number", value: "+234 706 265 1594" },
  { key: "whatsapp", label: "WhatsApp", value: "+234 706 265 1594" },
  { key: "email", label: "Email", value: "peterolamide5453@gmail.com" },
  { key: "address", label: "Business Address", value: "123 Tech Street, Lagos, Nigeria" },
  { key: "hours", label: "Business Hours", value: "Mon – Sat: 9:00 AM – 7:00 PM" },
] as const;

export const repairServices = [
  {
    key: "repairs",
    title: "Device Repairs",
    items: ["Screen Replacement", "Battery Replacement", "Charging Port Repair", "Water Damage", "Camera Repair", "Speaker Repair"],
  },
  {
    key: "software",
    title: "Software Solutions",
    items: ["Phone Flashing", "Unlocking", "Virus Removal", "System Installation", "Data Recovery", "Setup & Backup"],
  },
] as const;

export const repairPrices = [
  { label: "Screen Replacement", price: "₦35,000" },
  { label: "Battery Replacement", price: "₦18,000" },
  { label: "Charging Port Repair", price: "₦12,000" },
  { label: "Water Damage Treatment", price: "₦25,000" },
  { label: "Camera Repair", price: "₦20,000" },
  { label: "Software / Flashing", price: "₦8,000" },
];

export const guarantees = ["Free diagnosis", "Genuine quality parts", "Warranty on repairs", "Fast turnaround"];

export const repairServiceOptions = [
  "Screen Replacement",
  "Battery Replacement",
  "Charging Port Repair",
  "Water Damage",
  "Camera Repair",
  "Phone Flashing",
  "Unlocking",
  "Virus Removal",
  "System Installation",
  "Data Recovery",
  "Other",
];

export const WHATSAPP_URL = "https://wa.me/2347062651594";
export const EMAIL = "peterolamide5453@gmail.com";
export const PHONE_TEL = "+2347062651594";
export const PHONE_DISPLAY = "+234 706 265 1594";
export const ADDRESS = "123 Tech Street, Lagos, Nigeria";
