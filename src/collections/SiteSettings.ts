import type { GlobalConfig } from "payload";
import { isLoggedIn, anyone } from "./access";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  access: {
    read: anyone,
    update: isLoggedIn,
  },
  fields: [
    { name: "companyName", type: "text", defaultValue: "Scalwise Media" },
    { name: "contactEmail", type: "email" },
    { name: "phone", type: "text" },
    {
      name: "whatsappNumber",
      type: "text",
      admin: { description: "Include country code, e.g. 919999999999" },
    },
    { name: "address", type: "textarea" },
    {
      name: "socials",
      type: "group",
      fields: [
        { name: "instagram", type: "text" },
        { name: "linkedin", type: "text" },
        { name: "facebook", type: "text" },
      ],
    },
    { name: "defaultOgImage", type: "upload", relationTo: "media" },
    {
      name: "analytics",
      type: "group",
      fields: [
        { name: "ga4Id", type: "text" },
        { name: "gtmId", type: "text" },
        { name: "metaPixelId", type: "text" },
        { name: "linkedInPartnerId", type: "text" },
      ],
    },
  ],
};
