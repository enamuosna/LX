"use client"
import { Check } from "lucide-react"
import { useState } from "react"
import Button from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Field"
import { StarInput } from "@/components/ui/Stars"
import { useToast } from "@/components/ui/Toast"
import { post } from "@/lib/medusa"

export default function ReviewForm({ refNo, phone, item }: { refNo: string; phone: string; item: { product_id: string; title: string } }) {
  const toast = useToast(); const [rating, setRating] = useState(0), [comment, setComment] = useState(""), [busy, setBusy] = useState(false), [done, setDone] = useState(false)
  if (done) return <p className="flex items-center gap-2 text-sm font-semibold text-brand-600"><Check className="size-4" />Merci pour votre avis sur {item.title}.</p>
  return (<form data-testid="review-form" className="space-y-2 rounded-2xl bg-surface p-4" onSubmit={async (e) => {
    e.preventDefault(); if (!rating) return toast("Choisissez une note de 1 à 5.", true); setBusy(true)
    try { await post("/store/lx/reviews", { ref: refNo, phone, product_id: item.product_id, rating, comment }); setDone(true) } catch (er: any) { toast(er.message, true); setBusy(false) }
  }}>
    <p className="text-sm font-semibold">Notez : {item.title}</p><StarInput value={rating} onChange={setRating} />
    <Textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Votre avis (facultatif)" aria-label="Votre avis" /><Button size="sm" loading={busy}>Publier mon avis</Button></form>)
}
