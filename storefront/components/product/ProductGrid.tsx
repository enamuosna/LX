import ProductCard from "./ProductCard"
import type { Product } from "@/lib/medusa"
export default function ProductGrid({ products }: { products: Product[] }) {
  return <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
}
