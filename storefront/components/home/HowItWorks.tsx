"use client"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/cn"

const STEPS = [["Je cherche", "Je tape le produit voulu, le site me montre les boutiques qui l'ont."], ["Je choisis", "Je compare prix et disponibilité, puis je valide ma commande."], ["La boutique confirme", "Elle reçoit une alerte WhatsApp. Sans réponse sous 30 minutes, Lx prend le relais."], ["Je suis livré", "Un livreur Lx récupère le colis scellé. Je suis la commande avec son numéro."]]

/** Étapes réellement séquentielles : le trait se remplit quand la section entre à l'écran. */
export default function HowItWorks() {
  const ref = useRef<HTMLOListElement>(null), [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }, { threshold: 0.35 })
    io.observe(el); return () => io.disconnect()
  }, [])
  return (<ol ref={ref} className="relative grid gap-10 md:grid-cols-4 md:gap-6">
    <span className="absolute left-5 top-5 hidden h-0.5 bg-line md:block" style={{ right: "12.5%", left: "12.5%" }} />
    <span className="absolute top-5 hidden h-0.5 bg-brand-600 transition-[width] duration-[1600ms] ease-out md:block" style={{ left: "12.5%", width: on ? "75%" : "0%" }} />
    <span className="absolute bottom-5 left-5 top-5 w-0.5 bg-line md:hidden" /><span className="absolute left-5 top-5 w-0.5 bg-brand-600 transition-[height] duration-[1600ms] ease-out md:hidden" style={{ height: on ? "calc(100% - 2.5rem)" : "0" }} />
    {STEPS.map(([t, d], i) => (<li key={t} className="relative flex gap-5 md:block md:text-center" style={{ transitionDelay: `${i * 350}ms` }}>
      <span className={cn("relative z-10 grid size-10 shrink-0 place-items-center rounded-full border-2 font-display text-base font-bold transition-all duration-500 md:mx-auto", on ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white text-slate-400")} style={{ transitionDelay: `${i * 380}ms` }}>{i + 1}</span>
      <div className="md:mt-5"><h3 className="text-lg font-bold">{t}</h3><p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">{d}</p></div></li>))}
  </ol>)
}
