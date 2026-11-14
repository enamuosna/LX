import { notFound } from "next/navigation"
import AddToCart from "@/components/AddToCart"
import { fcfa, listProducts, price, stock } from "@/lib/medusa"
export const dynamic = "force-dynamic"

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const [p] = await listProducts({ handle }).catch(() => [])
  if (!p) notFound()
  const s = stock(p), old = p.metadata?.old_price
  return (<div className="section"><div className="container"><div className="row">
    <div className="col-md-5"><img src={p.thumbnail || "/img/product01.png"} alt="" style={{ width: "100%", border: "1px solid #E4E7ED" }} /></div>
    <div className="col-md-7"><p style={{ textTransform: "uppercase", color: "#8D99AE" }}>{p.categories?.[0]?.name}</p><h2>{p.title}</h2>
      <h3 style={{ color: "#0B7A43" }}>{fcfa(price(p))} {old ? <del className="product-old-price">{fcfa(old)}</del> : null}</h3>
      <p>{s > 0 ? <span style={{ color: "#0B7A43" }}><i className="fa fa-check-circle" /> En stock ({s})</span> : <span style={{ color: "#b00020" }}>Rupture de stock</span>}{p.metadata?.shop_name && <> · Vendu par <strong>{p.metadata.shop_name}</strong></>}</p>
      <p style={{ whiteSpace: "pre-line" }}>{p.description}</p>
      {s > 0 && p.variants?.[0] && <AddToCart variantId={p.variants[0].id} max={s} />}
      <div className="lx-notice">Lx n&apos;effectue pas de contrôle qualité : la conformité du produit relève de la boutique agréée.</div></div>
  </div></div></div>)
}
