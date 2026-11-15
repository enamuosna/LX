import { Store } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import ProductReviews from "@/components/product/ProductReviews"
import FavoriteButton from "@/components/product/FavoriteButton"
import { Stars } from "@/components/ui/Stars"
import AddToCartForm from "@/components/product/AddToCartForm"
import StockBadge from "@/components/product/StockBadge"
import Banner from "@/components/ui/Banner"
import Container from "@/components/ui/Container"
import Price from "@/components/ui/Price"
import { getRatings, img, listProducts, price, stock } from "@/lib/medusa"
export const dynamic = "force-dynamic"

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const [p] = await listProducts({ handle }).catch(() => [])
  if (!p) notFound()
  const s = stock(p), rating = (await getRatings([p.id]))[p.id]
  return (<Container className="py-10"><div className="grid gap-10 md:grid-cols-2">
    <div className="grid aspect-square place-items-center rounded-3xl bg-surface p-8">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={img(p.thumbnail)} alt={p.title} className="max-h-full object-contain" /></div>
    <div className="space-y-4">
      <Link href="/store" className="text-sm font-semibold text-slate-500 hover:text-brand-600">{p.categories?.[0]?.name ?? "Produits"}</Link>
      <div className="flex items-start justify-between gap-4"><h1 className="text-4xl font-extrabold">{p.title}</h1><FavoriteButton id={p.id} className="shrink-0 border border-line" /></div>
      {rating && rating.count > 0 && <a href="#avis" className="flex items-center gap-2 text-sm text-slate-600"><Stars value={rating.avg} size="size-5" />{rating.avg} sur 5 ({rating.count} avis)</a>}
      <Price amount={price(p)} old={p.metadata?.old_price} className="text-3xl" />
      <div className="flex flex-wrap items-center gap-3 text-sm"><StockBadge stock={s} />{s > 0 && <span className="text-slate-500">({s} disponible{s > 1 ? "s" : ""})</span>}
        {p.metadata?.shop_name && <span className="inline-flex items-center gap-1.5 text-slate-600"><Store className="size-4" />Vendu par <strong>{p.metadata.shop_name}</strong></span>}</div>
      <p className="whitespace-pre-line text-slate-600">{p.description}</p>
      {s > 0 && p.variants?.[0] && <AddToCartForm variantId={p.variants[0].id} max={s} />}
      <Banner tone="warn">Lx n&apos;effectue pas de contrôle qualité : la conformité du produit relève de la boutique agréée.</Banner></div>
  </div><ProductReviews productId={p.id} /></Container>)
}
