"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { AnimatedLabel } from "./AnimatedLabel";

interface FloatingLabelInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  containerClassName?: string;
}

export function FloatingLabelInput({
  label,
  value,
  onChange,
  containerClassName = "",
  id,
  ...props
}: FloatingLabelInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [focused, setFocused] = useState(false);
  const risen = focused || value.length > 0;

  return (
    <div className={`relative ${containerClassName}`}>
      <AnimatedLabel
        htmlFor={inputId}
        label={label}
        risen={risen}
        className="left-4 top-1/2 -translate-y-1/2"
      />
      <input
        id={inputId}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
        className="w-full rounded-xl border border-line bg-void-3/50 px-4 py-3 text-sm text-paper outline-none transition-colors duration-200 ease-premium focus:border-neon"
      />
    </div>
  );
}
