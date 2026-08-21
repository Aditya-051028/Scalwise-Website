import type { CollectionConfig } from "payload";
import { isLoggedIn, anyone } from "./access";

export const CaseStudies: CollectionConfig = {
  slug: "case-studies",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "client", "industry", "sampleData"],
  },
  access: {
    read: anyone,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
    },
    { name: "client", type: "text" },
    { name: "industry", type: "text" },
    { name: "coverImage", type: "upload", relationTo: "media" },
    { name: "challenge", type: "richText" },
    { name: "strategy", type: "richText" },
    {
      name: "results",
      type: "array",
      fields: [
        { name: "stat", type: "text", required: true },
        { name: "label", type: "text", required: true },
      ],
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
