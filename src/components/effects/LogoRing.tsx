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

type Item = { name: string; Icon?: ComponentType<{ className?: string }> };

const ITEMS: Item[] = [
  { name: "Meta Ads", Icon: MetaIcon },
  { name: "Google My Business", Icon: GoogleMyBusinessIcon },
  { name: "Google Ads", Icon: GoogleAdsIcon },
  { name: "SEO Optimization", Icon: SeoIcon },
  { name: "Web Development", Icon: WebDevIcon },
  { name: "Instagram Management", Icon: InstagramIcon },
  { name: "Facebook Page Management", Icon: FacebookIcon },
  { name: "Facebook Ads", Icon: FacebookIcon },
  { name: "Reel Scripts & Captions", Icon: ReelIcon },
  { name: "Content Calendar", Icon: ContentCalendarIcon },
  { name: "And More" },
];

/** Draggable, auto-scrolling ring of platform logos and service badges — see
 *  InfiniteSlider for the drag/loop mechanics and LogoBadge for the per-item
 *  visual treatment. */
export function LogoRing() {
  return (
    <InfiniteSlider
      gap={28}
      duration={40}
      durationOnHover={90}
      className="w-full [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
    >
      {ITEMS.map((item) => (
        <LogoBadge key={item.name} label={item.name} Icon={item.Icon} />
      ))}
    </InfiniteSlider>
  );
}
