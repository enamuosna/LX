import { Check } from "lucide-react"
import { cn } from "@/lib/cn"
/** Progression horizontale : le trait se remplit en douceur quand l'étape avance. */
export default function Stepper({ steps, current, finished }: { steps: string[]; current: number; finished?: boolean }) {
  const n = steps.length, idx = finished ? n - 1 : current, left = `${50 / n}%`
  return (<div className="relative mx-6 mt-6">
    <span className="absolute top-[10px] h-1 rounded bg-line" style={{ left, right: left }} aria-hidden />
    <span className="absolute top-[10px] h-1 rounded bg-brand-600 transition-[width] duration-700 ease-out" style={{ left, width: `${(idx / n) * 100}%` }} aria-hidden />
    <ol className="relative flex">{steps.map((s, i) => {
      const done = i < idx || !!finished, cur = i === idx && !finished
      return (<li key={s} className="flex-1 text-center text-xs font-semibold">
        <span className={cn("relative mx-auto mb-2 grid size-6 place-items-center rounded-full border-[3px] transition-all duration-500", done ? "border-brand-600 bg-brand-600 text-white" : cur ? "border-brand-600 bg-white" : "border-line bg-white")}>
          {done && <Check className="size-3 animate-pop-in" strokeWidth={4} />}{cur && <span className="absolute inset-0 animate-ping-soft rounded-full bg-brand-600/40" />}</span>
        <span className={cn("transition-colors", done ? "text-brand-600" : cur ? "text-ink" : "text-slate-400")}>{s}</span></li>)
    })}</ol></div>)
}
