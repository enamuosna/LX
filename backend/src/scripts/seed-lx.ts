import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow, createInventoryLevelsWorkflow, createProductCategoriesWorkflow, createProductsWorkflow,
  createRegionsWorkflow, createSalesChannelsWorkflow, createShippingOptionsWorkflow, createShippingProfilesWorkflow,
  createStockLocationsWorkflow, createTaxRegionsWorkflow, linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow, updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { LX_MODULE } from "../modules/lx"
import { lx } from "../lib/lx"

// Données de démonstration Lx : région Sénégal (FCFA), livraison, boutique démo + produits, livreur.
export default async function seedLx({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillment = container.resolve(Modules.FULFILLMENT)
  const storeModule = container.resolve(Modules.STORE)
  const auth = container.resolve(Modules.AUTH)
  const front = process.env.LX_STOREFRONT_URL || "http://localhost:3000"
  const FEE = Number(process.env.LX_DELIVERY_FEE || 1500)

  // Rejouable : si la région Sénégal existe déjà, on ne refait rien (démarrages Docker successifs).
  const { data: existing } = await query.graph({ entity: "region", fields: ["id"] })
  if (existing.length) { logger.info("Seed Lx déjà appliqué, rien à faire."); return }

  const [store] = await storeModule.listStores()
  const { result: [channel] } = await createSalesChannelsWorkflow(container).run({ input: { salesChannelsData: [{ name: "Lx Sénégal" }] } })
  await storeModule.updateStores(store.id, { supported_currencies: [{ currency_code: "xof", is_default: true }], default_sales_channel_id: channel.id })

  const { result: [region] } = await createRegionsWorkflow(container).run({ input: { regions: [{ name: "Sénégal", currency_code: "xof", countries: ["sn"], payment_providers: ["pp_system_default"] }] } })
  await createTaxRegionsWorkflow(container).run({ input: [{ country_code: "sn", provider_id: "tp_system" }] })

  const { result: [loc] } = await createStockLocationsWorkflow(container).run({ input: { locations: [{ name: "Dakar", address: { city: "Dakar", country_code: "SN", address_1: "Dakar" } }] } })
  await updateStoresWorkflow(container).run({ input: { selector: { id: store.id }, update: { default_location_id: loc.id } } })
  await link.create({ [Modules.STOCK_LOCATION]: { stock_location_id: loc.id }, [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" } })

  let [profile] = await fulfillment.listShippingProfiles({ type: "default" })
  if (!profile) [profile] = (await createShippingProfilesWorkflow(container).run({ input: { data: [{ name: "Défaut", type: "default" }] } })).result
  const set = await fulfillment.createFulfillmentSets({ name: "Livraison Lx Dakar", type: "shipping", service_zones: [{ name: "Sénégal", geo_zones: [{ country_code: "sn", type: "country" }] }] })
  await link.create({ [Modules.STOCK_LOCATION]: { stock_location_id: loc.id }, [Modules.FULFILLMENT]: { fulfillment_set_id: set.id } })
  await createShippingOptionsWorkflow(container).run({ input: [{
    name: "Livraison Lx", price_type: "flat", provider_id: "manual_manual", service_zone_id: set.service_zones[0].id, shipping_profile_id: profile.id,
    type: { label: "Livraison Lx", description: "Un livreur Lx récupère le colis scellé et vous le livre.", code: "lx" },
    prices: [{ currency_code: "xof", amount: FEE }, { region_id: region.id, amount: FEE }],
    rules: [{ attribute: "enabled_in_store", value: "true", operator: "eq" }, { attribute: "is_return", value: "false", operator: "eq" }],
  }] })
  await linkSalesChannelsToStockLocationWorkflow(container).run({ input: { id: loc.id, add: [channel.id] } })

  const { result: [pk] } = await createApiKeysWorkflow(container).run({ input: { api_keys: [{ title: "Vitrine Lx", type: "publishable", created_by: "" }] } })
  await linkSalesChannelsToApiKeyWorkflow(container).run({ input: { id: pk.id, add: [channel.id] } })

  const { result: cats } = await createProductCategoriesWorkflow(container).run({ input: { product_categories: ["Informatique", "Audio", "Téléphonie", "Photo", "Maison", "Mode"].map((name) => ({ name, is_active: true })) } })
  const cat = (n: string) => cats.find((c) => c.name === n)!.id

  // Boutique démo + compte vendeur
  const svc = lx(container)
  const shop = await svc.createShops({ name: "Dakar Tech", phone: "221770000001", email: "boutique@lx.sn", address: "Sandaga, Dakar", status: "approved" } as any)
  const reg = await auth.register("emailpass", { body: { email: "boutique@lx.sn", password: "ChangeMe!2026" } } as any)
  if (reg.authIdentity) await auth.updateAuthIdentities({ id: reg.authIdentity.id, app_metadata: { shop_id: shop.id } })
  await svc.createCouriers({ name: "Moussa Livreur", phone: "221770000002" } as any)

  const items: [string, string, number, number, string, string][] = [
    ['Ordinateur portable 15"', "Informatique", 350000, 390000, "product01", "ordinateur-portable-15"],
    ["Casque audio studio", "Audio", 45000, 55000, "product02", "casque-audio-studio"],
    ["Tablette 10 pouces", "Informatique", 140000, 160000, "product04", "tablette-10"],
    ["Smartphone 128 Go", "Téléphonie", 120000, 135000, "product07", "smartphone-128"],
    ["Casque sans fil", "Audio", 25000, 30000, "product05", "casque-sans-fil"],
    ["Ordinateur portable gaming", "Informatique", 420000, 470000, "product06", "portable-gaming"],
    ['Ordinateur portable 14"', "Informatique", 280000, 310000, "product08", "ordinateur-portable-14"],
    ["Appareil photo compact", "Photo", 60000, 70000, "product09", "appareil-photo-compact"],
  ]
  const { result: products } = await createProductsWorkflow(container).run({ input: { products: items.map(([title, c, price, old, img, handle]) => ({
    title, handle, status: ProductStatus.PUBLISHED, category_ids: [cat(c)], shipping_profile_id: profile.id,
    description: `${title}, vendu par une boutique agréée. Garantie légale de conformité.`,
    thumbnail: `${front}/img/${img}.png`, images: [{ url: `${front}/img/${img}.png` }],
    sales_channels: [{ id: channel.id }], metadata: { old_price: old, shop_id: shop.id, shop_name: shop.name },
    options: [{ title: "Défaut", values: ["Standard"] }],
    variants: [{ title: "Standard", sku: handle.toUpperCase(), options: { Défaut: "Standard" }, manage_inventory: true, prices: [{ currency_code: "xof", amount: price }] }],
  })) } })
  for (const p of products) await link.create({ [Modules.PRODUCT]: { product_id: p.id }, [LX_MODULE]: { shop_id: shop.id } })

  const { data: variants } = await query.graph({ entity: "product_variant", fields: ["id", "inventory_items.inventory_item_id"] })
  await createInventoryLevelsWorkflow(container).run({ input: { inventory_levels: variants.flatMap((v: any) => v.inventory_items.map((i: any) => ({ inventory_item_id: i.inventory_item_id, location_id: loc.id, stocked_quantity: 10 }))) } })

  logger.info(`Seed Lx terminé. Clé publique (storefront) : ${(pk as any).token}`)
  logger.info("Vendeur démo : boutique@lx.sn / ChangeMe!2026. Créez l'admin : npx medusa user -e admin@lx.sn -p <mot-de-passe>")
}
