"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatAed } from "@/data/products";
import { useCart } from "@/lib/cart-store";
import type { CartItem } from "@/types/commerce";

function prescriptionStatus(item: CartItem) {
  const method = item.lensSelection?.prescription.method;
  if (method === "submit-later") return "Prescription pending - our team will contact you after checkout.";
  if (method === "upload") return "Prescription uploaded";
  if (method === "manual") return "Prescription added";
  return "Prescription not required";
}

export function CartItemCard({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <article className="grid gap-4 rounded-[10px] border border-ink/10 bg-white p-4 shadow-sm sm:grid-cols-[150px_1fr]">
      <img src={item.productImage} alt={item.productName} className="aspect-square w-full rounded-lg object-cover sm:w-[150px]" />
      <div className="min-w-0">
        <div className="flex gap-4">
          <div className="min-w-0 flex-1">
            <Link href={`/products/${item.productSlug}`} className="font-serif text-2xl leading-tight">
              {item.productName}
            </Link>
            <p className="mt-2 text-sm text-ink/60">{item.frameColor} / {item.frameSize}</p>
            <p className="mt-1 text-sm text-ink/60">
              {item.lensSelection?.powerType === "with-power" ? "With Power" : "Without Power"} / {item.lensSelection?.lensPackageName}
            </p>
            <p className="mt-2 rounded-lg bg-ivory p-2 text-xs text-ink/60">{prescriptionStatus(item)}</p>
          </div>
          <button onClick={() => removeItem(item.id)} className="grid size-10 place-items-center rounded-full border border-ink/10 text-ink/60" aria-label="Remove item">
            <Trash2 size={17} />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center rounded-full border border-ink/10">
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="grid size-10 place-items-center" aria-label="Decrease quantity">
              <Minus size={15} />
            </button>
            <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="grid size-10 place-items-center" aria-label="Increase quantity">
              <Plus size={15} />
            </button>
          </div>
          <div className="text-end">
            <p className="text-xs text-ink/50">Item total</p>
            <p className="font-bold">{formatAed(item.totalPrice)}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.12em] text-leather">
          <Link href={`/products/${item.productSlug}`}>Edit lenses</Link>
          <button>Save for later</button>
        </div>
      </div>
    </article>
  );
}
