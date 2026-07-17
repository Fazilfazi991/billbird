"use client";

import Link from "next/link";
import { CartItemCard } from "@/components/commerce/CartItemCard";
import { OrderSummary } from "@/components/commerce/OrderSummary";
import { useCart } from "@/lib/cart-store";

export function CartPageContent() {
  const { items } = useCart();

  return (
    <main className="bg-ivory pb-20 pt-24 text-ink md:pt-28">
      <section className="section-shell">
        <p className="eyebrow">Cart</p>
        <h1 className="display-title mt-2 text-4xl md:text-6xl">Your selections</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {items.length ? items.map((item) => <CartItemCard key={item.id} item={item} />) : <EmptyCart />}
          </div>
          <OrderSummary />
        </div>
      </section>
    </main>
  );
}

function EmptyCart() {
  return (
    <div className="rounded-[10px] border border-ink/10 bg-white p-10 text-center">
      <h2 className="font-serif text-3xl">Your cart is empty</h2>
      <p className="mt-2 text-ink/60">Start with a frame, then add lenses when needed.</p>
      <Link href="/products" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-6 text-sm font-bold uppercase tracking-[0.14em] text-ivory">
        Shop Products
      </Link>
    </div>
  );
}
