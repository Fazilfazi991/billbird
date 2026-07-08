import { brand } from "@/data/site";

const columns = {
  Shop: ["Optical Frames", "Sunglasses", "Custom Covers", "New Collection"],
  Brand: ["About", "Vision", "Mission", "Signature Designs"],
  Support: ["Contact", "WhatsApp", "Instagram", "Email"],
};

export function Footer() {
  return (
    <footer className="bg-black py-14 text-ivory">
      <div className="section-shell">
        <div className="flex flex-col justify-between gap-8 border-b border-ivory/12 pb-10 md:flex-row">
          <div>
            <img
              src="/billbird-logo-transparent-large.webp"
              alt="BillBirD"
              className="h-20 w-auto"
            />
            <p className="mt-3 max-w-sm text-sm leading-7 text-ivory/58">{brand.tagline}</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {Object.entries(columns).map(([title, links]) => (
              <div key={title}>
                <h3 className="mb-4 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-gold">
                  {title}
                </h3>
                <div className="grid gap-2 text-sm text-ivory/62">
                  {links.map((link) => (
                    <a href="#contact" key={link} className="hover:text-ivory">
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="pt-7 text-center text-xs text-ivory/45">
          &copy; 2026 BillBirD. Premium Optical & Eyewear Brand. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
