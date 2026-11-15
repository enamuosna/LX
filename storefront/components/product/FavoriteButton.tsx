"use client"
import { Heart } from "lucide-react"
import { useFavorites } from "@/lib/favorites"
import { cn } from "@/lib/cn"

export default function FavoriteButton({ id, className }: { id: string; className?: string }) {
  const { has, toggle } = useFavorites(); const on = has(id)
  return (<button type="button" data-testid="fav" aria-pressed={on} aria-label={on ? "Retirer des favoris" : "Ajouter aux favoris"} onClick={() => toggle(id)}
    className={cn("grid size-10 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110 active:scale-90", className)}>
    <Heart key={String(on)} className={cn("size-[18px] transition", on ? "animate-pop-in fill-bissap text-bissap" : "text-slate-500")} /></button>)
}
