import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
