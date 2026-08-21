import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const isCenter = align === "center";
  return (
    <Reveal className={isCenter ? "text-center" : ""}>
      <p className="eyebrow">{eyebrow}</p>
      <h2
        className={`mt-3 font-display text-3xl font-bold text-paper sm:text-4xl ${
          isCenter ? "mx-auto max-w-2xl" : "max-w-xl"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 text-[15px] leading-relaxed text-lavender sm:text-base ${
            isCenter ? "mx-auto max-w-xl" : "max-w-lg"
          }`}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
