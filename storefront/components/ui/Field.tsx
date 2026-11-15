import { forwardRef, useId } from "react"
import { cn } from "@/lib/cn"

const ctl = "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 transition focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-50 disabled:bg-slate-50"
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => <input ref={ref} className={cn(ctl, className)} {...p} />)
Input.displayName = "Input"
export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => <textarea ref={ref} rows={4} className={cn(ctl, "resize-y", className)} {...p} />)
Textarea.displayName = "Textarea"

/** Champ de formulaire : libellé + contrôle + aide. Le contrôle reçoit l'id automatiquement. */
export function Field({ label, hint, children, className }: { label: string; hint?: string; children: (id: string) => React.ReactNode; className?: string }) {
  const id = useId()
  return (<div className={cn("space-y-1.5", className)}>
    <label htmlFor={id} className="block text-[13px] font-semibold text-slate-700">{label}</label>
    {children(id)}{hint && <p className="text-xs text-slate-500">{hint}</p>}</div>)
}
