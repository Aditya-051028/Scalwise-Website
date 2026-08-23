import { type ComponentType } from "react";
import { InfiniteSlider } from "@/components/ui/InfiniteSlider";
import { LogoBadge } from "@/components/ui/LogoBadge";
import {
  MetaIcon,
  GoogleMyBusinessIcon,
  GoogleAdsIcon,
  SeoIcon,
  WebDevIcon,
  InstagramIcon,
  FacebookIcon,
  ReelIcon,
  ContentCalendarIcon,
} from "@/components/effects/PlatformIcons";

// Real, official brand colors (via Simple Icons) — used as each badge's fill
// so platform logos read as the actual brand, not a site-palette recolor.
// Instagram keeps its real gradient since that's the platform's single most
// recognizable trait. Scalwise's own services (no third-party brand) omit
// this and fall back to LogoBadge's default void/lavender treatment.
const META_BLUE = "#0467DF";
const GOOGLE_BLUE = "#4285F4";
const INSTAGRAM_GRADIENT =
  "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)";
const FACEBOOK_BLUE = "#0866FF";

type Item = {
  name: string;
  Icon?: ComponentType<{ className?: string }>;
  brandColor?: string;
};

const ITEMS: Item[] = [
  { name: "Meta Ads", Icon: MetaIcon, brandColor: META_BLUE },
  { name: "Google My Business", Icon: GoogleMyBusinessIcon, brandColor: GOOGLE_BLUE },
  { name: "Google Ads", Icon: GoogleAdsIcon, brandColor: GOOGLE_BLUE },
  { name: "SEO Optimization", Icon: SeoIcon },
  { name: "Web Development", Icon: WebDevIcon },
  { name: "Instagram Management", Icon: InstagramIcon, brandColor: INSTAGRAM_GRADIENT },
  { name: "Facebook Page Management", Icon: FacebookIcon, brandColor: FACEBOOK_BLUE },
  { name: "Facebook Ads", Icon: FacebookIcon, brandColor: FACEBOOK_BLUE },
  { name: "Reel Scripts & Captions", Icon: ReelIcon },
  { name: "Content Calendar", Icon: ContentCalendarIcon },
  { name: "And More" },
];

const FLOAT_STAGGER_S = 0.55;

/** Draggable, auto-scrolling ring of platform logos and service badges — see
 *  InfiniteSlider for the drag/loop mechanics and LogoBadge for the per-item
 *  visual treatment (real brand color + idle float + cursor tilt). */
export function LogoRing() {
  return (
    <InfiniteSlider
      gap={32}
      duration={40}
      durationOnHover={90}
      className="w-full [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
    >
      {ITEMS.map((item, i) => (
        <LogoBadge
          key={item.name}
          label={item.name}
          Icon={item.Icon}
          brandColor={item.brandColor}
          floatDelay={(i % ITEMS.length) * FLOAT_STAGGER_S}
        />
      ))}
    </InfiniteSlider>
  );
}
