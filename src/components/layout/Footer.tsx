export function Footer() {
  return (
    <footer className="mt-auto border-t border-line px-6 py-10 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 text-center">
        <span className="font-display text-sm font-bold tracking-wide text-paper">
          SCALWISE <span className="text-neon">MEDIA</span>
        </span>
        <p className="eyebrow">Scale Smarter</p>
        <p className="text-xs text-lavender/60">
          © {new Date().getFullYear()} Scalwise Media. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
