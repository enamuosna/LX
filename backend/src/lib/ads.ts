// Emplacements publicitaires. Le format d'image conseillé aide l'annonceur à fournir un visuel net.
export const SLOTS: Record<string, { label: string; size: string }> = {
  home_banner: { label: "Accueil, bandeau sous la recherche", size: "1200 x 300 px" },
  store_top: { label: "Catalogue, haut de liste", size: "1200 x 200 px" },
  product_side: { label: "Fiche produit, sous le prix", size: "600 x 400 px" },
  cart_bottom: { label: "Panier, bas de page", size: "1200 x 200 px" },
}
export const isActiveNow = (a: any, now = new Date()) =>
  a.active && (!a.starts_at || new Date(a.starts_at) <= now) && (!a.ends_at || new Date(a.ends_at) >= now)

export function cleanAd(b: any) {
  const out: Record<string, unknown> = {}
  const text = (k: string, max: number) => { if (b[k] !== undefined) out[k] = String(b[k]).trim().slice(0, max) }
  text("advertiser", 120); text("title", 160); text("image_url", 500); text("link_url", 500)
  if (b.slot !== undefined) { if (!SLOTS[b.slot]) throw new Error("Emplacement inconnu."); out.slot = b.slot }
  for (const k of ["image_url", "link_url"]) if (out[k] !== undefined && !/^(https?:\/\/|\/)/.test(String(out[k]))) throw new Error(`${k === "image_url" ? "Adresse de l'image" : "Lien"} invalide (http, https ou /).`)
  if (b.active !== undefined) out.active = !!b.active
  if (b.priority !== undefined) out.priority = Math.max(0, Math.min(100, Math.round(Number(b.priority) || 0)))
  for (const k of ["starts_at", "ends_at"]) if (b[k] !== undefined) out[k] = b[k] ? new Date(b[k]) : null
  return out
}
