import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react"
import { cn } from "@/lib/cn"
type Tone = "info" | "warn" | "danger" | "success"
const styles: Record<Tone, string> = { info: "border-blue-200 bg-blue-50 text-blue-900", warn: "border-amber-200 bg-amber-50 text-amber-900", danger: "border-red-200 bg-red-50 text-red-900", success: "border-brand-200 bg-brand-50 text-brand-800" }
const icons = { info: Info, warn: AlertTriangle, danger: XCircle, success: CheckCircle2 }
export default function Banner({ tone = "info", title, children, className }: { tone?: Tone; title?: string; children?: React.ReactNode; className?: string }) {
  const I = icons[tone]
  return (<div role={tone === "danger" ? "alert" : "status"} className={cn("flex gap-3 rounded-2xl border px-4 py-3.5 text-sm", styles[tone], className)}>
    <I className="mt-0.5 size-5 shrink-0" /><div>{title && <p className="font-bold">{title}</p>}{children && <div className={title ? "mt-0.5" : ""}>{children}</div>}</div></div>)
}
