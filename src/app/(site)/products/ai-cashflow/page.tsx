import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { KineticGrid } from "@/components/effects/KineticGrid";
import { getPayloadClient } from "@/lib/payload";
import { AI_CASHFLOW_SLUG } from "@/lib/content/ai-cashflow";
import { AnnouncementStrip } from "@/components/sections/ai-cashflow/AnnouncementStrip";
import { CashflowHero } from "@/components/sections/ai-cashflow/CashflowHero";
import { ProblemSection } from "@/components/sections/ai-cashflow/ProblemSection";
import { SolutionSection } from "@/components/sections/ai-cashflow/SolutionSection";
import { ValueStack } from "@/components/sections/ai-cashflow/ValueStack";
import { IncomeModels } from "@/components/sections/ai-cashflow/IncomeModels";
import { ContentEngine } from "@/components/sections/ai-cashflow/ContentEngine";
import { ThirtyDayPlan } from "@/components/sections/ai-cashflow/ThirtyDayPlan";
import { ProductPreview } from "@/components/sections/ai-cashflow/ProductPreview";
import { WhoItsFor } from "@/components/sections/ai-cashflow/WhoItsFor";
import { WhatsIncluded } from "@/components/sections/ai-cashflow/WhatsIncluded";
import { ObjectionHandling } from "@/components/sections/ai-cashflow/ObjectionHandling";
import { CashflowFAQ } from "@/components/sections/ai-cashflow/CashflowFAQ";
import { FinalCTA } from "@/components/sections/ai-cashflow/FinalCTA";
import { StickyMobileCTA } from "@/components/sections/ai-cashflow/StickyMobileCTA";
import { PageViewTracker } from "@/components/sections/ai-cashflow/PageViewTracker";

export const dynamic = "force-dynamic";

const PAGE_URL = "https://scalwise.online/products/ai-cashflow";

export const metadata: Metadata = {
  title: { absolute: "AI CASHFLOW | Build Your First Online Income Stream With AI" },
  description:
    "AI CASHFLOW is an 83-page practical playbook for beginners who want to build an online income stream using AI, content and social media, with a 30-day action plan and 100-prompt pack.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "AI CASHFLOW | Build Your First Online Income Stream With AI",
    description:
      "An 83-page practical playbook for beginners — AI, content and social media, with a 30-day action plan and 100-prompt pack.",
    url: PAGE_URL,
    images: ["/ai-cashflow/cover.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI CASHFLOW | Build Your First Online Income Stream With AI",
    description:
      "An 83-page practical playbook for beginners — AI, content and social media, with a 30-day action plan and 100-prompt pack.",
    images: ["/ai-cashflow/cover.png"],
  },
};

async function getProduct() {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "products",
    where: { slug: { equals: AI_CASHFLOW_SLUG } },
    limit: 1,
  });
  return docs[0] ?? null;
}

export default async function AiCashflowPage() {
  const product = await getProduct();

  const price = product?.price ?? null;
  const currency = product?.currency ?? "INR";
  const checkoutUrl = product?.checkoutUrl ?? null;
  const active = product?.status === "Available" && Boolean(checkoutUrl);
  const cover = product?.coverImage && typeof product.coverImage === "object" ? product.coverImage : null;

  return (
    <>
      <KineticGrid className="z-0" />
      <PageViewTracker event="ebook_product_view" />
      <Header />
      <div className="relative z-10 flex flex-1 flex-col pb-16 sm:pb-0">
        <main className="flex-1">
          <AnnouncementStrip />
          <CashflowHero
            price={price}
            currency={currency}
            checkoutUrl={checkoutUrl}
            active={active}
            coverUrl={cover?.url ?? "/ai-cashflow/cover.png"}
            coverAlt={cover?.alt ?? "AI Cashflow ebook cover"}
          />
          <ProblemSection />
          <SolutionSection />
          <ValueStack checkoutUrl={checkoutUrl} active={active} />
          <IncomeModels />
          <ContentEngine />
          <ThirtyDayPlan />
          <ProductPreview />
          <WhoItsFor />
          <WhatsIncluded price={price} currency={currency} checkoutUrl={checkoutUrl} active={active} />
          <ObjectionHandling />
          <CashflowFAQ />
          <FinalCTA checkoutUrl={checkoutUrl} active={active} />
        </main>
        <Footer />
      </div>
      <StickyMobileCTA price={price} currency={currency} checkoutUrl={checkoutUrl} active={active} />
    </>
  );
}
