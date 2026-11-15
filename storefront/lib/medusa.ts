// Navigateur : on passe par le proxy same-origin /medusa (pas de CORS, la clé publique reste côté serveur).
// Serveur (SSR) : appel direct au backend (URL interne Docker ou locale).
const isServer = typeof window === "undefined"
export const SERVER_URL = process.env.MEDUSA_INTERNAL_URL || process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000"
export const BASE = isServer ? SERVER_URL : "/medusa"

let pkCache: string | null = null
/** Clé publiable : variable d'env si fournie, sinon récupérée auprès du backend (/lx-config). */
export async function getPk(): Promise<string> {
  if (pkCache) return pkCache
  const env = process.env.MEDUSA_PK || process.env.NEXT_PUBLIC_MEDUSA_PK
  if (env) return (pkCache = env)
  const r = await fetch(`${SERVER_URL}/lx-config`, { cache: "no-store" })
  if (!r.ok) throw new Error("Backend Lx indisponible ou non initialisé.")
  return (pkCache = (await r.json()).publishable_key)
}

export class ApiError extends Error { status: number; constructor(m: string, s: number) { super(m); this.status = s } }

export async function store<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    ...init, cache: "no-store",
    headers: { "Content-Type": "application/json", ...(isServer ? { "x-publishable-api-key": await getPk() } : {}), ...(init.headers || {}) },
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new ApiError(j.message || `Erreur ${r.status}`, r.status)
  return j as T
}
export const post = <T = any>(path: string, body: unknown) => store<T>(path, { method: "POST", body: JSON.stringify(body) })

let regionId: string | null = null
export async function getRegionId(): Promise<string> {
  if (regionId) return regionId
  const { regions } = await store<{ regions: { id: string }[] }>("/store/regions")
  if (!regions.length) throw new Error("Aucune région configurée")
  return (regionId = regions[0].id)
}

export type Product = {
  id: string; title: string; handle: string; description?: string | null; thumbnail?: string | null
  metadata?: { old_price?: number; shop_name?: string } | null
  categories?: { id: string; name: string }[]
  variants?: { id: string; inventory_quantity?: number; calculated_price?: { calculated_amount: number } }[]
}
const FIELDS = "id,title,handle,description,thumbnail,metadata,*categories,*variants.calculated_price,+variants.inventory_quantity"

export async function listProducts(opts: { q?: string; category_id?: string; limit?: number; handle?: string } = {}): Promise<Product[]> {
  const p = new URLSearchParams({ region_id: await getRegionId(), fields: FIELDS, limit: String(opts.limit ?? 48) })
  if (opts.q) p.set("q", opts.q)
  if (opts.category_id) p.append("category_id", opts.category_id)
  if (opts.handle) p.set("handle", opts.handle)
  return (await store<{ products: Product[] }>(`/store/products?${p}`)).products
}
export async function listCategories() {
  return (await store<{ product_categories: { id: string; name: string }[] }>("/store/product-categories?limit=50")).product_categories
}
export const price = (p: Product) => p.variants?.[0]?.calculated_price?.calculated_amount ?? 0
export const stock = (p: Product) => p.variants?.[0]?.inventory_quantity ?? 0
export const fcfa = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} FCFA`.replace(/ /g, " ")

/** Les images sont enregistrées avec l'adresse du moment (localhost…) : on les ramène à des chemins relatifs servis par la vitrine. */
export const img = (u?: string | null, fallback = "/img/product01.png"): string => {
  if (!u) return fallback
  const m = u.match(/^https?:\/\/[^/]+(\/img\/.+)$/); if (m) return m[1]
  const st = u.match(/^https?:\/\/[^/]+\/static\/(.+)$/); if (st) return `/medusa/static/${st[1]}`
  return u
}

export type RatingSummary = Record<string, { avg: number; count: number }>
/** Moyenne et nombre d'avis pour une liste de produits (vide si le service est indisponible). */
export async function getRatings(ids: string[]): Promise<RatingSummary> {
  if (!ids.length) return {}
  try { return (await store<{ summary: RatingSummary }>(`/store/lx/reviews?ids=${ids.join(",")}`)).summary } catch { return {} }
}
