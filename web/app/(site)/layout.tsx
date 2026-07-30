import { CartProvider } from "@/lib/cart-context";
import { QuickViewProvider } from "@/lib/quickview-context";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ChatWidget from "@/components/chat/ChatWidget";
import CursorGlow from "@/components/CursorGlow";

// Customer-facing chrome. The /admin section has its own layout without
// the store navigation, cart, or chat widget.
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <CartProvider>
      <QuickViewProvider>
        <Nav />
        {children}
        <Footer />
        <CartDrawer />
        <ChatWidget />
        <CursorGlow />
      </QuickViewProvider>
    </CartProvider>
  );
}
