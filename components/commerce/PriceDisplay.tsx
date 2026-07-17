import { formatAed } from "@/data/products";

export function PriceDisplay({
  price,
  originalPrice,
  className = "",
}: {
  price: number;
  originalPrice?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-baseline gap-2 ${className}`}>
      <span className="font-semibold text-ink">{formatAed(price)}</span>
      {originalPrice ? (
        <>
          <span className="text-sm text-ink/40 line-through">{formatAed(originalPrice)}</span>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
            Save {formatAed(originalPrice - price)}
          </span>
        </>
      ) : null}
    </div>
  );
}
