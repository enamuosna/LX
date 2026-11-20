import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { isActiveNow, SLOTS } from "../../../../lib/ads"
import { lx } from "../../../../lib/lx"

// Publicités actives d'un emplacement. Aucun champ interne (annonceur, compteurs) n'est exposé.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const slot = String(req.query.slot || "")
  if (!SLOTS[slot]) return res.json({ ads: [] })
  const ads = (await lx(req.scope).listAds({ slot, active: true } as any)).filter((a: any) => isActiveNow(a))
  res.json({ ads: ads.map((a: any) => ({ id: a.id, title: a.title, image_url: a.image_url, link_url: a.link_url, priority: a.priority })) })
}
