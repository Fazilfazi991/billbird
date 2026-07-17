import {
  Clock,
  Globe2,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Youtube,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { brand } from "@/data/site";

const contactCards = [
  {
    label: "Phone / WhatsApp",
    value: brand.phone,
    detail: "Quick enquiries, appointments, and product support.",
    href: brand.whatsapp,
    Icon: Phone,
  },
  {
    label: "Email",
    value: brand.email,
    detail: "For partnerships, custom orders, and order support.",
    href: `mailto:${brand.email}`,
    Icon: Mail,
  },
  {
    label: "Instagram",
    value: brand.instagram,
    detail: "Follow new frames, styling drops, and behind-the-scenes.",
    href: `https://instagram.com/${brand.instagram}`,
    Icon: Instagram,
  },
  {
    label: "Website",
    value: brand.website,
    detail: "Official BillBirD brand and product destination.",
    href: `https://${brand.website}`,
    Icon: Globe2,
  },
  {
    label: "LinkedIn",
    value: brand.linkedIn,
    detail: "Brand updates and business enquiries.",
    href: "#",
    Icon: Linkedin,
  },
  {
    label: "YouTube",
    value: brand.youtube,
    detail: "Campaign films and product stories.",
    href: "#",
    Icon: Youtube,
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="bg-ivory pb-20 pt-28 text-ink md:pt-36">
        <section className="section-shell">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="eyebrow mb-4">Contact BillBirD</p>
              <h1 className="display-title text-5xl leading-none md:text-7xl">
                Begin your eyewear conversation.
              </h1>
            </div>
            <p className="max-w-2xl text-base leading-8 text-charcoal/70">
              Speak with BillBirD for product enquiries, prescription lens support,
              custom spectacle covers, collaborations, and appointment guidance in Dubai.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contactCards.map(({ label, value, detail, href, Icon }) => (
              <a
                key={label}
                href={href}
                className="group rounded-[10px] border border-ink/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gold/55 hover:shadow-soft"
              >
                <span className="grid size-12 place-items-center rounded-full bg-bone text-leather transition group-hover:bg-gold/20">
                  <Icon size={21} />
                </span>
                <p className="mt-5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-leather">
                  {label}
                </p>
                <p className="mt-2 font-serif text-2xl leading-tight">{value}</p>
                <p className="mt-3 text-sm leading-6 text-charcoal/62">{detail}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="section-shell mt-14 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[10px] bg-ink p-6 text-ivory md:p-8">
            <p className="eyebrow mb-4 text-gold">Visit / Locate</p>
            <h2 className="font-serif text-4xl leading-tight">BillBirD in Dubai</h2>
            <div className="mt-6 space-y-5 text-sm leading-7 text-ivory/72">
              <p className="flex gap-3">
                <MapPin className="mt-1 shrink-0 text-gold" size={19} />
                <span>{brand.address}</span>
              </p>
              <p className="flex gap-3">
                <Clock className="mt-1 shrink-0 text-gold" size={19} />
                <span>Appointments and consultations can be coordinated on WhatsApp.</span>
              </p>
              <p className="flex gap-3">
                <MessageCircle className="mt-1 shrink-0 text-gold" size={19} />
                <span>For fastest response, send your frame or lens query directly to WhatsApp.</span>
              </p>
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href={brand.whatsapp} className="btn-primary">
                <MessageCircle size={16} /> WhatsApp Us
              </a>
              <a href={brand.mapUrl} className="btn-secondary" target="_blank" rel="noreferrer">
                <MapPin size={16} /> Open Map
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-[10px] border border-ink/10 bg-white shadow-sm">
            <iframe
              src={brand.mapEmbedUrl}
              title="BillBirD location map in Al Karama, Dubai"
              className="h-[420px] w-full border-0 md:h-[520px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
