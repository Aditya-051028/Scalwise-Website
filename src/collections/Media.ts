import type { CollectionConfig } from "payload";
import { isLoggedIn, anyone } from "./access";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: anyone,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  upload: {
    staticDir: "media",
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300 },
      { name: "card", width: 800, height: 600 },
      { name: "og", width: 1200, height: 630 },
    ],
    mimeTypes: ["image/*"],
  },
  fields: [{ name: "alt", type: "text", required: true }],
};
