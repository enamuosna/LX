import { Store } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import AddToCartForm from "@/components/product/AddToCartForm"
import StockBadge from "@/components/product/StockBadge"
import Banner from "@/components/ui/Banner"
import Container from "@/components/ui/Container"
import Price from "@/components/ui/Price"
import { img, listProducts, price, stock } from "@/lib/medusa"
export const dynamic = "force-dynamic"

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const [p] = await listProducts({ handle }).catch(() => [])
  if (!p) notFound()
  const s = stock(p)
  return (<Container className="py-10"><div className="grid gap-10 md:grid-cols-2">
    <div className="grid aspect-square place-items-center rounded-2xl border border-line bg-surface p-6">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={img(p.thumbnail)} alt={p.title} className="max-h-full object-contain" /></div>
    <div className="space-y-4">
      <Link href="/store" className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-brand-600">{p.categories?.[0]?.name ?? "Produits"}</Link>
      <h1 className="text-3xl font-extrabold">{p.title}</h1>
      <Price amount={price(p)} old={p.metadata?.old_price} className="text-3xl" />
      <div className="flex flex-wrap items-center gap-3 text-sm"><StockBadge stock={s} />{s > 0 && <span className="text-slate-500">({s} disponible{s > 1 ? "s" : ""})</span>}
        {p.metadata?.shop_name && <span className="inline-flex items-center gap-1.5 text-slate-600"><Store className="size-4" />Vendu par <strong>{p.metadata.shop_name}</strong></span>}</div>
      <p className="whitespace-pre-line text-slate-600">{p.description}</p>
      {s > 0 && p.variants?.[0] && <AddToCartForm variantId={p.variants[0].id} max={s} />}
      <Banner tone="warn">Lx n&apos;effectue pas de contrôle qualité : la conformité du produit relève de la boutique agréée.</Banner></div>
  </div></Container>)
}
