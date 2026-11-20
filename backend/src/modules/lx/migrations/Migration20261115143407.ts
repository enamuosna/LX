import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261115143407 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "shop" add column if not exists "wave_number" text null, add column if not exists "om_number" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "shop" drop column if exists "wave_number", drop column if exists "om_number";`);
  }

}
