"use client"
import { X } from "lucide-react"
import { useEffect } from "react"

export default function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", k); document.body.style.overflow = "hidden"
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = "" }
  }, [onClose])
  return (<div className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-night/60 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div role="dialog" aria-modal="true" aria-label={title} className="flex max-h-[92dvh] w-full max-w-lg animate-pop-in flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
      <header className="flex shrink-0 items-center justify-between border-b border-line px-6 py-4"><h3 className="text-lg font-bold">{title}</h3>
        <button onClick={onClose} aria-label="Fermer" className="grid size-10 place-items-center rounded-full bg-surface sm:size-8 hover:bg-slate-200"><X className="size-4" /></button></header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">{children}</div>
      {footer && <footer className="pb-safe flex shrink-0 flex-wrap justify-end gap-3 border-t border-line bg-slate-50 px-5 pt-4 sm:px-6">{footer}</footer>}
    </div></div>)
}
