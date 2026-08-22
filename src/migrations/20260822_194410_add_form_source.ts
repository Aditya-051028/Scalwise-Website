import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_leads_form_source" AS ENUM('Contact Form', 'Newsletter Footer');
  ALTER TABLE "leads" ADD COLUMN "form_source" "enum_leads_form_source" DEFAULT 'Contact Form';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "leads" DROP COLUMN "form_source";
  DROP TYPE "public"."enum_leads_form_source";`)
}
