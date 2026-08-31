import Image from "next/image";
import Link from "next/link";
import { GradientReveal } from "@/components/effects/GradientReveal";
import { FooterNewsletterForm } from "./FooterNewsletterForm";

const EXPLORE_LINKS = [
  { label: "Services", href: "/#services" },
  { label: "Industries", href: "/#industries" },
  { label: "Process", href: "/#process" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Products", href: "/products" },
];

const COMPANY_LINKS = [
  { label: "Proof of work", href: "/#proof" },
  { label: "Why Scalwise", href: "/#why-scalwise" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
];

export function Footer() {
  return (
    <GradientReveal gradientHeight="46vh" className="relative mt-auto">
      <div className="relative z-20 mx-auto w-full max-w-7xl px-6 pt-16 md:px-12">
        <div className="grid gap-10 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/#hero" className="flex items-center gap-2.5">
              <Image
                src="/brand/scalwise-icon.svg"
                alt="Scalwise Media"
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="flex items-baseline gap-1.5">
                <span className="font-display text-lg font-bold text-paper">SCALWISE</span>
                <span className="font-mono text-[10px] tracking-[0.3em] text-neon">MEDIA</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-lavender">
              Performance ads, local SEO, and content for local and D2C brands.
              Scale smarter, not louder.
            </p>
            <FooterNewsletterForm />
          </div>

          <nav aria-label="Explore">
            <h3 className="eyebrow">Explore</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-lavender transition-colors duration-200 hover:text-paper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h3 className="eyebrow">Company</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-lavender transition-colors duration-200 hover:text-paper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-line/60 pt-6 pb-10 font-mono text-[11px] uppercase tracking-wider text-lavender/70 sm:flex-row">
          <span>© {new Date().getFullYear()} Scalwise Media. All rights reserved.</span>
          <span className="text-neon/80">Scale Smarter</span>
        </div>
      </div>
    </GradientReveal>
  );
}
