import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx } from "../../../../lib/lx"
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ requests: await lx(req.scope).listServiceRequests({}, { order: { created_at: "DESC" }, take: 200 }) })
}
