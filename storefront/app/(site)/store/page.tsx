import AdSlot from "@/components/ads/AdSlot"
import { PackageSearch } from "lucide-react"
import Link from "next/link"
import ProductGrid from "@/components/product/ProductGrid"
import Banner from "@/components/ui/Banner"
import Container from "@/components/ui/Container"
import EmptyState from "@/components/ui/EmptyState"
import PageHeader from "@/components/ui/PageHeader"
import { cn } from "@/lib/cn"
import { listCategories, listProducts } from "@/lib/medusa"
export const dynamic = "force-dynamic"

export default async function Store({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const { q, cat } = await searchParams
  const [products, cats] = await Promise.all([listProducts({ q, category_id: cat }).catch(() => []), listCategories().catch(() => [])])
  const chip = (on: boolean) => cn("rounded-full border px-4 py-1.5 text-sm font-semibold transition", on ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white hover:border-brand-600 hover:text-brand-600")
  return (<>
    <PageHeader title={q ? `Résultats pour « ${q} »` : "Tous les produits"}>{products.length} produit(s) chez nos boutiques agréées</PageHeader>
    <Container className="py-8">
      <div className="mb-6 flex flex-wrap gap-2"><Link href="/store" className={chip(!cat)}>Tout</Link>{cats.map((c) => <Link key={c.id} href={`/store?cat=${c.id}`} className={chip(cat === c.id)}>{c.name}</Link>)}</div>
      <AdSlot slot="store_top" className="mb-6 !px-0" />
      {products.length ? <ProductGrid products={products} /> : <EmptyState icon={PackageSearch}>Aucun produit trouvé.</EmptyState>}
      <Banner tone="info" className="mt-8"><strong>Produit introuvable ?</strong> Avec <Link className="font-bold underline" href={`/outiko?type=outiko&details=${encodeURIComponent(q || "")}`}>OUTIKO</Link>, l&apos;équipe Lx le recherche pour vous.</Banner>
    </Container></>)
}
