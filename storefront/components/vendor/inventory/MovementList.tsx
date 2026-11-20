import { cn } from "@/lib/cn"
import Badge from "@/components/ui/Badge"
import { REASON, type Movement } from "./labels"

export default function MovementList({ movements, showProduct }: { movements: Movement[]; showProduct?: boolean }) {
  return (<ul className="divide-y divide-line" data-testid="movements">{movements.map((m) => (
    <li key={m.id} className={cn("grid items-center gap-x-4 gap-y-1 py-3 text-sm", showProduct ? "grid-cols-[7.5rem_9.5rem_1fr_3.5rem_5.5rem] max-md:grid-cols-[1fr_auto_auto]" : "grid-cols-[7.5rem_9.5rem_3.5rem_5.5rem] max-md:grid-cols-[1fr_auto_auto]")}>
      <span className="text-xs text-slate-500">{new Date(m.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
      <Badge tone={REASON[m.reason]?.tone ?? "gray"} className="justify-self-start">{REASON[m.reason]?.label ?? m.reason}</Badge>
      {showProduct && <span className="min-w-0 flex-1 truncate font-semibold">{m.product_title}</span>}
      <span className={cn("w-14 text-right font-display font-bold", m.delta > 0 ? "text-brand-600" : m.delta < 0 ? "text-bissap" : "text-slate-400")}>{m.delta > 0 ? "+" : ""}{m.delta}</span>
      <span className="text-right text-slate-500">stock {m.balance_after}</span>
      {m.note && <span className="col-span-full text-xs text-slate-500">{m.note}</span>}</li>))}</ul>)
}
