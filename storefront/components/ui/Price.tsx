import { fcfa } from "@/lib/medusa"
import { cn } from "@/lib/cn"
export default function Price({ amount, old, className }: { amount: number; old?: number | null; className?: string }) {
  return <span className={cn("font-bold text-brand-600", className)}>{fcfa(amount)}{old ? <del className="ml-2 text-xs font-medium text-slate-400">{fcfa(old)}</del> : null}</span>
}
