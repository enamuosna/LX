"use client"
import { ChevronDown, PackageOpen } from "lucide-react"
import { useEffect, useState } from "react"
import Tracking from "@/components/order/Tracking"
import EmptyState from "@/components/ui/EmptyState"
import Skeleton from "@/components/ui/Skeleton"
import Button from "@/components/ui/Button"
import { customerApi } from "@/lib/customer"
import { cn } from "@/lib/cn"
import { fcfa } from "@/lib/medusa"

export default function OrdersTab() {
  const [orders, setOrders] = useState<any[] | null>(null), [open, setOpen] = useState<string | null>(null)
  useEffect(() => { customerApi("/store/orders?order=-created_at&fields=id,display_id,created_at,total,*items,*shipping_address").then((d) => setOrders(d.orders)).catch(() => setOrders([])) }, [])
  if (!orders) return <div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
  if (!orders.length) return <EmptyState icon={PackageOpen} action={<Button href="/store">Parcourir les produits</Button>}>Aucune commande pour le moment.</EmptyState>
  return (<ul className="space-y-3">{orders.map((o) => (<li key={o.id} data-testid="account-order" className="overflow-hidden rounded-3xl border border-line">
    <button className="flex w-full items-center gap-4 p-5 text-left" aria-expanded={open === o.id} onClick={() => setOpen(open === o.id ? null : o.id)}>
      <div className="flex-1"><p className="font-display text-lg font-bold">Commande #{o.display_id}</p><p className="text-sm text-slate-500">{new Date(o.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}, {o.items?.length} article(s)</p></div>
      <b>{fcfa(o.total)}</b><ChevronDown className={cn("size-5 text-slate-400 transition-transform", open === o.id && "rotate-180")} /></button>
    {open === o.id && <div className="animate-fade-in border-t border-line bg-surface/60 p-5"><Tracking refNo={String(o.display_id)} phone={String(o.shipping_address?.phone || "").replace(/\D/g, "")} /></div>}</li>))}</ul>)
}
