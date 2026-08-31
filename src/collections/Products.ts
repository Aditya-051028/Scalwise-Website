import type { CollectionConfig } from "payload";
import { isLoggedIn, anyone } from "./access";

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "productType", "price", "status"],
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
      name: "productType",
      type: "select",
      options: ["E-book"],
      defaultValue: "E-book",
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "status",
      type: "select",
      options: ["Coming Soon", "Available"],
      defaultValue: "Coming Soon",
      required: true,
      admin: {
        position: "sidebar",
        description: "Coming Soon shows the product without a working Buy Now link yet.",
      },
    },
    { name: "coverImage", type: "upload", relationTo: "media" },
    { name: "shortDescription", type: "text", admin: { description: "One line, shown on the product card." } },
    { name: "description", type: "richText" },
    {
      name: "price",
      type: "number",
      admin: { description: "In the currency below, e.g. 499 for ₹499." },
    },
    { name: "currency", type: "text", defaultValue: "INR" },
    { name: "order", type: "number", defaultValue: 0, admin: { position: "sidebar" } },
  ],
};
