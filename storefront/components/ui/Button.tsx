import Link from "next/link"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/cn"

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent" | "dark"
type Size = "sm" | "md" | "lg"
const base = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700",
  secondary: "border border-line bg-white text-ink hover:border-brand-600 hover:text-brand-600",
  ghost: "text-ink hover:bg-surface",
  danger: "border border-line bg-white text-red-700 hover:border-red-600 hover:bg-red-50",
  accent: "bg-accent-500 text-ink hover:bg-accent-400",
  dark: "bg-night text-white hover:bg-ink",
}
const sizes: Record<Size, string> = { sm: "px-3 py-1.5 text-[13px]", md: "px-4 py-2.5 text-sm", lg: "px-6 py-3 text-base" }

type Props = { variant?: Variant; size?: Size; loading?: boolean; full?: boolean; href?: string; className?: string; children: React.ReactNode } &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">

export default function Button({ variant = "primary", size = "md", loading, full, href, className, children, disabled, ...rest }: Props) {
  const cls = cn(base, variants[variant], sizes[size], full && "w-full", className)
  if (href && !disabled) return <Link href={href} className={cls}>{children}</Link>
  return <button className={cls} disabled={disabled || loading} {...rest}>{loading && <Loader2 className="size-4 animate-spin" />}{children}</button>
}
