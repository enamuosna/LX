import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261115132706 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "review" ("id" text not null, "product_id" text not null, "order_display_id" integer not null, "author" text not null, "rating" integer not null, "comment" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "review_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_review_product_id" ON "review" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_review_deleted_at" ON "review" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "shop_order" add column if not exists "delivery_code" text null, add column if not exists "payment_method" text null, add column if not exists "payment_ref" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "review" cascade;`);

    this.addSql(`alter table if exists "shop_order" drop column if exists "delivery_code", drop column if exists "payment_method", drop column if exists "payment_ref";`);
  }

}
