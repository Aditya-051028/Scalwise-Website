import { useState } from "react";

export function useHoneypot() {
  const [website, setWebsite] = useState("");
  const [formRenderedAt] = useState(() => Date.now());
  return { website, setWebsite, formRenderedAt };
}
