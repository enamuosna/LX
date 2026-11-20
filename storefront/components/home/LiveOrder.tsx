"use client"
import { MessageCircle } from "lucide-react"
import { useEffect, useState } from "react"
import Stepper from "@/components/ui/Stepper"
import { cn } from "@/lib/cn"

const STEPS = ["Reçue", "Confirmée", "En route", "Livrée"]
const BUBBLES = ["La boutique LX-0001 a reçu votre commande.", "La boutique LX-0001 a confirmé. Le colis est en préparation.", "Moussa, livreur Lx, a récupéré le colis scellé.", "Livré à Plateau. Merci d'avoir commandé avec Lx !"]
const STATUS = ["En attente de la boutique", "Confirmée par la boutique", "Colis récupéré, en route", "Livrée"]

/** Démonstration vivante du suivi : une commande qui avance toute seule, comme chez un vrai client. */
export default function LiveOrder() {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % 5), 2600); return () => clearInterval(t) }, [])
  const step = Math.min(i, 3)
  return (<div className="relative mx-auto w-full max-w-md" aria-hidden>
    <div className="absolute -right-6 -top-8 size-44 rounded-full bg-accent-500" />
    <div className="absolute -bottom-6 -left-6 size-24 rounded-full border-[14px] border-brand-600/15" />
    <div className="relative animate-float rounded-[2rem] border border-line bg-white p-2 shadow-[0_30px_60px_-25px_rgba(16,35,26,0.45)]">
      <div className="rounded-[1.6rem] bg-surface p-5">
        <div className="flex items-center justify-between text-sm"><span className="font-display text-lg font-bold">Commande #1042</span>
          <span key={step} className="animate-pop-in rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-600">{STATUS[step]}</span></div>
        <div className="mt-4 flex items-center gap-4 rounded-2xl bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/product02.png" alt="" className="size-16 rounded-xl bg-surface object-contain p-1" />
          <div className="min-w-0 flex-1"><p className="truncate font-bold">Casque audio studio</p><p className="text-sm text-slate-500">Boutique LX-0001, Sandaga</p></div>
          <p className="font-display text-lg font-bold text-brand-600">45 000 F</p></div>
        <div className="-mx-6"><Stepper steps={STEPS} current={step} finished={step === 3} /></div>
        <div className="mt-5 min-h-[3.25rem]"><div key={step} className="flex animate-pop-in items-start gap-2.5 rounded-2xl rounded-tl-sm bg-[#d9fdd3] p-3 text-[13px] leading-snug text-ink">
          <MessageCircle className="mt-0.5 size-4 shrink-0 text-brand-600" />{BUBBLES[step]}</div></div>
      </div></div>
    <div className={cn("absolute -bottom-5 right-4 rounded-full bg-ink px-4 py-2 text-xs font-bold text-white shadow-lg transition-all duration-500", step === 2 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0")}>Colis scellé</div>
  </div>)
}
