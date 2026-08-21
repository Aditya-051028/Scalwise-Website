import type { CollectionConfig } from "payload";
import { isLoggedIn, anyone } from "./access";

export const FAQs: CollectionConfig = {
  slug: "faqs",
  admin: {
    useAsTitle: "question",
    defaultColumns: ["question", "category", "order"],
  },
  access: {
    read: anyone,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    { name: "question", type: "text", required: true },
    { name: "answer", type: "richText", required: true },
    { name: "category", type: "text" },
    { name: "order", type: "number", defaultValue: 0 },
  ],
};
