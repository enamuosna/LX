import { NextRequest } from "next/server"
import { getPk, SERVER_URL } from "@/lib/medusa"

// Proxy same-origin vers l'API Medusa : le navigateur n'appelle que la vitrine.
// Seules les routes publiques sont exposées : /store, /auth/shop (connexion boutique), /auth/customer (compte client), /vendor (espace boutique).
const ALLOWED = [/^static\//, /^store\//, /^auth\/shop\//, /^auth\/customer\//, /^vendor(\/|$)/]

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/")
  if (!ALLOWED.some((re) => re.test(path))) return Response.json({ message: "Not found" }, { status: 404 })
  const headers = new Headers({ "Content-Type": req.headers.get("content-type") || "application/json" })
  const auth = req.headers.get("authorization"); if (auth) headers.set("Authorization", auth)
  if (path.startsWith("store/") || path.startsWith("auth/customer/")) headers.set("x-publishable-api-key", await getPk())
  const hasBody = !["GET", "HEAD"].includes(req.method)
  const r = await fetch(`${SERVER_URL}/${path}${req.nextUrl.search}`, { method: req.method, headers, body: hasBody ? await req.text() : undefined, cache: "no-store" })
  return new Response(r.body, { status: r.status, headers: { "Content-Type": r.headers.get("content-type") || "application/json" } })
}
export { handler as GET, handler as POST, handler as DELETE, handler as PUT }
