import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
import type { RootState } from "@/store/store"

export default function PublicRoute({ children }: any) {
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  )

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}