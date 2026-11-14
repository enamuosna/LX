import { AuthenticatedMedusaRequest } from "@medusajs/framework/http"
import { lx } from "./lx"

/** Boutique liée au compte connecté (acteur « shop »). */
export async function currentShop(req: AuthenticatedMedusaRequest) {
  const id = req.auth_context?.actor_id
  if (!id) throw Object.assign(new Error("Non authentifié"), { status: 401 })
  return await lx(req.scope).retrieveShop(id)
}
