type IconProps = { className?: string };

// Simplified, single-color glyphs (not exact trademark reproductions) so each
// platform reads clearly at a glance while staying inside the brand's palette —
// see TrustStrip / LogoRing, which render these next to the real platform names.

export function MetaIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M7 8c-2.2 0-4 1.8-4 4s1.8 4 4 4c2.5 0 4.2-2.2 5-4 .8 1.8 2.5 4 5 4 2.2 0 4-1.8 4-4s-1.8-4-4-4c-2.5 0-4.2 2.2-5 4-.8-1.8-2.5-4-5-4z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GoogleAdsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth={1.8} />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth={1.8} />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function GoogleBusinessIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth={1.8} />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth={1.8} />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth={1.8} />
      <circle cx="16.6" cy="7.4" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function GoogleAnalyticsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 20V11M12 20V4M19 20v-7"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  );
}
