"use client";

import { Heart, PackageCheck, Ruler, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatAed, products } from "@/data/products";
import { useCart } from "@/lib/cart-store";
import type { LensSelection, Product } from "@/types/commerce";
import { LensSelectionModal } from "./LensSelectionModal";
import { PriceDisplay } from "./PriceDisplay";
import { ProductCard } from "./ProductCard";

export function ProductDetailView({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState(product.sizes[0]);
  const [lensOpen, setLensOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const frameColor = product.colors[0]?.name ?? "Default";

  const related = useMemo(
    () => products.filter((item) => item.id !== product.id && (item.category === product.category || item.gender === product.gender)).slice(0, 3),
    [product],
  );

  function addWithoutPower() {
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productImage: product.images[imageIndex] ?? product.images[0],
      frameColor,
      frameSize: size,
      quantity: 1,
      framePrice: product.price,
      totalPrice: product.price,
      lensSelection: {
        powerType: "without-power",
        lensPackageId: "standard-included",
        lensPackageName: "Standard Included Lens",
        lensPrice: 0,
        prescription: { method: "not-required" },
      },
    });
    setNotice("Added to cart without power.");
  }

  function addWithLens(selection: LensSelection) {
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productImage: product.images[imageIndex] ?? product.images[0],
      frameColor,
      frameSize: size,
      quantity: 1,
      framePrice: product.price,
      totalPrice: product.price + selection.lensPrice,
      lensSelection: selection,
    });
    setLensOpen(false);
    setNotice("Lens selection added to cart.");
  }

  return (
    <main className="bg-ivory pb-28 pt-24 text-ink md:pt-28">
      <section className="section-shell">
        <nav className="text-xs uppercase tracking-[0.16em] text-ink/50" aria-label="Breadcrumb">
          <Link href="/products">Products</Link> / {product.name}
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)]">
          <div>
            <div className="overflow-hidden rounded-[12px] bg-bone">
              <img src={product.images[imageIndex] ?? product.images[0]} alt={product.name} className="aspect-[4/5] w-full object-cover md:aspect-[5/4]" />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setImageIndex(index)}
                  className={`overflow-hidden rounded-lg border ${imageIndex === index ? "border-ink" : "border-transparent"}`}
                  aria-label={`Show product image ${index + 1}`}
                >
                  <img src={image} alt="" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">{product.frameType}</p>
            <h1 className="display-title mt-2 text-4xl leading-none md:text-6xl">{product.name}</h1>
            <div className="mt-4">
              <PriceDisplay price={product.price} originalPrice={product.originalPrice} className="text-lg" />
              <p className="mt-2 text-sm text-ink/55">VAT calculated at checkout. SKU {product.sku}</p>
            </div>
            {product.rating ? <p className="mt-4 text-sm font-semibold">{product.rating.toFixed(1)} / 5 customer rating</p> : null}

            <div className="mt-7 space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-leather">Frame size</p>
                <div className="mt-3 flex gap-2">
                  {product.sizes.map((item) => (
                    <button
                      key={item}
                      onClick={() => setSize(item)}
                      className={`min-h-11 min-w-14 rounded-full border px-4 font-semibold ${size === item ? "border-ink bg-ink text-ivory" : "border-ink/15 bg-white"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button onClick={addWithoutPower} className="min-h-12 rounded-full border border-ink/20 bg-white px-5 text-sm font-bold uppercase tracking-[0.14em]">
                Buy Without Power
              </button>
              <button onClick={() => setLensOpen(true)} className="min-h-12 rounded-full bg-ink px-5 text-sm font-bold uppercase tracking-[0.14em] text-ivory">
                Select Lenses
              </button>
            </div>
            <button className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-ink/15 bg-white text-sm font-bold uppercase tracking-[0.14em]">
              <Heart size={17} /> Wishlist
            </button>
            {notice ? (
              <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">
                <span>{notice}</span>
                <Link href="/cart" className="font-bold underline">View Cart</Link>
              </div>
            ) : null}

            <div className="mt-7 grid gap-3 text-sm text-ink/65 sm:grid-cols-2">
              {[
                [Truck, "UAE delivery", "Standard and express options"],
                [ShieldCheck, "Warranty", "One-year frame warranty"],
                [PackageCheck, "Included", "Luxury case and cleaning cloth"],
                [Ruler, "Dimensions", `${product.dimensions.lensWidth}-${product.dimensions.bridgeWidth}-${product.dimensions.templeLength} mm`],
              ].map(([Icon, title, text]) => (
                <div key={String(title)} className="rounded-lg border border-ink/10 bg-white p-4">
                  <Icon className="text-leather" size={20} />
                  <p className="mt-3 font-semibold text-ink">{String(title)}</p>
                  <p className="mt-1">{String(text)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {[
            ["Product Details", `${product.material}, ${product.shape} shape, ${product.gender} fit, ${product.dimensions.weight}.`],
            ["Size Guide", `Lens ${product.dimensions.lensWidth} mm, bridge ${product.dimensions.bridgeWidth} mm, temple ${product.dimensions.templeLength} mm.`],
            ["Delivery and Returns", "Delivery estimate is shown in checkout. Returns can be connected to policy rules later."],
            ["Care Instructions", "Use the included cloth and avoid high heat, abrasive surfaces, and harsh chemicals."],
          ].map(([title, text]) => (
            <details key={title} className="rounded-[10px] border border-ink/10 bg-white p-5">
              <summary className="cursor-pointer font-serif text-2xl">{title}</summary>
              <p className="mt-3 text-sm leading-7 text-ink/60">{text}</p>
            </details>
          ))}
        </div>

        <section className="mt-16">
          <p className="eyebrow">Related Frames</p>
          <h2 className="display-title mt-2 text-4xl">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
            {related.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-ivory/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink/55">From</p>
            <p className="font-bold">{formatAed(product.price)}</p>
          </div>
          <button onClick={() => setLensOpen(true)} className="min-h-12 rounded-full bg-ink px-5 text-xs font-bold uppercase tracking-[0.14em] text-ivory">
            Select Lenses
          </button>
        </div>
      </div>

      {lensOpen ? (
        <LensSelectionModal
          product={product}
          frameColor={frameColor}
          frameSize={size}
          onClose={() => setLensOpen(false)}
          onComplete={addWithLens}
        />
      ) : null}
    </main>
  );
}
