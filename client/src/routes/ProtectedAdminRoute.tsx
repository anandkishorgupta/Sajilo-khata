import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
import type { RootState } from "@/store/store"

type Props = {
  children: React.ReactNode
}

export default function ProtectedAdminRoute({ children }: Props) {
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.adminAuth
  )

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
