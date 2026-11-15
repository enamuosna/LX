import Link from "next/link"
import { cn } from "@/lib/cn"

/** Marque Lx : le x est une croix de livraison, avec un point soleil. */
export default function Logo({ className, tagline = true, href = "/", tone = "dark" }: { className?: string; tagline?: boolean; href?: string; tone?: "dark" | "light" }) {
  return (<Link href={href} className={cn("group inline-flex items-center gap-2.5 leading-none", tone === "light" ? "text-white" : "text-ink", className)} aria-label="Lx, Lo Soxla ?">
    <span className="font-display text-[2rem] font-extrabold tracking-tighter">L<span className="relative text-brand-600">x<span className="absolute -right-1 top-0.5 size-2 rounded-full bg-accent-500 transition-transform duration-300 group-hover:scale-150" /></span></span>
    {tagline && <span className={cn("hidden text-[13px] font-semibold leading-tight sm:block", tone === "light" ? "text-white/70" : "text-slate-500")}>Lo Soxla ?</span>}</Link>)
}
