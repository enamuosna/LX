"use client"
import { ShoppingBag, Trash2 } from "lucide-react"
import Link from "next/link"
import { QtyStepper } from "@/components/product/AddToCartForm"
import Button from "@/components/ui/Button"
import Container from "@/components/ui/Container"
import EmptyState from "@/components/ui/EmptyState"
import PageHeader from "@/components/ui/PageHeader"
import { useCart } from "@/lib/cart"
import { fcfa, img } from "@/lib/medusa"

export default function CartPage() {
  const { cart, setQty, remove, busy } = useCart(); const items = cart?.items ?? []
  return (<><PageHeader title="Ma commande" />
    <Container className="py-8">{!items.length
      ? <EmptyState icon={ShoppingBag} action={<Button href="/store">Parcourir les produits</Button>}>Votre commande est vide.</EmptyState>
      : <div className="grid gap-8 lg:grid-cols-3">
        <ul className="divide-y divide-line rounded-2xl border border-line lg:col-span-2" data-testid="cart-lines">{items.map((i) => (
          <li key={i.id} className="flex flex-wrap items-center gap-4 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(i.thumbnail)} alt="" className="size-16 rounded-xl bg-surface object-contain p-1" />
            <div className="min-w-40 flex-1"><p className="font-bold">{i.title}</p><p className="text-sm text-slate-500">{fcfa(i.unit_price)}</p></div>
            <QtyStepper value={i.quantity} disabled={busy} max={99} onChange={(n) => setQty(i.id, n)} />
            <p className="w-28 text-right font-bold text-brand-600">{fcfa(i.unit_price * i.quantity)}</p>
            <button onClick={() => remove(i.id)} disabled={busy} aria-label="Retirer" className="grid size-9 place-items-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button></li>))}</ul>
        <aside className="h-fit space-y-4 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-bold">Récapitulatif</h2>
          <div className="flex justify-between"><span>Sous-total produits</span><strong data-testid="cart-subtotal">{fcfa(cart!.subtotal)}</strong></div>
          <p className="text-sm text-slate-500">Les frais de livraison Lx sont ajoutés à l&apos;étape suivante.</p>
          <Button href="/checkout" size="lg" full>Valider ma commande</Button>
          <Link href="/store" className="block text-center text-sm font-semibold text-brand-600">Continuer mes achats</Link></aside></div>}
    </Container></>)
}
