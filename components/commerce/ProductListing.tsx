"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { products } from "@/data/products";
import type { Product } from "@/types/commerce";
import { ProductCard } from "./ProductCard";

type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "best" | "rating";

const filterOptions = {
  category: ["sunglasses", "eyeglasses"],
  gender: ["men", "women", "kids", "unisex"],
  shape: ["Square", "Rectangle", "Oversized", "Navigator", "Round square"],
  material: ["Premium acetate", "Acetate", "Hand-finished acetate", "Crystal acetate", "Flexible acetate", "Layered acetate"],
  size: ["S", "M", "L"],
};

function title(value: string) {
  return value
    .replace("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function filterProducts(mode: string | undefined, selected: Record<string, string[]>, sort: SortKey, priceMax: number) {
  let next = products.filter((product) => {
    const routeMatch =
      !mode ||
      product.category === mode ||
      product.gender === mode ||
      (mode === "products" ? true : product.slug === mode);

    if (!routeMatch || product.price > priceMax) return false;
    if (selected.category.length && !selected.category.includes(product.category)) return false;
    if (selected.gender.length && !selected.gender.includes(product.gender)) return false;
    if (selected.shape.length && !selected.shape.includes(product.shape)) return false;
    if (selected.material.length && !selected.material.includes(product.material)) return false;
    if (selected.size.length && !product.sizes.some((size) => selected.size.includes(size))) return false;
    return true;
  });

  next = [...next].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "newest") return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
    if (sort === "best") return Number(Boolean(b.bestSeller)) - Number(Boolean(a.bestSeller));
    if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    return Number(Boolean(b.bestSeller)) - Number(Boolean(a.bestSeller));
  });

  return next;
}

function FilterGroup({
  label,
  name,
  options,
  selected,
  toggle,
}: {
  label: string;
  name: string;
  options: string[];
  selected: string[];
  toggle: (name: string, value: string) => void;
}) {
  return (
    <fieldset className="border-b border-ink/10 pb-5">
      <legend className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-leather">{label}</legend>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => toggle(name, option)}
              className="size-4 accent-ink"
            />
            <span>{title(option)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ProductListing({ mode }: { mode?: string }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");
  const [priceMax, setPriceMax] = useState(750);
  const [selected, setSelected] = useState<Record<string, string[]>>({
    category: [],
    gender: [],
    shape: [],
    material: [],
    size: [],
  });

  const visibleProducts = useMemo(
    () => filterProducts(mode, selected, sort, priceMax),
    [mode, priceMax, selected, sort],
  );

  const chips = Object.entries(selected).flatMap(([key, values]) =>
    values.map((value) => ({ key, value })),
  );

  const pageTitle = mode && mode !== "products" ? title(mode) : "Eyewear Collection";

  const toggle = (name: string, value: string) => {
    setSelected((current) => ({
      ...current,
      [name]: current[name].includes(value)
        ? current[name].filter((item) => item !== value)
        : [...current[name], value],
    }));
  };

  const filters = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl">Filters</h2>
        <button
          onClick={() => {
            setSelected({ category: [], gender: [], shape: [], material: [], size: [] });
            setPriceMax(750);
          }}
          className="text-xs font-bold uppercase tracking-[0.14em] text-leather"
        >
          Clear all
        </button>
      </div>
      <div className="border-b border-ink/10 pb-5">
        <label className="text-xs font-bold uppercase tracking-[0.16em] text-leather" htmlFor="price">
          Price up to AED {priceMax}
        </label>
        <input
          id="price"
          type="range"
          min="250"
          max="750"
          step="25"
          value={priceMax}
          onChange={(event) => setPriceMax(Number(event.target.value))}
          className="mt-4 w-full accent-ink"
        />
      </div>
      <FilterGroup label="Category" name="category" options={filterOptions.category} selected={selected.category} toggle={toggle} />
      <FilterGroup label="Gender" name="gender" options={filterOptions.gender} selected={selected.gender} toggle={toggle} />
      <FilterGroup label="Frame Shape" name="shape" options={filterOptions.shape} selected={selected.shape} toggle={toggle} />
      <FilterGroup label="Material" name="material" options={filterOptions.material} selected={selected.material} toggle={toggle} />
      <FilterGroup label="Size" name="size" options={filterOptions.size} selected={selected.size} toggle={toggle} />
    </div>
  );

  return (
    <main className="bg-ivory pb-24 pt-24 text-ink md:pt-28">
      <section className="section-shell">
        <nav className="text-xs uppercase tracking-[0.16em] text-ink/50" aria-label="Breadcrumb">
          Home / Products {mode && mode !== "products" ? `/ ${title(mode)}` : ""}
        </nav>
        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="eyebrow">BillBirD Shop</p>
            <h1 className="display-title mt-2 text-4xl md:text-6xl">{pageTitle}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/60 md:text-base">
              Premium optical frames and sunglasses with a guided lens and prescription flow.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex min-h-11 items-center gap-2 rounded-full border border-ink/15 px-4 text-sm font-semibold lg:hidden"
            >
              <SlidersHorizontal size={17} /> Filter
            </button>
            <label className="sr-only" htmlFor="sort">Sort products</label>
            <select
              id="sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="min-h-11 rounded-full border border-ink/15 bg-white px-4 text-sm"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="best">Best Selling</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink/60">{visibleProducts.length} products</span>
          {chips.map((chip) => (
            <button
              key={`${chip.key}-${chip.value}`}
              onClick={() => toggle(chip.key, chip.value)}
              className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white px-3 text-xs font-semibold"
            >
              {title(chip.value)} <X size={13} />
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden rounded-[10px] border border-ink/10 bg-white p-5 lg:block">
            {filters}
          </aside>
          {visibleProducts.length ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {visibleProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-[10px] border border-ink/10 bg-white p-10 text-center">
              <h2 className="font-serif text-3xl">No products found</h2>
              <p className="mt-2 text-ink/60">Try clearing filters or choosing another category.</p>
            </div>
          )}
        </div>
      </section>

      <div className={`fixed inset-0 z-[70] bg-ink/50 transition lg:hidden ${filtersOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <div className={`absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-[18px] bg-ivory p-5 transition ${filtersOpen ? "translate-y-0" : "translate-y-full"}`}>
          <button onClick={() => setFiltersOpen(false)} className="ms-auto grid size-11 place-items-center rounded-full border border-ink/15" aria-label="Close filters">
            <X size={20} />
          </button>
          {filters}
          <button onClick={() => setFiltersOpen(false)} className="mt-6 flex min-h-12 w-full items-center justify-center rounded-full bg-ink text-sm font-bold uppercase tracking-[0.14em] text-ivory">
            Show {visibleProducts.length} Products
          </button>
        </div>
      </div>
    </main>
  );
}
