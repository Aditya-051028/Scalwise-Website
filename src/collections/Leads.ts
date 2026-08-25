import type { CollectionConfig } from "payload";
import { isLoggedIn } from "./access";
import { FORM_SOURCES } from "@/lib/form-sources";
import { BUSINESS_TYPES, AD_BUDGETS, CONTACT_METHODS, SERVICE_INTERESTS } from "@/lib/content/plan-options";

export const Leads: CollectionConfig = {
  slug: "leads",
  admin: {
    useAsTitle: "email",
    defaultColumns: ["name", "email", "company", "status", "createdAt"],
  },
  access: {
    // Public lead creation goes through /api/contact, which calls the Local API with
    // overrideAccess (bypassing this check by design). Denying it here just closes off
    // Payload's auto-generated REST endpoint, which has no rate limiting or spam checks.
    create: isLoggedIn,
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
      options: [...BUSINESS_TYPES],
    },
    {
      name: "interestedServices",
      type: "select",
      hasMany: true,
      options: [...SERVICE_INTERESTS],
    },
    {
      name: "monthlyAdBudget",
      type: "select",
      options: [...AD_BUDGETS],
    },
    { name: "message", type: "textarea" },
    {
      name: "preferredContactMethod",
      type: "select",
      options: [...CONTACT_METHODS],
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
      name: "formSource",
      type: "select",
      options: [...FORM_SOURCES],
      defaultValue: "Contact Form",
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
