import type { CollectionConfig } from "payload";
import { isLoggedIn } from "./access";

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    useAsTitle: "razorpayPaymentId",
    defaultColumns: ["razorpayPaymentId", "product", "buyerEmail", "amount", "createdAt"],
  },
  access: {
    // Created only by the Razorpay webhook route via the Local API with
    // overrideAccess: true — nothing public writes to this collection directly.
    create: isLoggedIn,
    read: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    { name: "razorpayPaymentId", type: "text", required: true, unique: true },
    { name: "razorpayPaymentLinkId", type: "text" },
    { name: "product", type: "relationship", relationTo: "products", required: true },
    { name: "amount", type: "number" },
    { name: "currency", type: "text" },
    { name: "buyerEmail", type: "email" },
    { name: "buyerContact", type: "text" },
    { name: "rawPayload", type: "json" },
  ],
  timestamps: true,
};
