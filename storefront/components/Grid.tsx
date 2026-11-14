import ProductCard from "./ProductCard"
import type { Product } from "@/lib/medusa"
export default function Grid({ products }: { products: Product[] }) {
  return <div className="row">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
}
