import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx } from "../../../../../lib/lx"

// Une impression est comptée quand la publicité est réellement visible à l'écran (une fois par affichage de page).
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const id = String((req.body as any)?.id || ""), svc = lx(req.scope), [a] = id ? await svc.listAds({ id } as any) : []
  if (a) await svc.updateAds({ id: a.id, impressions: Number(a.impressions) + 1 } as any)
  res.json({ ok: true })
}
