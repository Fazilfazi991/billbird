"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types/commerce";
import { PriceDisplay } from "./PriceDisplay";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group min-w-0 overflow-hidden rounded-[10px] border border-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-bone">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:opacity-0"
          />
          <img
            src={product.images[1] ?? product.images[0]}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
          />
          {product.originalPrice ? (
            <span className="absolute start-2 top-2 rounded-full bg-ink px-2 py-1 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-ivory">
              Offer
            </span>
          ) : null}
        </div>
      </Link>

      <div className="space-y-3 p-3 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/products/${product.slug}`} className="min-w-0">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-leather">
              {product.frameType}
            </p>
            <h3 className="mt-1 line-clamp-2 font-serif text-lg leading-tight text-ink md:text-xl">
              {product.name}
            </h3>
          </Link>
          <button
            className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/10 text-ink transition hover:border-leather hover:text-leather"
            aria-label={`Add ${product.name} to wishlist`}
          >
            <Heart size={17} />
          </button>
        </div>

        <PriceDisplay price={product.price} originalPrice={product.originalPrice} />

        <div className="flex items-center gap-1.5" aria-label="Available frame colors">
          {product.colors.slice(0, 4).map((color) => (
            <span
              key={color.name}
              className="size-4 rounded-full border border-ink/15"
              style={{ background: color.value }}
              title={color.name}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink/60">
          <span>{product.prescriptionAvailable ? "Prescription available" : "Non-prescription"}</span>
          {product.rating ? <span>{product.rating.toFixed(1)} / 5</span> : null}
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="flex min-h-11 items-center justify-center rounded-full bg-ink px-4 text-center text-xs font-bold uppercase tracking-[0.14em] text-ivory transition hover:bg-leather"
        >
          View Product
        </Link>
      </div>
    </article>
  );
}
