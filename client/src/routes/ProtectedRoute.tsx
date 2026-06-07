import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
import type { RootState } from "@/store/store"

type Props = {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  )

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}