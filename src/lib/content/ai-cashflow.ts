// All copy here is sourced from "AI Cashflow - Expanded Edition" (83 pages, by
// Scalwise Media) and the product brief — nothing invented. Where the book is
// explicit that examples/timelines are illustrative and not guaranteed, that
// framing is preserved here rather than smoothed over for marketing punch.

export const AI_CASHFLOW_SLUG = "ai-cashflow";

export const ANNOUNCEMENT_STRIP = "83-Page Expanded Edition · Written by Scalwise Media";

export const HERO = {
  eyebrow: "The Zero-Budget AI Playbook",
  title: "AI CASHFLOW",
  subheadline: "Build Your First Online Income Stream Using AI, Content & Social Media.",
  supportingCopy:
    "A practical 83-page system for beginners who want to go from “I don’t know where to start” to a clear, repeatable process for building an online income stream with AI.",
  supportingLine: "Start from zero. Build with what you have. Follow the system.",
  buyNoteInactive: "Checkout opens soon.",
  buyNoteActive: "Digital access after successful payment.",
} as const;

export const PROBLEM = {
  headline: "You Don’t Need Another List of AI Tools.",
  body: "Most beginners don’t struggle because they have no access to AI. They struggle because they don’t know:",
  points: [
    "What to sell",
    "Who to sell it to",
    "What content to create",
    "What to post",
    "How to turn attention into leads",
    "What to say to prospects",
    "How to package an offer",
    "How to deliver the work",
    "What to do next",
  ],
  closing:
    "The tools were never the bottleneck for very long — once ChatGPT and Claude went mainstream, everyone had access to the same writing assistant. What’s still missing for most people is a system: the specific order of steps that turns “I have access to powerful AI tools” into “I made my first sale online.”",
} as const;

export const SOLUTION = {
  headline: "AI Is the Tool. The System Is the Advantage.",
  body: "AI CASHFLOW gives you the AI Cashflow Operating System — the exact chain the whole book builds toward, one working link per chapter:",
  coreIdea:
    "AI is not the business. The problem you solve is the business. AI just removes most of the friction between “I understand this problem” and “I have a product, a post, or a pitch about it.”",
} as const;

export const OPERATING_SYSTEM_STEPS = [
  { title: "Choose", description: "Pick an income model." },
  { title: "Research", description: "Niche, audience, problem." },
  { title: "Build", description: "Your AI toolkit and profile." },
  { title: "Create", description: "Content via the AI engine." },
  { title: "Publish", description: "Consistently, on a system." },
  { title: "Engage", description: "Daily, in your niche." },
  { title: "Offer", description: "A clear, priced offer." },
  { title: "Outreach", description: "Find and message prospects." },
  { title: "Sell", description: "Handle replies, close." },
  { title: "Deliver", description: "With AI + human quality control." },
  { title: "Measure", description: "Track what’s working." },
  { title: "Optimize & Scale", description: "Repeat, raise prices, delegate." },
] as const;

export const VALUE_STACK = [
  {
    number: "01",
    title: "15 AI Income Models",
    description: "Understand realistic service, digital-product and audience-based income models.",
  },
  {
    number: "02",
    title: "AI Research System",
    description:
      "Learn how to use AI for audience research, competitor gaps, problems, customer language and content opportunities.",
  },
  {
    number: "03",
    title: "AI Content Engine",
    description:
      "Build a repeatable pipeline from research → ideas → hooks → scripts → captions → visuals → publishing → analytics.",
  },
  {
    number: "04",
    title: "Build Your First Offer",
    description: "Turn a specific problem into a sellable service or product.",
  },
  {
    number: "05",
    title: "Find Your First Customers",
    description: "Learn prospecting, outreach and the DM-to-client process.",
  },
  {
    number: "06",
    title: "Deliver With AI",
    description: "Use AI to speed up delivery while keeping human judgment and quality control.",
  },
  {
    number: "07",
    title: "30-Day AI Cashflow Challenge",
    description: "A day-by-day action plan that turns the book into an implementation system.",
  },
  {
    number: "08",
    title: "100-Prompt Pack",
    description: "A categorized collection of practical AI prompts.",
  },
] as const;

export type IncomeModel = { name: string; solves: string };

export const INCOME_MODELS: { category: string; models: IncomeModel[] }[] = [
  {
    category: "Service-Based",
    models: [
      { name: "AI Social Media Management", solves: "Inactive/inconsistent online presence" },
      { name: "AI Content Creation", solves: "No time/skill to post regularly" },
      { name: "AI Short-Form Video Editing", solves: "Raw footage, no polished reels" },
      { name: "AI Copywriting", solves: "Weak website/ad/email copy" },
      { name: "AI Content Repurposing", solves: "One piece of content, one format only" },
      { name: "AI Lead Generation", solves: "Not enough inbound enquiries" },
      { name: "AI Email Marketing", solves: "No list, no follow-up system" },
      { name: "AI Automation / Setup Services", solves: "Manual, repetitive business tasks" },
    ],
  },
  {
    category: "Digital Products",
    models: [
      { name: "AI Ebooks", solves: "Wants a shortcut past trial-and-error" },
      { name: "AI Prompt Packs", solves: "Doesn’t know how to prompt well" },
      { name: "AI Templates", solves: "Starting from a blank page every time" },
      { name: "AI Content Calendars", solves: "No plan, posts randomly" },
      { name: "AI Notion / Productivity Systems", solves: "Disorganized planning/workflow" },
    ],
  },
  {
    category: "Audience-Based",
    models: [
      { name: "Affiliate Marketing", solves: "Wants recommendations it can trust" },
      { name: "Creator / Brand Partnerships", solves: "Brand wants access to a real audience" },
    ],
  },
];

export const INCOME_MODELS_NOTE =
  "The book doesn’t ask you to pursue all fifteen — it has you select one starting lane.";

export const CONTENT_ENGINE_STEPS = [
  "Research",
  "Ideas",
  "Hooks",
  "Scripts",
  "Captions",
  "Visuals",
  "Editing",
  "Publishing",
  "Analytics",
  "Optimization",
] as const;

export const CONTENT_ENGINE_NOTE =
  "A repeatable pipeline, not a pile of prompts — one piece of research produces one idea, and one idea produces three formats.";

export const THIRTY_DAY_WEEKS = [
  {
    week: "Week 1",
    title: "Foundation",
    description: "Build the foundation — your income model, niche, AI toolkit and profile.",
  },
  {
    week: "Week 2",
    title: "Content",
    description: "Create your content engine and start publishing on a consistent system.",
  },
  {
    week: "Week 3",
    title: "Leads",
    description: "Start reaching potential customers — find, qualify and message prospects.",
  },
  {
    week: "Week 4",
    title: "Sales",
    description: "Make your first serious income attempt — present the offer, handle replies, close and deliver.",
  },
] as const;

export const WHO_FOR = [
  "Beginners",
  "Students",
  "Beginner freelancers",
  "Aspiring creators",
  "People exploring online income",
  "People starting with little/no budget",
  "People who want an actionable AI system",
  "People willing to actually execute",
] as const;

export const WHO_NOT_FOR = [
  "People looking for guaranteed money",
  "People expecting passive income without work",
  "People looking for a magic AI button",
  "People who only want AI news/theory",
  "People unwilling to publish, outreach or sell",
] as const;

export const WHATS_INCLUDED = [
  "Complete AI income roadmap",
  "15 AI income models",
  "Niche validation framework",
  "AI research system",
  "AI content engine",
  "Personal brand system",
  "Offer creation framework",
  "Pricing framework",
  "Customer acquisition system",
  "DM-to-client system",
  "AI delivery workflows",
  "Digital product strategy",
  "30-day action plan",
  "AI Cashflow Operating System",
  "100-prompt bonus pack",
] as const;

export const OBJECTIONS = [
  {
    question: "“I have no audience.”",
    answer:
      "The system does not require an existing large audience. It includes content, outreach and customer-acquisition approaches designed for beginners.",
  },
  {
    question: "“I don’t know which AI tool to use.”",
    answer:
      "The book uses a small, deliberate toolkit rather than overwhelming readers with dozens of tools.",
  },
  {
    question: "“I have no experience.”",
    answer:
      "The book is specifically designed for beginners, but execution and learning are still required.",
  },
  {
    question: "“I have no budget.”",
    answer:
      "The positioning is built around starting with a zero-budget/low-cost setup, while noting that some tools or business activities may eventually have paid costs.",
  },
  {
    question: "“I don’t want to become a content creator.”",
    answer:
      "The book covers multiple income models, including service-based models that can rely more heavily on direct outreach.",
  },
] as const;

export const FAQ_ITEMS = [
  {
    id: "who-for",
    question: "Who is AI CASHFLOW for?",
    answer:
      "Beginners starting from zero — no audience, no product, maybe no experience — who have a phone, a few hours a week, and are willing to actually execute, not just collect information.",
  },
  {
    id: "length",
    question: "How long is the ebook?",
    answer:
      "83 pages (Expanded Edition), organized into 19 chapters across six parts, plus a 30-Day Action Plan and a 100-prompt bonus pack.",
  },
  {
    id: "beginners",
    question: "Is it suitable for complete beginners?",
    answer:
      "Yes — it’s written specifically for people starting from zero, with worksheets and prompts for every step rather than assumed prior experience.",
  },
  {
    id: "audience",
    question: "Do I need a large audience?",
    answer:
      "No. Most of the system is built around content, outreach and a DM-to-client process designed for people starting without an existing audience. Two of the fifteen income models — affiliate marketing and creator partnerships — do assume an existing audience first; the book flags those as a second income lane, not a starting point.",
  },
  {
    id: "budget",
    question: "Do I need money to get started?",
    answer:
      "The system is built around a free-tier AI toolkit and a zero/low-cost startup for every model in the book. Some tools or business activities may eventually have paid costs as you grow.",
  },
  {
    id: "ai-knowledge",
    question: "Do I need advanced AI knowledge?",
    answer:
      "No — the book assumes no prior AI experience and gives exact prompts for every step, from research to content to outreach.",
  },
  {
    id: "tools",
    question: "What AI tools does it cover?",
    answer:
      "A small, deliberate toolkit rather than dozens of tools. AI tools, pricing and free tiers change constantly — treat any tool mentioned as “true at the time of writing” and confirm current details yourself.",
  },
  {
    id: "guarantee",
    question: "Does it guarantee income?",
    answer:
      "No. Every income example, price and timeline in the book is illustrative — results depend on your effort, niche, offer, consistency and factors outside anyone’s control. Nothing in it is financial, legal or tax advice.",
  },
  {
    id: "digital",
    question: "Is the ebook delivered digitally?",
    answer: "Yes — AI CASHFLOW is a digital PDF, no physical copy.",
  },
  {
    id: "receive",
    question: "How will I receive it?",
    answer:
      "After a successful purchase you get access to download the ebook. The exact delivery method is being finalized alongside the payment setup.",
  },
  {
    id: "after-payment",
    question: "What happens after payment?",
    answer:
      "You’re taken to a confirmation page with your download and the 30-Day Action Plan to get started.",
  },
  {
    id: "mobile",
    question: "Can I access it on my phone?",
    answer: "Yes — it’s a standard PDF, readable on phone, tablet or computer.",
  },
] as const;

export const FINAL_CTA = {
  headline: "Stop Collecting AI Tools.\nStart Building With Them.",
  body: "AI CASHFLOW gives you the roadmap, workflows, prompts and 30-day action plan to turn AI from something you experiment with into a system you can actually execute.",
  buttonLabel: "Buy AI Cashflow",
  microcopy: "83-page Expanded Edition + 100-Prompt Pack",
} as const;

export const THANK_YOU = {
  headline: "You’re In.",
  subheadline: "Welcome to AI CASHFLOW.",
  body: "Your next step isn’t to read 83 pages. It’s to start executing.",
  steps: [
    { title: "Download your ebook." },
    { title: "Go to the 30-Day AI Cashflow Challenge." },
    { title: "Complete Day 1." },
    { title: "Build your first income lane." },
  ],
} as const;
