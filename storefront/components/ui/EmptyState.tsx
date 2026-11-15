import type { LucideIcon } from "lucide-react"
export default function EmptyState({ icon: Icon, children, action }: { icon: LucideIcon; children: React.ReactNode; action?: React.ReactNode }) {
  return (<div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500">
    <Icon className="mx-auto mb-3 size-10 text-slate-300" /><div>{children}</div>{action && <div className="mt-4">{action}</div>}</div>)
}
