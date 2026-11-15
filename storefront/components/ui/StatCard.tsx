"use client"
import type { LucideIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/cn"

const tones = { orange: "bg-amber-100 text-amber-800", blue: "bg-sky-100 text-sky-700", green: "bg-brand-50 text-brand-600", yellow: "bg-accent-500/25 text-yellow-800" }

/** Nombre qui monte en douceur vers sa valeur. */
export function CountUp({ value, format = (n: number) => String(n) }: { value: number; format?: (n: number) => string }) {
  const [v, setV] = useState(0), from = useRef(0)
  useEffect(() => {
    const start = from.current, t0 = performance.now(), dur = 700; let raf = 0
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); setV(Math.round(start + (value - start) * e)); if (p < 1) raf = requestAnimationFrame(tick); else from.current = value }
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{format(v)}</>
}

export default function StatCard({ icon: Icon, value, label, tone, highlight }: { icon: LucideIcon; value: React.ReactNode; label: string; tone: keyof typeof tones; highlight?: boolean }) {
  return (<div className={cn("flex items-center gap-4 rounded-3xl border p-5 transition hover:-translate-y-0.5", highlight ? "border-accent-500 bg-accent-500/10" : "border-line bg-white")}>
    <div className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", tones[tone])}><Icon className="size-5" /></div>
    <div className="min-w-0"><div className="font-display text-2xl font-bold leading-tight sm:text-[1.7rem]">{value}</div><div className="text-[13px] text-slate-500">{label}</div></div></div>)
}
