type PriceTagProps = {
  price: number | null | undefined;
  currency: string | null | undefined;
  className?: string;
};

/** Renders a literal placeholder until a real price is set on the product in
 *  the CMS — deliberately obvious rather than a polished-looking fake number,
 *  per the brief: "do not invent the final selling price." */
export function PriceTag({ price, currency, className = "" }: PriceTagProps) {
  if (!price) {
    return (
      <span className={`font-mono text-lg text-lavender/70 ${className}`}>
        {currency === "INR" ? "₹XXX" : "[PRICE]"}
      </span>
    );
  }
  return (
    <span className={`font-mono text-lg font-semibold text-paper ${className}`}>
      {currency === "INR" ? "₹" : `${currency} `}
      {price}
    </span>
  );
}
