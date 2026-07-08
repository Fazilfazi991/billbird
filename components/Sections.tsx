import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import { benefits, brand, collections, philosophy, products } from "@/data/site";

const imagePath = (index: number) =>
  `/images/billbird/billbird_placeholder_${String(index).padStart(2, "0")}.webp`;

function BrandImage({
  alt,
  src,
  className = "",
  imageClassName = "",
}: {
  alt: string;
  src: string;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-bone ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${imageClassName}`}
      />
    </div>
  );
}

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen overflow-hidden bg-ink text-ivory">
      <div className="absolute inset-0">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="BillBirD sunglasses cinematic product film"
        >
          <source src="/videos/billbird-hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/72 via-ink/32 to-ink/84" />
      </div>
      <div className="relative min-h-screen" aria-hidden="true" />
    </section>
  );
}

export function IntroStatement() {
  return (
    <section id="intro" className="bg-ivory py-20 text-center">
      <div className="section-shell max-w-4xl">
        <p className="eyebrow mb-4">Handmade Modern Luxury</p>
        <h2 className="display-title text-4xl md:text-6xl">
          BillBirD is a modern eyewear brand redefining optical fashion for a new generation.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-charcoal/70">
          Crafted with premium acetate materials, refined finishing, and timeless luxury detailing.
        </p>
      </div>
    </section>
  );
}

export function CollectionCards() {
  return (
    <section id="collection" className="bg-bone py-20">
      <div className="section-shell">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-3">Collection</p>
            <h2 className="display-title text-5xl">Featured Frames</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-charcoal/68">
            Premium optical styling, sunglasses-inspired silhouettes, and personalized accessories.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {collections.map((item, index) => (
            <article key={item.title} className="group bg-ivory">
              <BrandImage
                src={imagePath([7, 6, 4][index])}
                alt={`${item.title} by BillBirD`}
                className="aspect-[4/5]"
                imageClassName="group-hover:scale-105"
              />
              <div className="p-6">
                <h3 className="font-serif text-3xl">{item.title}</h3>
                <p className="mt-3 min-h-14 text-sm leading-6 text-charcoal/68">{item.description}</p>
                <a href={brand.whatsapp} className="mt-5 inline-flex items-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[0.14em]">
                  Explore <ArrowUpRight size={15} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutSection() {
  return (
    <section id="about" className="bg-ivory py-20">
      <div className="section-shell grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <BrandImage
          src={imagePath(2)}
          alt="BillBirD optical frame lifestyle portrait"
          className="aspect-[5/4]"
          imageClassName="object-[62%_center]"
        />
        <div className="bg-ivory/86 p-8 shadow-soft md:p-12">
          <p className="eyebrow mb-4">About BillBirD</p>
          <h2 className="display-title text-5xl">Created for confidence and individuality.</h2>
          <p className="mt-6 leading-8 text-charcoal/72">
            BillBirD creates stylish, comfortable, premium-quality spectacles that combine
            contemporary design with everyday functionality. Each frame is shaped around
            high-quality acetate materials, comfort, durability, and a timeless finish.
          </p>
        </div>
      </div>
    </section>
  );
}

export function VisionMissionSection() {
  return (
    <section className="bg-charcoal py-20 text-ivory">
      <div className="section-shell grid gap-5 lg:grid-cols-2">
        {[
          ["Vision", "At BillBirD, our vision is to become a globally recognized leader in luxury eyewear, setting new standards through exceptional craftsmanship, innovative design, and uncompromising quality."],
          ["Mission", "At BillBirD, our mission is to redefine modern eyewear by creating a globally trusted brand that represents luxury, innovation, and timeless sophistication."],
        ].map(([title, body]) => (
          <article key={title} className="bg-ivory text-ink">
            <BrandImage
              src={title === "Vision" ? imagePath(9) : imagePath(8)}
              alt={`BillBirD ${title.toLowerCase()} eyewear campaign`}
              className="aspect-[16/9]"
            />
            <div className="border-t border-ink/10 p-7 md:p-10">
              <p className="eyebrow mb-4">{title}</p>
              <p className="max-w-xl font-serif text-3xl leading-[1.25] md:text-4xl">{body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function WhyChooseUs() {
  return (
    <section className="bg-ivory py-20">
      <div className="section-shell">
        <p className="eyebrow mb-3 text-center">Why Choose Us</p>
        <h2 className="display-title text-center text-5xl">Why Choose BillBirD?</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item) => (
            <article key={item.title} className="border border-ink/10 bg-bone/45 p-6">
              <h3 className="font-serif text-2xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-charcoal/68">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SignatureSection() {
  return (
    <section id="signature" className="grid bg-ink text-ivory lg:grid-cols-2">
      <BrandImage
        src={imagePath(3)}
        alt="Close-up of BillBirD amber luxury eyewear"
        className="min-h-[520px]"
        imageClassName="object-[58%_center]"
      />
      <div className="flex items-center p-8 md:p-14 lg:p-20">
        <div>
          <p className="eyebrow mb-4 text-gold">Signature Luxury Appearance</p>
          <h2 className="display-title text-5xl">A bold statement of modern luxury.</h2>
          <p className="mt-6 leading-8 text-ivory/72">
            Every BillBirD frame is created to deliver a bold statement of style, confidence,
            and modern luxury.
          </p>
          <ul className="mt-8 grid gap-3 text-sm text-ivory/78">
            {["Bold and luxurious presence", "Modern fashion-forward styling", "Elegant and sophisticated aesthetics", "Premium visual appeal and finishing", "Comfortable everyday wear"].map((item) => (
              <li key={item} className="border-b border-ivory/12 pb-3">{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function CustomizationSection() {
  return (
    <section id="customization" className="bg-bone py-20">
      <div className="section-shell grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="eyebrow mb-4">Bespoke Fit</p>
          <h2 className="display-title text-5xl">Make your own pair with bespoke fit.</h2>
          <p className="mt-6 leading-8 text-charcoal/72">
            Personalize your eyewear case with names, numbers, personal photos, artwork,
            patterns, and unique luxury-inspired details.
          </p>
          <a href={brand.whatsapp} className="btn-dark mt-8">Start Customization</a>
        </div>
        <BrandImage
          src={imagePath(10)}
          alt="BillBirD custom spectacle cover and eyewear"
          className="aspect-[16/10]"
        />
      </div>
    </section>
  );
}

export function ProductGrid() {
  return (
    <section className="bg-ivory py-20">
      <div className="section-shell">
        <p className="eyebrow mb-3 text-center">Product Showcase</p>
        <h2 className="display-title text-center text-5xl">The Atelier Selection</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(([name, category], index) => (
            <article key={name} className="group bg-bone/45 p-3">
              <BrandImage
                src={imagePath([7, 5, 3, 4, 8, 10][index])}
                alt={`${name} ${category} eyewear`}
                className="aspect-square"
                imageClassName="group-hover:scale-105"
              />
              <div className="p-4 text-center">
                <h3 className="font-serif text-2xl">{name}</h3>
                <p className="mt-1 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-leather">{category}</p>
                <a href={brand.whatsapp} className="btn-dark mt-4 min-h-9 px-5">Enquire</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PhilosophySection() {
  return (
    <section className="bg-bone py-20">
      <div className="section-shell">
        <p className="eyebrow mb-3 text-center">Our Philosophy</p>
        <h2 className="display-title text-center text-5xl">Style with substance.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {philosophy.map(([title, body], index) => (
            <article key={title} className="bg-ivory">
              <BrandImage
                src={imagePath([6, 1, 5, 10][index])}
                alt={`BillBirD ${title.toLowerCase()} eyewear detail`}
                className="aspect-[4/3]"
              />
              <div className="p-5">
                <h3 className="font-serif text-2xl">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-charcoal/68">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CraftsmanshipSection() {
  return (
    <section className="bg-ivory py-20">
      <div className="section-shell grid gap-4 md:grid-cols-3">
        {["Designed for Modern Luxury", "Crafted with Precision", "Made for Individuality"].map((title) => (
          <article key={title} className="border-t border-ink/15 pt-6">
            <h3 className="font-serif text-3xl">{title}</h3>
            <p className="mt-4 text-sm leading-7 text-charcoal/68">
              A refined BillBirD experience shaped around premium materials, thoughtful
              detailing, and expressive personal style.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section id="contact" className="relative overflow-hidden bg-ink py-24 text-ivory">
      <BrandImage
        src={imagePath(5)}
        alt="BillBirD eyewear and luxury case"
        className="absolute inset-0 h-full opacity-38"
        imageClassName="scale-105"
      />
      <div className="section-shell relative max-w-4xl text-center">
        <p className="eyebrow mb-4 text-gold">Contact BillBirD</p>
        <h2 className="display-title text-5xl md:text-6xl">Begin your eyewear conversation.</h2>
        <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-sm text-ivory/78 sm:grid-cols-2">
          <p>Phone / WhatsApp: {brand.phone}</p>
          <p>Website: {brand.website}</p>
          <p>Email: {brand.email}</p>
          <p>Instagram: {brand.instagram}</p>
          <p>LinkedIn: {brand.linkedIn}</p>
          <p>YouTube: {brand.youtube}</p>
        </div>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={brand.whatsapp} className="btn-primary"><MessageCircle size={16} /> WhatsApp Us</a>
          <a href={`mailto:${brand.email}`} className="btn-secondary"><Mail size={16} /> Email Us</a>
          <a href="#" className="btn-secondary">Visit Instagram</a>
        </div>
      </div>
    </section>
  );
}
