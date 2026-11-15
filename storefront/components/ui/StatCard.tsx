import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/cn"
const tones = { orange: "bg-amber-100 text-amber-800", blue: "bg-blue-100 text-blue-700", green: "bg-brand-50 text-brand-600", yellow: "bg-yellow-100 text-yellow-800" }
export default function StatCard({ icon: Icon, value, label, tone, highlight }: { icon: LucideIcon; value: React.ReactNode; label: string; tone: keyof typeof tones; highlight?: boolean }) {
  return (<div className={cn("flex items-center gap-3.5 rounded-2xl border bg-white p-4", highlight ? "border-amber-300 bg-amber-50/50" : "border-line")}>
    <div className={cn("grid size-11 shrink-0 place-items-center rounded-xl", tones[tone])}><Icon className="size-5" /></div>
    <div className="min-w-0"><div className="text-xl font-bold leading-tight sm:text-2xl">{value}</div><div className="text-[13px] text-slate-500">{label}</div></div></div>)
}
