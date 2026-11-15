"use client"
import { Star } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/cn"

export function Stars({ value, size = "size-4", className }: { value: number; size?: string; className?: string }) {
  return (<span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={`${value} sur 5`}>{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={cn(size, i <= Math.round(value) ? "fill-accent-500 text-accent-500" : "text-slate-300")} />)}</span>)
}
export function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (<span className="inline-flex gap-1" role="radiogroup" aria-label="Note">{[1, 2, 3, 4, 5].map((i) => (
    <button key={i} type="button" role="radio" aria-checked={value === i} aria-label={`${i} étoile${i > 1 ? "s" : ""}`} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => onChange(i)} className="transition active:scale-90">
      <Star className={cn("size-7 transition", i <= (hover || value) ? "scale-110 fill-accent-500 text-accent-500" : "text-slate-300")} /></button>))}</span>)
}
