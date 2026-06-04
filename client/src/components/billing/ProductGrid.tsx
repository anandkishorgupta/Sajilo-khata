import { ProductCard } from "./ProductCard"

type Props = {
  products: any[]
  onAdd: (product: any) => void
}

export function ProductGrid({ products, onAdd }: Props) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAdd={() => onAdd(product)}
        />
      ))}
    </div>
  )
}
