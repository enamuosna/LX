import Link from "next/link"
import Grid from "@/components/Grid"
import { listCategories, listProducts } from "@/lib/medusa"
export const dynamic = "force-dynamic"

export default async function Store({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const { q, cat } = await searchParams
  const [products, cats] = await Promise.all([listProducts({ q, category_id: cat }).catch(() => []), listCategories().catch(() => [])])
  return (<>
    <div className="lx-page-title"><div className="container"><h2 style={{ margin: 0 }}>{q ? `Résultats pour « ${q} »` : "Tous les produits"}</h2>
      <p style={{ margin: "5px 0 0" }}>{products.length} produit(s) chez nos boutiques agréées</p>
      <p style={{ margin: "8px 0 0" }}><Link href="/store">Tout</Link>{cats.map((c) => <span key={c.id}> · <Link href={`/store?cat=${c.id}`} style={cat === c.id ? { fontWeight: 700 } : undefined}>{c.name}</Link></span>)}</p></div></div>
    <div className="section"><div className="container"><Grid products={products} />
      {!products.length && <p>Aucun produit trouvé.</p>}
      <div className="lx-notice"><strong>Produit introuvable ?</strong> Avec <Link href={`/outiko?type=outiko&details=${encodeURIComponent(q || "")}`}><strong>OUTIKO</strong></Link>, l&apos;équipe Lx le recherche pour vous.</div></div></div>
  </>)
}
