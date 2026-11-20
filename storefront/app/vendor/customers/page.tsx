"use client"
import { MessageCircle, Search, Users } from "lucide-react"
import { useEffect, useState } from "react"
import EmptyState from "@/components/ui/EmptyState"
import { Input } from "@/components/ui/Field"
import Skeleton from "@/components/ui/Skeleton"
import Shell, { useVendor } from "@/components/vendor/Shell"
import { fcfa } from "@/lib/medusa"
import { vendorApi } from "@/lib/vendor"

type C = { name: string; phone: string; address: string; orders: number; delivered: number; spent: number; last: string }
function Inner() {
  const { toast } = useVendor(); const [list, setList] = useState<C[] | null>(null), [q, setQ] = useState("")
  useEffect(() => { vendorApi("/customers").then((d) => setList(d.customers)).catch((e) => toast(e.message, true)) }, [toast])
  const shown = (list ?? []).filter((c) => (c.name + c.phone).toLowerCase().includes(q.toLowerCase()))
  return (<div className="space-y-5">
    <div className="relative max-w-sm"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input className="pl-10" placeholder="Nom ou téléphone" aria-label="Rechercher un client" value={q} onChange={(e) => setQ(e.target.value)} /></div>
    {!list ? <Skeleton className="h-64" /> : !shown.length ? <EmptyState icon={Users}>Vos clients apparaissent ici dès que vous confirmez une commande.</EmptyState> :
      <div className="overflow-x-auto rounded-3xl border border-line bg-white"><table className="w-full min-w-[680px] text-sm"><thead className="border-b border-line bg-surface text-left text-xs text-slate-500"><tr><th className="px-5 py-3 font-semibold">Client</th><th className="px-3 py-3 font-semibold">Commandes</th><th className="px-3 py-3 font-semibold">Dépensé (livré)</th><th className="px-3 py-3 font-semibold">Dernière commande</th><th className="px-5 py-3" /></tr></thead>
        <tbody className="divide-y divide-line">{shown.map((c) => (<tr key={c.phone} data-testid="customer-row"><td className="px-5 py-3"><p className="font-bold">{c.name}</p><p className="text-xs text-slate-500">+{c.phone}, {c.address}</p></td><td className="px-3 py-3">{c.orders}{c.orders > 1 && <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-600">Fidèle</span>}</td><td className="px-3 py-3 font-semibold">{fcfa(c.spent)}</td><td className="px-3 py-3 text-slate-500">{new Date(c.last).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</td>
          <td className="px-5 py-3 text-right"><a href={`https://wa.me/${c.phone}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[13px] font-semibold hover:border-brand-600 hover:text-brand-600"><MessageCircle className="size-4" />WhatsApp</a></td></tr>))}</tbody></table></div>}</div>)
}
export default function VendorCustomers() { return <Shell title="Clients" subtitle="Les clients que vous avez servis."><Inner /></Shell> }
