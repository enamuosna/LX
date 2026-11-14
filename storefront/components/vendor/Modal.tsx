"use client"
import { useEffect } from "react"
export default function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k) }, [onClose])
  return (<div className="vd-ov" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="vd-modal" role="dialog" aria-modal="true">
    <header><h3>{title}</h3><button onClick={onClose} aria-label="Fermer">✕</button></header><div className="bd">{children}</div>{footer && <footer>{footer}</footer>}</div></div>)
}
