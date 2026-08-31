"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useScrolled } from "@/lib/hooks/use-scrolled";

export function Header() {
  const scrolled = useScrolled();

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ease-premium ${
        scrolled
          ? "border-b border-line bg-void/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
        <Link href="/#hero" className="flex items-center gap-2.5">
          <Image
            src="/brand/scalwise-icon.svg"
            alt="Scalwise Media"
            width={28}
            height={28}
            className="h-7 w-7"
            priority
          />
          <span className="flex items-baseline gap-1.5">
            <span className="font-display text-lg font-bold tracking-wide text-paper">
              SCALWISE
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] text-neon">
              MEDIA
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/products"
            className="hidden font-mono text-xs uppercase tracking-wide text-lavender transition-colors duration-200 hover:text-paper sm:block"
          >
            Products
          </Link>
          <div className="hidden sm:block">
            <Button href="/#contact" variant="secondary">
              Get Your Growth Plan
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
