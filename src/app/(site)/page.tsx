import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Divider } from "@/components/ui/Divider";
import { KineticGrid } from "@/components/effects/KineticGrid";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { Services } from "@/components/sections/Services";
import { Industries } from "@/components/sections/Industries";
import { Process } from "@/components/sections/Process";
import { Proof } from "@/components/sections/Proof";
import { Testimonials } from "@/components/sections/Testimonials";
import { WhyScalwise } from "@/components/sections/WhyScalwise";
import { PricingSection } from "@/components/sections/PricingSection";
import { CustomQuoteSection } from "@/components/sections/CustomQuoteSection";
import { FAQ } from "@/components/sections/FAQ";
import { ContactSection } from "@/components/sections/ContactSection";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <KineticGrid className="z-0" />
      <Header />
      <div className="relative z-10 flex flex-1 flex-col">
        <main className="flex-1">
          <Hero />
          <TrustStrip />
          <Services />
          <Industries />
          <Process />
          <Divider />
          <Proof />
          <Testimonials />
          <WhyScalwise />
          <PricingSection />
          <CustomQuoteSection />
          <Divider flip />
          <FAQ />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
