import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import LxModuleService from "../modules/lx/service"
import { LX_MODULE } from "../modules/lx"

export const norm = (p: string) => (p || "").replace(/\D+/g, "")
export const validPhone = (p: string) => { const n = norm(p); return n.length >= 9 && n.length <= 15 }
export const lx = (c: MedusaContainer | any): LxModuleService => c.resolve(LX_MODULE)
export const ESCALATE_MINUTES = Number(process.env.LX_ESCALATE_MINUTES || 30)

/** Envoie un message WhatsApp (API Cloud) si LX_WA_TOKEN et LX_WA_PHONE_ID sont définis. */
export async function waSend(to: string, text: string): Promise<boolean> {
  const token = process.env.LX_WA_TOKEN, id = process.env.LX_WA_PHONE_ID
  if (!token || !id) return false
  try {
    const r = await fetch(`https://graph.facebook.com/v20.0/${id}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to: norm(to), type: "text", text: { body: text } }),
    })
    return r.ok
  } catch { return false }
}
export const waLink = (phone: string, text: string) => `https://wa.me/${norm(phone)}?text=${encodeURIComponent(text)}`

export function shopAlertText(so: any): string {
  const lines = (so.items as any[]).map((i) => `${i.quantity} × ${i.title} (${i.unit_price} FCFA)`)
  return `🛒 Nouvelle commande Lx #${so.order_display_id}\n${lines.join("\n")}\nTotal produits : ${so.subtotal} FCFA\nMerci de confirmer dans votre espace boutique sous ${ESCALATE_MINUTES} min.`
}

export async function defaultCommerceContext(container: MedusaContainer) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: stores } = await query.graph({ entity: "store", fields: ["id", "default_sales_channel_id", "default_location_id"] })
  const { data: profiles } = await query.graph({ entity: "shipping_profile", fields: ["id"], filters: { type: "default" } })
  return { salesChannelId: stores[0]?.default_sales_channel_id, locationId: stores[0]?.default_location_id, shippingProfileId: profiles[0]?.id }
}
