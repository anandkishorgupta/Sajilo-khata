type Props = {
  product: any
  onAdd: () => void
}

export function ProductCard({ product, onAdd }: Props) {
  return (
    <button
      onClick={onAdd}
      className="group rounded-2xl border bg-card p-3 text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
    >
      <div className="space-y-3">
        <div className="overflow-hidden rounded-xl bg-muted">
          {product?.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-18 w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-18 items-center justify-center text-3xl">
              📦
            </div>
          )}
        </div>

        <div>
          <p className="truncate font-medium">{product.name}</p>
          <p className="mt-1 text-lg font-bold">Rs {product.sellingPrice}</p>
        </div>
      </div>
    </button>
  )
}
