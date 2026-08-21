"use client";

import { useId, useState, type TextareaHTMLAttributes } from "react";
import { AnimatedLabel } from "./AnimatedLabel";

interface FloatingLabelTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  containerClassName?: string;
}

export function FloatingLabelTextarea({
  label,
  value,
  onChange,
  containerClassName = "",
  id,
  rows = 4,
  ...props
}: FloatingLabelTextareaProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [focused, setFocused] = useState(false);
  const risen = focused || value.length > 0;

  return (
    <div className={`relative ${containerClassName}`}>
      <AnimatedLabel htmlFor={inputId} label={label} risen={risen} className="left-4 top-3" />
      <textarea
        id={inputId}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={rows}
        {...props}
        className="w-full resize-none rounded-xl border border-line bg-void-3/50 px-4 py-3 text-sm text-paper outline-none transition-colors duration-200 ease-premium focus:border-neon"
      />
    </div>
  );
}
