import { Minus, Plus, Trash2 } from "lucide-react"

type Props = {
  item: any
  onIncrease: () => void
  onDecrease: () => void
  onRemove: () => void
}

export function CartItem({ item, onIncrease, onDecrease, onRemove }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-3">
      <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
        <img
          src={item?.img}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex-1">
        <p className="font-medium">{item.name}</p>
        <p className="text-xs text-muted-foreground">Rs {item.price}</p>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={onDecrease}>
          <Minus className="h-4 w-4" />
        </button>

        <span className="w-6 text-center">{item.qty}</span>

        <button onClick={onIncrease}>
          <Plus className="h-4 w-4" />
        </button>

        <button onClick={onRemove}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
      </div>
    </div>
  )
}
