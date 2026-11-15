"use client"
import { CheckCircle2, XCircle } from "lucide-react"
import { createContext, useCallback, useContext, useState } from "react"
import { cn } from "@/lib/cn"

type T = { id: number; msg: string; error: boolean }
const Ctx = createContext<(msg: string, error?: boolean) => void>(() => {})
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<T[]>([])
  const push = useCallback((msg: string, error = false) => {
    const id = Date.now() + Math.random()
    setList((l) => [...l, { id, msg, error }]); setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 3800)
  }, [])
  return (<Ctx.Provider value={push}>{children}
    <div className="pointer-events-none fixed right-4 top-4 z-[60] grid max-w-[calc(100vw-2rem)] gap-2" aria-live="polite">
      {list.map((t) => <div key={t.id} role="status" data-testid="toast" className={cn("pointer-events-auto flex animate-slide-in items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl", t.error ? "bg-red-700" : "bg-night")}>
        {t.error ? <XCircle className="size-5" /> : <CheckCircle2 className="size-5 text-accent-500" />}{t.msg}</div>)}
    </div></Ctx.Provider>)
}
