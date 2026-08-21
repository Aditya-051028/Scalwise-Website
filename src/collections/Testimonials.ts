import type { CollectionConfig } from "payload";
import { isLoggedIn, anyone } from "./access";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  admin: {
    useAsTitle: "clientName",
    defaultColumns: ["clientName", "company", "sampleData"],
  },
  access: {
    read: anyone,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    { name: "clientName", type: "text", required: true },
    { name: "role", type: "text" },
    { name: "company", type: "text" },
    { name: "quote", type: "textarea", required: true },
    { name: "avatar", type: "upload", relationTo: "media" },
    { name: "rating", type: "number", min: 1, max: 5, defaultValue: 5 },
    {
      name: "resultStat",
      type: "text",
      admin: { description: 'Optional, e.g. "ROAS 4.2x"' },
    },
    {
      name: "sampleData",
      type: "checkbox",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description: "Uncheck once this is a real, verified client result.",
      },
    },
  ],
};
