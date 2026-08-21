import type { CollectionConfig } from "payload";
import { isLoggedIn, anyone } from "./access";

export const Leads: CollectionConfig = {
  slug: "leads",
  admin: {
    useAsTitle: "email",
    defaultColumns: ["name", "email", "company", "status", "createdAt"],
  },
  access: {
    create: anyone,
    read: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "company", type: "text" },
    {
      name: "businessType",
      type: "select",
      options: [
        "D2C / Ecommerce",
        "Local Business",
        "Real Estate",
        "Healthcare",
        "Coaching / Consulting",
        "Startup",
        "Luxury Brand",
        "Other",
      ],
    },
    {
      name: "monthlyAdBudget",
      type: "select",
      options: [
        "Not yet spending",
        "Under ₹50,000",
        "₹50,000 – ₹2,00,000",
        "₹2,00,000 – ₹5,00,000",
        "₹5,00,000+",
      ],
    },
    { name: "message", type: "textarea" },
    {
      name: "preferredContactMethod",
      type: "select",
      options: ["Email", "Phone", "WhatsApp"],
      defaultValue: "Email",
    },
    {
      name: "status",
      type: "select",
      options: ["New", "Contacted", "Qualified", "Won", "Lost"],
      defaultValue: "New",
      admin: { position: "sidebar" },
    },
    {
      name: "source",
      type: "group",
      admin: { position: "sidebar" },
      fields: [
        { name: "utmSource", type: "text" },
        { name: "utmMedium", type: "text" },
        { name: "utmCampaign", type: "text" },
      ],
    },
  ],
  timestamps: true,
};
