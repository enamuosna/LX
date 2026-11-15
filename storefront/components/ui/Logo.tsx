import Link from "next/link"
import { cn } from "@/lib/cn"
export default function Logo({ className, tagline = true, href = "/" }: { className?: string; tagline?: boolean; href?: string }) {
  return (<Link href={href} className={cn("inline-flex items-end gap-2 leading-none text-white", className)} aria-label="Lx — Lo Soxla ?">
    <span className="text-4xl font-extrabold tracking-tighter">L<span className="text-accent-500">x</span></span>
    {tagline && <span className="mb-1 text-[11px] font-semibold leading-tight tracking-wide text-accent-500">Lo Soxla ?</span>}</Link>)
}
