import { cn } from "@/lib/cn"
export default function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-shimmer rounded-2xl bg-[linear-gradient(90deg,#eef0f4_25%,#f7f8fa_50%,#eef0f4_75%)] bg-[length:200%_100%]", className)} />
}
