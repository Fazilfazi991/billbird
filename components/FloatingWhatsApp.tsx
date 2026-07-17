"use client";

import { brand } from "@/data/site";

export function FloatingWhatsApp() {
  return (
    <a
      href={brand.whatsapp}
      className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full shadow-soft transition hover:-translate-y-0.5 hover:scale-105 md:bottom-6 md:right-6 md:size-16"
      aria-label="Chat with BillBirD on WhatsApp"
    >
      <img
        src="/whatsapp-floating.png"
        alt=""
        className="h-full w-full rounded-full object-contain"
        aria-hidden="true"
      />
    </a>
  );
}
