import type { CollectionConfig } from "payload";
import { isLoggedIn, anyone } from "./access";

export const Pricing: CollectionConfig = {
  slug: "pricing",
  admin: {
    useAsTitle: "planName",
    defaultColumns: ["planName", "price", "popular"],
  },
  access: {
    read: anyone,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    { name: "planName", type: "text", required: true },
    {
      name: "tierLabel",
      type: "text",
      admin: { description: 'Short positioning line, e.g. "Get discovered"' },
    },
    { name: "price", type: "number", required: true },
    { name: "currency", type: "text", defaultValue: "INR" },
    {
      name: "billingPeriod",
      type: "select",
      options: ["Monthly", "Quarterly", "Yearly"],
      defaultValue: "Monthly",
    },
    {
      name: "priceNote",
      type: "text",
      defaultValue: "+ applicable taxes",
    },
    {
      name: "features",
      type: "array",
      fields: [{ name: "label", type: "text", required: true }],
    },
    {
      name: "adSpendNote",
      type: "textarea",
      admin: { description: "e.g. ad-spend coverage and overage terms" },
    },
    { name: "popular", type: "checkbox", defaultValue: false },
    { name: "ctaLabel", type: "text", defaultValue: "Get Started" },
    { name: "order", type: "number", defaultValue: 0, admin: { position: "sidebar" } },
  ],
};
