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
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "Shows a FEATURED badge on the product card." },
    },
    { name: "coverImage", type: "upload", relationTo: "media" },
    { name: "shortDescription", type: "text", admin: { description: "One line, shown on the product card." } },
    { name: "description", type: "richText" },
    {
      name: "price",
      type: "number",
      admin: { description: "The actual selling price, in the currency below." },
    },
    {
      name: "originalPrice",
      type: "number",
      admin: {
        description:
          "Optional — set higher than price to show it struck through next to the discounted price. Leave empty for no discount display.",
      },
    },
    { name: "currency", type: "text", defaultValue: "INR" },
    {
      name: "checkoutUrl",
      type: "text",
      admin: {
        position: "sidebar",
        description:
          "Payment gateway checkout link. Leave empty to show a 'Checkout Coming Soon' state instead of a broken Buy Now button.",
      },
    },
    {
      name: "razorpayPaymentLinkId",
      type: "text",
      admin: {
        position: "sidebar",
        description:
          "Razorpay's internal Payment Link ID (format plink_...), NOT the public rzp.io URL. Find it in the Razorpay dashboard's Payment Link details, or from the first real webhook payload. Required for the payment-verification webhook to attribute a sale to this product.",
      },
    },
    {
      name: "deliveryUrl",
      type: "text",
      admin: {
        position: "sidebar",
        description:
          "Where the Thank You page's Download button sends a verified buyer. Leave empty until real delivery (e.g. a signed download link) is wired up — the page will show an 'on its way' message instead of a broken link.",
      },
    },
    { name: "order", type: "number", defaultValue: 0, admin: { position: "sidebar" } },
  ],
};
