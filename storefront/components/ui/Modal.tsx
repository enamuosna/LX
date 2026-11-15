"use client"
import { X } from "lucide-react"
import { useEffect } from "react"

export default function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", k); document.body.style.overflow = "hidden"
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = "" }
  }, [onClose])
  return (<div className="fixed inset-0 z-50 grid animate-fade-in place-items-center bg-night/60 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[92vh] w-full max-w-lg overflow-auto rounded-2xl bg-white shadow-2xl">
      <header className="flex items-center justify-between border-b border-line px-6 py-4"><h3 className="text-lg font-bold">{title}</h3>
        <button onClick={onClose} aria-label="Fermer" className="grid size-8 place-items-center rounded-full bg-surface hover:bg-slate-200"><X className="size-4" /></button></header>
      <div className="p-6">{children}</div>
      {footer && <footer className="flex justify-end gap-3 border-t border-line bg-slate-50 px-6 py-4">{footer}</footer>}
    </div></div>)
}
