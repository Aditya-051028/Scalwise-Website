import { getPayload } from "payload";
import config from "@payload-config";

async function seed() {
  console.log("[seed] initializing payload...");
  const payload = await getPayload({ config });
  console.log("[seed] payload initialized");

  const { totalDocs } = await payload.count({ collection: "services" });
  console.log("[seed] existing services:", totalDocs);
  if (totalDocs > 0) {
    console.log("Already seeded — skipping. Delete existing docs to reseed.");
    return;
  }

  const services = [
    {
      title: "Meta Ads",
      category: "Performance Marketing",
      shortDescription:
        "Facebook and Instagram campaigns built around your actual CAC target, not just impressions.",
    },
    {
      title: "Google Ads",
      category: "Performance Marketing",
      shortDescription: "Search and Shopping campaigns that catch people already looking to buy.",
    },
    {
      title: "SEO",
      category: "SEO & Local",
      shortDescription:
        "Rank for the searches your buyers actually type, not just traffic-volume keywords.",
    },
    {
      title: "Local SEO",
      category: "SEO & Local",
      shortDescription: "Google Business Profile and local-pack optimization for “near me” searches.",
    },
    {
      title: "Website Development",
      category: "Web & Landing Pages",
      shortDescription: "Fast, conversion-built sites — not just good-looking ones.",
    },
    {
      title: "Landing Pages",
      category: "Web & Landing Pages",
      shortDescription: "Single-purpose pages built to convert one specific offer.",
    },
    {
      title: "Content Marketing",
      category: "Content & Social",
      shortDescription: "Content that ranks and gets shared, tied to what you actually sell.",
    },
    {
      title: "Social Media Management",
      category: "Content & Social",
      shortDescription: "Consistent posting and community management that builds a real audience.",
    },
    {
      title: "Email Marketing",
      category: "Content & Social",
      shortDescription: "Lifecycle and campaign email that turns subscribers into repeat buyers.",
    },
    {
      title: "Conversion Rate Optimization",
      category: "Automation & CRO",
      shortDescription: "Turn more of your existing traffic into leads — before you spend more on ads.",
    },
    {
      title: "Marketing Automation",
      category: "Automation & CRO",
      shortDescription: "Follow-up sequences and lead routing that run without you.",
    },
    {
      title: "AI Automation",
      category: "Automation & CRO",
      shortDescription: "AI-powered workflows for lead qualification, reporting, and follow-up.",
    },
    {
      title: "Analytics",
      category: "Automation & CRO",
      shortDescription: "Dashboards that show CAC, ROAS, and CPL — not vanity metrics.",
    },
    {
      title: "Brand Strategy",
      category: "Brand & Strategy",
      shortDescription: "Positioning and messaging that makes the rest of this work harder.",
    },
  ] as const;

  for (const [i, s] of services.entries()) {
    await payload.create({
      collection: "services",
      data: { ...s, slug: s.title.toLowerCase().replace(/\s+/g, "-"), order: i },
    });
  }

  await payload.create({
    collection: "pricing",
    data: {
      planName: "Liftoff",
      tierLabel: "Get discovered",
      price: 14999,
      currency: "INR",
      billingPeriod: "Monthly",
      priceNote: "+ applicable taxes",
      features: [
        { label: "10 reels / month" },
        { label: "5 static creatives" },
        { label: "Captions" },
        { label: "Basic posting / content calendar" },
        { label: "Basic Instagram profile optimization" },
        { label: "Monthly performance summary" },
      ],
      popular: false,
      ctaLabel: "Get Started",
      order: 0,
    },
  });

  await payload.create({
    collection: "pricing",
    data: {
      planName: "Ascent",
      tierLabel: "Build momentum",
      price: 21999,
      currency: "INR",
      billingPeriod: "Monthly",
      priceNote: "+ applicable taxes",
      features: [
        { label: "12 reels / month" },
        { label: "8 static creatives" },
        { label: "Content calendar" },
        { label: "Captions & scripts" },
        { label: "Instagram optimization" },
        { label: "Google Business Profile support" },
        { label: "Basic Meta Ads setup & management" },
        { label: "Weekly reporting" },
      ],
      adSpendNote:
        "Fee covers Meta ad spend up to ₹15,000/mo. Beyond that, +12% of spend. Ad spend itself is billed separately, paid directly to Meta.",
      popular: true,
      ctaLabel: "Get Started",
      order: 1,
    },
  });

  await payload.create({
    collection: "pricing",
    data: {
      planName: "Apex",
      tierLabel: "Own the market",
      price: 27999,
      currency: "INR",
      billingPeriod: "Monthly",
      priceNote: "+ applicable taxes",
      features: [
        { label: "18 reels / month" },
        { label: "12 static creatives" },
        { label: "Full content calendar" },
        { label: "Scripts & captions" },
        { label: "Instagram + GBP management" },
        { label: "Meta Ads optimization" },
        { label: "Offer / funnel planning" },
        { label: "Weekly performance review" },
      ],
      adSpendNote:
        "Fee covers Meta ad spend up to ₹40,000/mo. Beyond that, +12% of spend. Ad spend itself is billed separately, paid directly to Meta.",
      popular: false,
      ctaLabel: "Get Started",
      order: 2,
    },
  });

  const faqs = [
    {
      question: "How does billing work for ad spend?",
      answer:
        "Your monthly fee covers our management — ad spend itself is billed separately and paid directly to the platform (Meta or Google). Ascent includes management for up to ₹15,000/month in Meta spend, Apex up to ₹40,000/month; beyond that it's an additional 12% of spend.",
    },
    {
      question: "What does “founding-client pricing” mean?",
      answer:
        "It's locked in for our first cohort of clients and won't change while you stay active — pricing is revised for clients who join after.",
    },
    {
      question: "How am I billed?",
      answer:
        "Plans are billed monthly, plus applicable taxes. Ad platform spend is billed separately by Meta or Google directly.",
    },
    {
      question: "Which platforms do you run ads on?",
      answer:
        "Meta (Facebook and Instagram) is included in the Ascent and Apex plans. Google Ads is available as part of our broader service list — reach out with your goals and we'll scope it.",
    },
    {
      question: "My business isn't D2C or local — can you still help?",
      answer:
        "Our core packages are built around content, Meta Ads, and local SEO, but we also take on custom scopes for other business types — get in touch and we'll tell you honestly if we're a fit.",
    },
    {
      question: "How fast will I see results?",
      answer:
        "Local SEO and content compound over months, not days. Meta Ads can start generating leads within the first couple of weeks of launch. We report weekly so you're never guessing where things stand.",
    },
  ];

  for (const [i, f] of faqs.entries()) {
    await payload.create({ collection: "faqs", data: { ...f, order: i } });
  }

  const testimonials = [
    {
      clientName: "D2C Skincare Founder",
      quote:
        "Scalwise didn't just run ads — they told us which SKUs to stop promoting. That's the kind of call that actually moves CAC.",
      resultStat: "Illustrative example",
      rating: 5,
      sampleData: true,
    },
    {
      clientName: "Local Restaurant Owner",
      quote:
        "Our Google Business Profile went from invisible to the first result for “near me” searches in our category within weeks.",
      resultStat: "Illustrative example",
      rating: 5,
      sampleData: true,
    },
    {
      clientName: "Real Estate Agent",
      quote:
        "The weekly reporting alone was worth it — I finally knew what my ad spend was actually doing.",
      resultStat: "Illustrative example",
      rating: 5,
      sampleData: true,
    },
  ];

  for (const t of testimonials) {
    await payload.create({ collection: "testimonials", data: t });
  }

  const caseStudies = [
    {
      title: "Rebuilding a Skincare Brand's Meta Ads Funnel",
      slug: "d2c-skincare-meta-ads-funnel",
      client: "D2C Skincare Brand (illustrative)",
      industry: "Ecommerce",
      results: [
        { stat: "2–4x", label: "Typical ROAS range" },
        { stat: "30–50%", label: "Typical CPL reduction" },
      ],
      sampleData: true,
    },
    {
      title: "Winning Local Search for a Multi-Location Business",
      slug: "local-search-multi-location",
      client: "Local Restaurant Group (illustrative)",
      industry: "Local Business",
      results: [
        { stat: "Top 3", label: "Typical local-pack ranking" },
        { stat: "2–3x", label: "Typical lead volume increase" },
      ],
      sampleData: true,
    },
    {
      title: "Building a Lead Engine for a Coaching Business",
      slug: "coaching-lead-engine",
      client: "Coaching Business (illustrative)",
      industry: "Coaching & Consulting",
      results: [
        { stat: "₹150–300", label: "Typical CPL range" },
        { stat: "3x", label: "Typical lead volume growth" },
      ],
      sampleData: true,
    },
  ];

  for (const c of caseStudies) {
    await payload.create({ collection: "case-studies", data: c });
  }

  await payload.updateGlobal({
    slug: "site-settings",
    data: { companyName: "Scalwise Media" },
  });

  console.log("[seed] done");
}

seed()
  .then(() => {
    console.log("[seed] script finished, exiting");
    process.exitCode = 0;
  })
  .catch((err) => {
    console.error("[seed] failed:", err);
    process.exitCode = 1;
  });
