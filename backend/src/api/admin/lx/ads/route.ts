import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { cleanAd, SLOTS } from "../../../../lib/ads"
import { lx } from "../../../../lib/lx"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ ads: await lx(req.scope).listAds({}, { order: { created_at: "DESC" } }), slots: SLOTS })
}
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const d = cleanAd((req.body || {}) as any)
    for (const k of ["slot", "advertiser", "title", "image_url", "link_url"]) if (!d[k]) return res.status(400).json({ message: "Emplacement, annonceur, titre, image et lien sont requis." })
    res.status(201).json({ ad: await lx(req.scope).createAds(d as any) })
  } catch (e: any) { res.status(400).json({ message: e.message }) }
}
