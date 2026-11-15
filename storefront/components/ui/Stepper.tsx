import { Check } from "lucide-react"
import { cn } from "@/lib/cn"
/** Barre de progression horizontale : étapes terminées, étape courante, étapes à venir. */
export default function Stepper({ steps, current, finished }: { steps: string[]; current: number; finished?: boolean }) {
  return (<ol className="flex px-5 pt-5">{steps.map((s, i) => {
    const done = i < current || !!finished, cur = i === current && !finished
    return (<li key={s} className="relative flex-1 text-center text-[11.5px] font-semibold">
      {i > 0 && <span className={cn("absolute left-[-50%] right-1/2 top-2.5 h-[3px]", done || cur ? "bg-brand-600" : "bg-line")} />}
      <span className={cn("relative z-10 mx-auto mb-1.5 grid size-5 place-items-center rounded-full border-[3px] bg-white", done ? "border-brand-600 bg-brand-600 text-white" : cur ? "border-brand-600 ring-4 ring-brand-50" : "border-line")}>{done && <Check className="size-3" strokeWidth={4} />}</span>
      <span className={cn(done ? "text-brand-600" : cur ? "text-ink" : "text-slate-400")}>{s}</span></li>)
  })}</ol>)
}
