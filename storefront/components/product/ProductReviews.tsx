"use client"
import { MessageSquareText } from "lucide-react"
import { useEffect, useState } from "react"
import { Stars } from "@/components/ui/Stars"
import { store } from "@/lib/medusa"

type R = { id: string; author: string; rating: number; comment?: string | null; created_at: string }
export default function ProductReviews({ productId }: { productId: string }) {
  const [list, setList] = useState<R[] | null>(null), [avg, setAvg] = useState(0)
  useEffect(() => { store(`/store/lx/reviews?product_id=${productId}`).then((d) => { setList(d.reviews || []); setAvg(d.summary[productId]?.avg || 0) }).catch(() => setList([])) }, [productId])
  return (<section className="mt-16" aria-labelledby="avis"><div className="flex flex-wrap items-baseline gap-4"><h2 id="avis" className="text-2xl font-bold">Avis des clients</h2>
    {!!list?.length && <span className="flex items-center gap-2 text-sm text-slate-600"><Stars value={avg} size="size-5" /><b>{avg}</b> sur 5 ({list.length})</span>}</div>
    {list && !list.length && <p className="mt-4 flex items-center gap-3 rounded-2xl bg-surface p-5 text-slate-600"><MessageSquareText className="size-5 shrink-0 text-slate-400" />Pas encore d&apos;avis. Après une livraison, notez le produit depuis le suivi de votre commande.</p>}
    <ul className="mt-6 grid gap-4 md:grid-cols-2">{list?.map((r) => (<li key={r.id} data-testid="review" className="rounded-2xl border border-line p-5">
      <div className="flex items-center justify-between"><b>{r.author}</b><Stars value={r.rating} /></div>{r.comment && <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{r.comment}</p>}
      <p className="mt-2 text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p></li>))}</ul></section>)
}
