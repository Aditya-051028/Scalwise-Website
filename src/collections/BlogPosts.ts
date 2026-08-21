import type { CollectionConfig } from "payload";
import { isLoggedIn, anyone } from "./access";

export const BlogPosts: CollectionConfig = {
  slug: "blog-posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "publishedDate"],
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
    { name: "excerpt", type: "textarea" },
    { name: "content", type: "richText" },
    { name: "coverImage", type: "upload", relationTo: "media" },
    { name: "author", type: "text", defaultValue: "Scalwise Media" },
    { name: "publishedDate", type: "date", admin: { position: "sidebar" } },
    { name: "tags", type: "array", fields: [{ name: "tag", type: "text" }] },
    {
      name: "seo",
      type: "group",
      admin: { position: "sidebar" },
      fields: [
        { name: "metaTitle", type: "text" },
        { name: "metaDescription", type: "textarea" },
      ],
    },
  ],
};
