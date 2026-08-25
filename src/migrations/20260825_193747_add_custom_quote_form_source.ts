import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_leads_form_source" ADD VALUE 'Custom Quote';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "leads" ALTER COLUMN "form_source" SET DATA TYPE text;
  ALTER TABLE "leads" ALTER COLUMN "form_source" SET DEFAULT 'Contact Form'::text;
  DROP TYPE "public"."enum_leads_form_source";
  CREATE TYPE "public"."enum_leads_form_source" AS ENUM('Contact Form', 'Newsletter Footer');
  ALTER TABLE "leads" ALTER COLUMN "form_source" SET DEFAULT 'Contact Form'::"public"."enum_leads_form_source";
  ALTER TABLE "leads" ALTER COLUMN "form_source" SET DATA TYPE "public"."enum_leads_form_source" USING "form_source"::"public"."enum_leads_form_source";`)
}
