import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"

// Envoi d'un visuel publicitaire depuis l'admin : { mime, base64 } -> { url }
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const b = (req.body || {}) as any, ext = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" } as Record<string, string>)[b.mime]
  if (!ext || typeof b.base64 !== "string") return res.status(400).json({ message: "Image JPG, PNG, WebP ou GIF requise." })
  if (b.base64.length > 4.2 * 1024 * 1024) return res.status(400).json({ message: "Image trop lourde (3 Mo maximum)." })
  const { result } = await uploadFilesWorkflow(req.scope).run({ input: { files: [{ filename: `pub-${Date.now()}.${ext}`, mimeType: b.mime, content: b.base64, access: "public" }] } })
  res.status(201).json({ url: result[0].url })
}
