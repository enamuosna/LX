import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261119122827 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "ad" ("id" text not null, "slot" text not null, "advertiser" text not null, "title" text not null, "image_url" text not null, "link_url" text not null, "active" boolean not null default true, "starts_at" timestamptz null, "ends_at" timestamptz null, "priority" integer not null default 0, "impressions" integer not null default 0, "clicks" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "ad_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ad_deleted_at" ON "ad" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "shop" add column if not exists "code" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "ad" cascade;`);

    this.addSql(`alter table if exists "shop" drop column if exists "code";`);
  }

}
