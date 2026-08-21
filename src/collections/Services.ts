import type { CollectionConfig } from "payload";
import { isLoggedIn, anyone } from "./access";

export const Services: CollectionConfig = {
  slug: "services",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "featured"],
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
    {
      name: "icon",
      type: "text",
      admin: { description: "Icon identifier, e.g. a lucide icon name" },
    },
    { name: "shortDescription", type: "textarea", required: true },
    { name: "fullDescription", type: "richText" },
    {
      name: "category",
      type: "select",
      options: [
        "Performance Marketing",
        "SEO & Local",
        "Web & Landing Pages",
        "Content & Social",
        "Automation & CRO",
        "Brand & Strategy",
      ],
    },
    { name: "order", type: "number", defaultValue: 0, admin: { position: "sidebar" } },
    { name: "featured", type: "checkbox", defaultValue: false, admin: { position: "sidebar" } },
  ],
};
