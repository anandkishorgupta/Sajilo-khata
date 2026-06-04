type Props = {
  subtotal: number
  discount: number
  total: number
}

export function BillingSummary({ subtotal, discount, total }: Props) {
  return (
    <div className="rounded-2xl p-4">
      <div className="flex justify-between text-sm opacity-80">
        <span>Subtotal</span>
        <span>Rs {subtotal}</span>
      </div>

      {/* <div className="mt-2 flex justify-between text-sm opacity-80">
        <span>Discount</span>
        <span>Rs {discount}</span>
      </div> */}

      <div className="my-3 h-px bg-white/20" />

      <div className="flex justify-between">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-3xl font-bold">Rs {total}</span>
      </div>
    </div>
  )
}
