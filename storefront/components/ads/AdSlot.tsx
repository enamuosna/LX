"use client"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/cn"
import { img } from "@/lib/medusa"

type Ad = { id: string; title: string; image_url: string; link_url: string; priority: number }
const SIZES: Record<string, string> = { home_banner: "aspect-[4/1]", store_top: "aspect-[6/1]", product_side: "aspect-[3/2]", cart_bottom: "aspect-[6/1]" }

/** Emplacement publicitaire : n'affiche rien (et ne réserve aucune place) quand aucune publicité n'est en ligne. */
export default function AdSlot({ slot, className }: { slot: string; className?: string }) {
  const [ad, setAd] = useState<Ad | null>(null), ref = useRef<HTMLAnchorElement>(null), counted = useRef(false)
  useEffect(() => {
    let off = false
    fetch(`/medusa/store/lx/ads?slot=${slot}`).then((r) => r.json()).then((d) => {
      const list: Ad[] = d.ads ?? []; if (off || !list.length) return
      // tirage pondéré par la priorité (priorité 0 = poids 1)
      let r = Math.random() * list.reduce((s, a) => s + a.priority + 1, 0)
      setAd(list.find((a) => (r -= a.priority + 1) < 0) ?? list[0])
    }).catch(() => {})
    return () => { off = true }
  }, [slot])
  useEffect(() => {
    if (!ad || !ref.current || counted.current) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !counted.current) { counted.current = true; fetch("/medusa/store/lx/ads/impression", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: ad.id }), keepalive: true }).catch(() => {}); io.disconnect() } }, { threshold: 0.5 })
    io.observe(ref.current); return () => io.disconnect()
  }, [ad])
  if (!ad) return null
  const external = /^https?:\/\//.test(ad.link_url)
  return (
    <aside aria-label="Publicité" className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6", className)} data-testid="ad-slot" data-slot={slot}>
      <a ref={ref} href={ad.link_url} target={external ? "_blank" : undefined} rel="sponsored noopener noreferrer" onClick={() => { fetch(`/medusa/store/lx/ads/${ad.id}/click`, { method: "POST", keepalive: true }).catch(() => {}) }}
        className={cn("relative block overflow-hidden rounded-3xl bg-surface ring-1 ring-line transition hover:ring-brand-600", SIZES[slot])}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img(ad.image_url)} alt={ad.title} loading="lazy" className="size-full object-cover" />
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">Publicité</span>
      </a>
    </aside>
  )
}
