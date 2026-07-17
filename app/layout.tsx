import type { Metadata } from "next";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { ScrollAnimations } from "@/components/ScrollAnimations";
import { CartProvider } from "@/lib/cart-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "BillBirD | Premium Optical & Eyewear Brand",
  description:
    "Luxury eyewear crafted for confidence, individuality, and refined everyday style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <ScrollAnimations />
          {children}
          <FloatingWhatsApp />
        </CartProvider>
      </body>
    </html>
  );
}
