"use client";

import { Instagram, Menu, MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { brand, navLinks } from "@/data/site";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-ivory/94 text-ink shadow-sm backdrop-blur" : "text-ivory"
      }`}
    >
      <nav className="section-shell flex h-16 items-center justify-between gap-4 md:h-20 md:gap-5">
        <a href="#home" className="flex items-center gap-3" aria-label="BillBirD home">
          <img
            src="/billbird-logo-transparent.webp"
            alt="BillBirD"
            className="h-9 w-auto md:h-12"
          />
        </a>

        <div className="hidden items-center gap-7 text-[0.72rem] font-bold uppercase tracking-[0.14em] lg:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-gold">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a href="#" aria-label="Instagram" className="rounded-full border border-current/20 p-2">
            <Instagram size={17} />
          </a>
          <a href={brand.whatsapp} className={scrolled ? "btn-dark" : "btn-primary"}>
            <MessageCircle size={16} />
            Enquire
          </a>
        </div>

        <button
          className="grid size-10 place-items-center rounded-full border border-current/25 lg:hidden"
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
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
          </div>
          <a href={brand.whatsapp} className="btn-dark mt-auto">
            WhatsApp / Enquire
          </a>
        </div>
      </div>
    </header>
  );
}
