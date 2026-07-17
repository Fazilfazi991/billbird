import {
  AboutSection,
  CollectionCards,
  ContactSection,
  CraftsmanshipSection,
  CustomizationSection,
  Hero,
  IntroStatement,
  PhilosophySection,
  ProductGrid,
  SignatureSection,
  VisionMissionSection,
  WhyChooseUs,
} from "@/components/Sections";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <IntroStatement />
        <CollectionCards />
        <AboutSection />
        <ProductGrid />
        <VisionMissionSection />
        <WhyChooseUs />
        <SignatureSection />
        <CustomizationSection />
        <PhilosophySection />
        <CraftsmanshipSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
