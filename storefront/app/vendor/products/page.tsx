"use client"
import { Boxes, Plus, Search } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import Banner from "@/components/ui/Banner"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import { Input } from "@/components/ui/Field"
import Skeleton from "@/components/ui/Skeleton"
import ProductFormModal from "@/components/vendor/ProductFormModal"
import Shell, { useVendor } from "@/components/vendor/Shell"
import VendorProductCard from "@/components/vendor/VendorProductCard"
import { vendorApi } from "@/lib/vendor"

function Products() {
  const { shop, toast } = useVendor(); const approved = shop.status === "approved"
  const [list, setList] = useState<any[] | null>(null), [q, setQ] = useState(""), [modal, setModal] = useState<null | "new" | any>(null)
  const load = useCallback(() => vendorApi("/products").then((d) => setList(d.products)).catch((e) => toast(e.message, true)), [toast])
  useEffect(() => { load() }, [load])
  const toggle = async (p: any) => { try { await vendorApi(`/products/${p.id}`, { active: p.status !== "published" }); toast(p.status === "published" ? "Produit masqué de la vitrine." : "Produit publié."); load() } catch (e: any) { toast(e.message, true) } }
  const shown = (list || []).filter((p) => p.title.toLowerCase().includes(q.toLowerCase()))
  return (<div className="space-y-6">
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-52 max-w-sm flex-1"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input className="pl-10" placeholder="Rechercher un produit…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher un produit" /></div>
      <span className="text-sm text-slate-500">{shown.length} produit(s)</span>
      <Button className="ml-auto" disabled={!approved} onClick={() => setModal("new")} data-testid="add-product"><Plus className="size-4" />Ajouter un produit</Button></div>
    {!approved && <Banner tone="info">L&apos;ajout et la modification de produits seront disponibles une fois votre boutique agréée.</Banner>}
    {!list ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-72" />)}</div>
      : !shown.length ? <EmptyState icon={Boxes}>{q ? "Aucun produit ne correspond." : "Aucun produit pour le moment. Ajoutez votre premier produit !"}</EmptyState>
      : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{shown.map((p) => <VendorProductCard key={p.id} p={p} canEdit={approved} onToggle={() => toggle(p)} onEdit={() => setModal(p)} />)}</div>}
    {modal && <ProductFormModal product={modal === "new" ? undefined : modal} onDone={load} onClose={() => setModal(null)} />}
  </div>)
}
export default function VendorProducts() { return <Shell title="Mes produits" subtitle="Gérez votre catalogue, vos prix et votre stock."><Products /></Shell> }
