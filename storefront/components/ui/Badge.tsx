import { cn } from "@/lib/cn"
export type Tone = "green" | "orange" | "red" | "blue" | "gray" | "dark" | "solid"
const tones: Record<Tone, string> = {
  green: "bg-brand-50 text-brand-600", orange: "bg-amber-100 text-amber-800", red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700", gray: "bg-slate-200 text-slate-700", dark: "bg-night text-white", solid: "bg-brand-600 text-white",
}
export default function Badge({ tone = "gray", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold", tones[tone], className)}>{children}</span>
}
