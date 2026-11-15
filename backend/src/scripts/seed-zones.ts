import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createPromotionsWorkflow, createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"

// Zones de livraison (frais différents selon la zone). Idempotent : ne crée que ce qui manque.
const ZONES = [
  { name: "Dakar centre (Plateau, Médina, Fann, Point E)", price: 1000, code: "dakar-centre" },
  { name: "Dakar élargi (Almadies, Ouakam, Parcelles, Mermoz)", price: 1500, code: "dakar-large" },
  { name: "Banlieue (Pikine, Guédiawaye, Rufisque)", price: 2500, code: "banlieue" },
]
// Code promo de démonstration : -10 % sur les produits. D'autres codes se créent dans l'admin Medusa (menu Promotions).
async function seedPromo(container: any) {
  const promo = container.resolve(Modules.PROMOTION)
  if ((await promo.listPromotions({ code: ["BIENVENUE10"] })).length) return
  await createPromotionsWorkflow(container).run({ input: { promotionsData: [{ code: "BIENVENUE10", type: "standard", status: "active", application_method: { type: "percentage", target_type: "items", allocation: "across", value: 10, currency_code: "xof" } }] } })
}
export default async function seedZones({ container }: ExecArgs) {
  const fulfillment = container.resolve(Modules.FULFILLMENT), query = container.resolve(ContainerRegistrationKeys.QUERY), logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  await seedPromo(container)
  const existing = await fulfillment.listShippingOptions({})
  const base: any = existing.find((o: any) => o.name === "Livraison Lx" || o.name === "Autres zones de Dakar")
  if (!base) { logger.info("Zones : lancez d'abord le seed Lx."); return }
  if (base.name === "Livraison Lx") await fulfillment.updateShippingOptions(base.id, { name: "Autres zones de Dakar" })
  const { data: regions } = await query.graph({ entity: "region", fields: ["id"] })
  const [profile] = await fulfillment.listShippingProfiles({ type: "default" })
  const todo = ZONES.filter((z) => !existing.some((o: any) => o.name === z.name))
  if (!todo.length) { logger.info("Zones de livraison déjà présentes."); return }
  await createShippingOptionsWorkflow(container).run({ input: todo.map((z) => ({
    name: z.name, price_type: "flat" as const, provider_id: "manual_manual", service_zone_id: base.service_zone_id, shipping_profile_id: profile.id,
    type: { label: z.name, description: "Un livreur Lx récupère le colis scellé et vous le livre.", code: z.code },
    prices: [{ currency_code: "xof", amount: z.price }, { region_id: regions[0].id, amount: z.price }],
    rules: [{ attribute: "enabled_in_store", value: "true", operator: "eq" as const }, { attribute: "is_return", value: "false", operator: "eq" as const }],
  })) })
  logger.info(`${todo.length} zone(s) de livraison ajoutée(s).`)
}
