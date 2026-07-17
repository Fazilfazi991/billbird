"use client";

import { MessageCircle } from "lucide-react";
import { brand } from "@/data/site";

export function FloatingWhatsApp() {
  return (
    <a
      href={brand.whatsapp}
      className="fixed bottom-5 right-5 z-40 flex min-h-12 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-[#1eb85a] md:bottom-6 md:right-6"
      aria-label="Chat with BillBirD on WhatsApp"
    >
      <MessageCircle size={19} />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
