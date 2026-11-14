import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

// Renvoie la clé publiable de la vitrine (publique par conception). Permet à la vitrine de se configurer toute seule.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const keys = await req.scope.resolve(Modules.API_KEY).listApiKeys({ type: "publishable", title: "Vitrine Lx" } as any)
  if (!keys.length) return res.status(404).json({ message: "Seed non appliqué." })
  res.json({ publishable_key: (keys[0] as any).token })
}
