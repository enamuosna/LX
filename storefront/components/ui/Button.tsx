import Link from "next/link"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/cn"

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent" | "dark"
type Size = "sm" | "md" | "lg"
const base = "inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold transition duration-200 ease-out active:scale-[0.96] focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 whitespace-nowrap"
const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-[0_8px_20px_-8px_rgba(11,122,67,0.7)]",
  secondary: "border border-line bg-white text-ink hover:border-ink",
  ghost: "text-ink hover:bg-surface",
  danger: "border border-line bg-white text-bissap hover:border-bissap hover:bg-red-50",
  accent: "bg-accent-500 text-ink hover:-translate-y-0.5 hover:bg-accent-400 hover:shadow-[0_8px_20px_-8px_rgba(255,194,26,0.9)]",
  dark: "bg-night text-white hover:bg-brand-800",
}
const sizes: Record<Size, string> = { sm: "px-4 py-2 text-[13px]", md: "px-5 py-2.5 text-sm", lg: "px-7 py-3.5 text-base" }

type Props = { variant?: Variant; size?: Size; loading?: boolean; full?: boolean; href?: string; className?: string; children: React.ReactNode } &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">

export default function Button({ variant = "primary", size = "md", loading, full, href, className, children, disabled, ...rest }: Props) {
  const cls = cn(base, variants[variant], sizes[size], full && "w-full", className)
  if (href && !disabled) return <Link href={href} className={cls}>{children}</Link>
  return <button className={cls} disabled={disabled || loading} {...rest}>{loading && <Loader2 className="size-4 animate-spin" />}{children}</button>
}
