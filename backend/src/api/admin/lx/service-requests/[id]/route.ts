import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx } from "../../../../../lib/lx"
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const status = (req.body as any)?.status
  if (!["new", "in_progress", "done", "cancelled"].includes(status)) return res.status(400).json({ message: "Statut invalide." })
  res.json({ request: await lx(req.scope).updateServiceRequests({ id: req.params.id, status } as any) })
}
