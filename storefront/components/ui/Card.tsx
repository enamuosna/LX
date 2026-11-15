import { cn } from "@/lib/cn"
type P = { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>
export const Card = ({ className, children, ...r }: P) => <div className={cn("overflow-hidden rounded-2xl border border-line bg-white", className)} {...r}>{children}</div>
export const CardHeader = ({ className, children, ...r }: P) => <div className={cn("flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4", className)} {...r}>{children}</div>
export const CardBody = ({ className, children, ...r }: P) => <div className={cn("p-5", className)} {...r}>{children}</div>
export const CardFooter = ({ className, children, ...r }: P) => <div className={cn("flex flex-wrap items-center justify-between gap-3 border-t border-line bg-slate-50 px-5 py-3", className)} {...r}>{children}</div>
