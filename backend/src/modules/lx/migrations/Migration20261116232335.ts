import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261116232335 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "pos_sale" ("id" text not null, "shop_id" text not null, "number" integer not null, "items" jsonb not null, "subtotal" integer not null, "discount" integer not null default 0, "total" integer not null, "payment_method" text check ("payment_method" in ('cash', 'wave', 'om', 'card')) not null, "amount_received" integer null, "change_given" integer not null default 0, "customer_name" text null, "customer_phone" text null, "note" text null, "status" text check ("status" in ('completed', 'voided')) not null default 'completed', "voided_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pos_sale_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pos_sale_shop_id" ON "pos_sale" ("shop_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pos_sale_deleted_at" ON "pos_sale" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "stock_movement" drop constraint if exists "stock_movement_reason_check";`);

    this.addSql(`alter table if exists "stock_movement" add constraint "stock_movement_reason_check" check("reason" in ('initial', 'restock', 'loss', 'adjustment', 'count', 'sale', 'release', 'pos_sale', 'pos_void'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pos_sale" cascade;`);

    this.addSql(`alter table if exists "stock_movement" drop constraint if exists "stock_movement_reason_check";`);

    this.addSql(`alter table if exists "stock_movement" add constraint "stock_movement_reason_check" check("reason" in ('initial', 'restock', 'loss', 'adjustment', 'count', 'sale', 'release'));`);
  }

}
