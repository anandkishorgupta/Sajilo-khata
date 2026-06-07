import { useAppDispatch } from "@/store/hooks"
import { logout } from "@/store/slices/authSlice"
import type { RootState } from "@/store/store"
import { LogOut } from "lucide-react"
import { useSelector } from "react-redux"

export default function UserBadge() {
  const dispatch = useAppDispatch()

  const user = useSelector((state: RootState) => state.auth.user)

  if (!user) return null

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 pr-3">
      {/* avatar */}
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
        {initials}
      </div>

      {/* name */}
      <div className="hidden leading-tight sm:block">
        <div className="text-xs font-semibold">{user.name}</div>
        <div className="text-[10px] text-muted-foreground">{user.email}</div>
      </div>

      {/* logout */}
      <button
        onClick={() => dispatch(logout())}
        className="ml-2 text-muted-foreground hover:text-red-500"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  )
}
