"use client"
import { Heart } from "lucide-react"
import { useEffect, useState } from "react"
import ProductCard from "@/components/product/ProductCard"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import { useFavorites } from "@/lib/favorites"
import { getRegionId, store, type Product } from "@/lib/medusa"

export default function FavoritesTab() {
  const { ids } = useFavorites(); const [products, setProducts] = useState<Product[] | null>(null)
  useEffect(() => {
    if (!ids.length) { setProducts([]); return }
    getRegionId().then((region_id) => store<{ products: Product[] }>(`/store/products?region_id=${region_id}&${ids.map((i) => `id=${i}`).join("&")}&fields=id,title,handle,thumbnail,metadata,*categories,*variants.calculated_price,+variants.inventory_quantity`))
      .then((d) => setProducts(d.products)).catch(() => setProducts([]))
  }, [ids])
  if (products && !products.length) return <EmptyState icon={Heart} action={<Button href="/store">Parcourir les produits</Button>}>Touchez le cœur d&apos;un produit pour le retrouver ici.</EmptyState>
  return <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3">{products?.filter((p) => ids.includes(p.id)).map((p) => <ProductCard key={p.id} p={p} />)}</div>
}
