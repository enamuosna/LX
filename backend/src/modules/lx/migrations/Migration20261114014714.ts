import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261114014714 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "courier" ("id" text not null, "name" text not null, "phone" text not null, "active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "courier_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_courier_deleted_at" ON "courier" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "service_request" ("id" text not null, "type" text check ("type" in ('outiko', 'jeuliko')) not null, "customer_name" text not null, "customer_phone" text not null, "details" text not null, "pickup_address" text null, "delivery_address" text null, "status" text check ("status" in ('new', 'in_progress', 'done', 'cancelled')) not null default 'new', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "service_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_service_request_deleted_at" ON "service_request" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "shop" ("id" text not null, "name" text not null, "phone" text not null, "email" text null, "address" text null, "status" text check ("status" in ('pending', 'approved', 'suspended')) not null default 'pending', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "shop_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shop_deleted_at" ON "shop" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "shop_order" ("id" text not null, "order_id" text not null, "order_display_id" integer not null, "status" text check ("status" in ('pending', 'confirmed', 'rejected', 'picked_up', 'delivered', 'cancelled')) not null default 'pending', "escalated" boolean not null default false, "payment_status" text check ("payment_status" in ('unpaid', 'paid')) not null default 'unpaid', "customer_name" text not null, "customer_phone" text not null, "address" text not null, "note" text null, "items" jsonb not null, "subtotal" integer not null, "shop_id" text not null, "courier_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "shop_order_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shop_order_order_id" ON "shop_order" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shop_order_shop_id" ON "shop_order" ("shop_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shop_order_courier_id" ON "shop_order" ("courier_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shop_order_deleted_at" ON "shop_order" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "shop_order" add constraint "shop_order_shop_id_foreign" foreign key ("shop_id") references "shop" ("id") on update cascade;`);
    this.addSql(`alter table if exists "shop_order" add constraint "shop_order_courier_id_foreign" foreign key ("courier_id") references "courier" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "shop_order" drop constraint if exists "shop_order_courier_id_foreign";`);

    this.addSql(`alter table if exists "shop_order" drop constraint if exists "shop_order_shop_id_foreign";`);

    this.addSql(`drop table if exists "courier" cascade;`);

    this.addSql(`drop table if exists "service_request" cascade;`);

    this.addSql(`drop table if exists "shop" cascade;`);

    this.addSql(`drop table if exists "shop_order" cascade;`);
  }

}
