import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261116223155 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "stock_movement" ("id" text not null, "shop_id" text not null, "product_id" text not null, "product_title" text not null, "reason" text check ("reason" in ('initial', 'restock', 'loss', 'adjustment', 'count', 'sale', 'release')) not null, "delta" integer not null, "balance_after" integer not null, "note" text null, "ref" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "stock_movement_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_stock_movement_shop_id" ON "stock_movement" ("shop_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_stock_movement_product_id" ON "stock_movement" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_stock_movement_deleted_at" ON "stock_movement" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "stock_movement" cascade;`);
  }

}
