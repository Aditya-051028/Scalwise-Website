"use client";

import { useId, useState, type SelectHTMLAttributes } from "react";
import { AnimatedLabel } from "./AnimatedLabel";

interface FloatingLabelSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange"> {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: readonly string[];
  containerClassName?: string;
}

export function FloatingLabelSelect({
  label,
  value,
  onChange,
  options,
  containerClassName = "",
  id,
  ...props
}: FloatingLabelSelectProps) {
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
      <select
        id={inputId}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
        className="w-full appearance-none rounded-xl border border-line bg-void-3/50 px-4 py-3 pr-9 text-sm text-paper outline-none transition-colors duration-200 ease-premium focus:border-neon"
      >
        <option value=""></option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 12 8"
        className="pointer-events-none absolute top-1/2 right-4 h-2 w-3 -translate-y-1/2 text-lavender"
      >
        <path
          d="M1 1.5 6 6.5 11 1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
