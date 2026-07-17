"use client";

import { Instagram, Menu, MessageCircle, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { brand, navLinks } from "@/data/site";
import { useCart } from "@/lib/cart-store";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totals, hydrated } = useCart();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const solidNav = scrolled || !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solidNav ? "bg-ivory/94 text-ink shadow-sm backdrop-blur" : "text-ivory"
      }`}
    >
      <nav className="section-shell flex h-20 items-center justify-between gap-4 pt-2 md:h-24 md:gap-6 md:pt-3">
        <Link href="/#home" className="flex items-center gap-3" aria-label="BillBirD home">
          <img
            src="/billbird-logo-transparent.webp"
            alt="BillBirD"
            className="h-11 w-auto md:h-14"
          />
        </Link>

        <div className="hidden items-center gap-8 text-[0.78rem] font-bold uppercase tracking-[0.16em] lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-gold">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3.5 lg:flex">
          <Link href="/cart" aria-label="Cart" className="relative rounded-full border border-current/20 p-2.5">
            <ShoppingBag size={18} />
            {hydrated && totals.quantity ? (
              <span className="absolute -end-1 -top-1 grid size-5 place-items-center rounded-full bg-gold text-[0.65rem] font-bold text-ink">
                {totals.quantity}
              </span>
            ) : null}
          </Link>
          <a href="#" aria-label="Instagram" className="rounded-full border border-current/20 p-2.5">
            <Instagram size={18} />
          </a>
          <a href={brand.whatsapp} className={solidNav ? "btn-dark" : "btn-primary"}>
            <MessageCircle size={18} />
            Enquire
          </a>
        </div>

        <button
          className="grid size-11 place-items-center rounded-full border border-current/25 lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </nav>

      <div
        className={`fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm transition lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`ml-auto flex h-full w-[min(86vw,380px)] flex-col bg-ivory p-7 text-ink transition duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button className="ml-auto" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={25} />
          </button>
          <div className="mt-10 flex flex-col gap-6 font-serif text-3xl">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/cart" onClick={() => setOpen(false)}>
              Cart {hydrated && totals.quantity ? `(${totals.quantity})` : ""}
            </Link>
          </div>
          <a href={brand.whatsapp} className="btn-dark mt-auto">
            WhatsApp / Enquire
          </a>
        </div>
      </div>
    </header>
  );
}
