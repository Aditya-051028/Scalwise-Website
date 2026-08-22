import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { buildConfig } from "payload";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";

import { Users } from "./src/collections/Users";
import { Media } from "./src/collections/Media";
import { Leads } from "./src/collections/Leads";
import { Services } from "./src/collections/Services";
import { Pricing } from "./src/collections/Pricing";
import { Testimonials } from "./src/collections/Testimonials";
import { CaseStudies } from "./src/collections/CaseStudies";
import { BlogPosts } from "./src/collections/BlogPosts";
import { FAQs } from "./src/collections/FAQs";
import { SiteSettings } from "./src/collections/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  editor: lexicalEditor(),
  collections: [
    Users,
    Media,
    Leads,
    Services,
    Pricing,
    Testimonials,
    CaseStudies,
    BlogPosts,
    FAQs,
  ],
  globals: [SiteSettings],
  plugins: [
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: { media: true },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
  ],
  secret: process.env.PAYLOAD_SECRET || "",
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
  }),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "src/payload-types.ts"),
  },
});
