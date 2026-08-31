type PriceTagProps = {
  price: number | null | undefined;
  originalPrice?: number | null;
  currency: string | null | undefined;
  className?: string;
};

function formatAmount(amount: number, currency: string | null | undefined) {
  return currency === "INR" ? `₹${amount}` : `${currency} ${amount}`;
}

/** Renders a literal placeholder until a real price is set on the product in
 *  the CMS — deliberately obvious rather than a polished-looking fake number,
 *  per the brief: "do not invent the final selling price." When originalPrice
 *  is set higher than price, shows it struck through next to the discounted
 *  price. Font size is left to the caller's className (via inheritance) so
 *  the same component reads right in both the hero and a compact card. */
export function PriceTag({ price, originalPrice, currency, className = "" }: PriceTagProps) {
  if (!price) {
    return (
      <span className={`font-mono text-lavender/70 ${className}`}>
        {currency === "INR" ? "₹XXX" : "[PRICE]"}
      </span>
    );
  }

  const hasDiscount = Boolean(originalPrice && originalPrice > price);

  return (
    <span className={`flex items-baseline gap-2 font-mono ${className}`}>
      {hasDiscount ? (
        <span className="text-[0.8em] text-lavender/60 line-through">
          {formatAmount(originalPrice as number, currency)}
        </span>
      ) : null}
      <span className="font-semibold text-paper">{formatAmount(price, currency)}</span>
    </span>
  );
}
