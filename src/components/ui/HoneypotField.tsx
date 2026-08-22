type HoneypotFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function HoneypotField({ value, onChange }: HoneypotFieldProps) {
  return (
    <input
      type="text"
      name="website"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="absolute -left-[9999px] -top-[9999px]"
    />
  );
}
