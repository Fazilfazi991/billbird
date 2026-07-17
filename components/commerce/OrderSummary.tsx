"use client";

import Link from "next/link";
import { formatAed } from "@/data/products";
import { useCart } from "@/lib/cart-store";

export function OrderSummary({
  checkoutHref = "/checkout",
  showCheckoutButton = true,
}: {
  checkoutHref?: string;
  showCheckoutButton?: boolean;
}) {
  const { totals, items } = useCart();
  const customizedItems = items.filter((item) => item.coverCustomization?.enabled);

  const rows = [
    ["Frame subtotal", totals.subtotal],
    ["Lens charges", totals.lensCharges],
    ["Cover add-ons", totals.coverCharges],
    ["Discount", -totals.discount],
    ["Shipping", totals.shipping],
    ["VAT", totals.vat],
  ];

  return (
    <aside className="rounded-[10px] border border-ink/10 bg-white p-5 shadow-sm">
      <h2 className="font-serif text-2xl">Order Summary</h2>
      <div className="mt-5 space-y-3 text-sm">
        {customizedItems.length ? (
          <div className="mb-4 space-y-3 rounded-lg bg-ivory p-3">
            {customizedItems.map((item) => item.coverCustomization?.enabled ? (
              <div key={item.id} className="flex gap-3 text-xs leading-5 text-ink/62">
                {item.coverCustomization.photo?.originalFile?.previewUrl ? (
                  <img src={item.coverCustomization.photo.originalFile.previewUrl} alt="" className="size-12 rounded object-cover" />
                ) : null}
                <div>
                  <p className="font-semibold text-ink">{item.productName}</p>
                  <p>Cover Color: {item.coverCustomization.coverColorName}</p>
                  <p>Customization: {item.coverCustomization.type}</p>
                  {item.coverCustomization.engraving?.text ? <p>Engraving: &ldquo;{item.coverCustomization.engraving.text}&rdquo;</p> : null}
                  <p>Cover Add-on: {formatAed(item.coverCustomization.additionalPrice)}</p>
                </div>
              </div>
            ) : null)}
          </div>
        ) : null}
        {rows.map(([label, value]) => (
          <div key={label as string} className="flex justify-between gap-4">
            <span className="text-ink/60">{label}</span>
            <span className="font-medium">{Number(value) < 0 ? `- ${formatAed(Math.abs(Number(value)))}` : formatAed(Number(value))}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-between border-t border-ink/10 pt-4 text-lg font-bold">
        <span>Total</span>
        <span>{formatAed(totals.total)}</span>
      </div>
      <div className="mt-4 rounded-lg bg-ivory p-3 text-xs leading-relaxed text-ink/60">
        Free delivery applies above AED 500. VAT is calculated for the demo flow and can be connected to the backend later.
      </div>
      {showCheckoutButton ? (
        <Link
          href={items.length ? checkoutHref : "/products"}
          className="mt-5 flex min-h-12 items-center justify-center rounded-full bg-ink px-5 text-sm font-bold uppercase tracking-[0.14em] text-ivory transition hover:bg-leather"
        >
          {items.length ? "Proceed to Checkout" : "Continue Shopping"}
        </Link>
      ) : null}
    </aside>
  );
}
