import { getToken } from "@/utils/auth"
import { Navigate } from "react-router-dom"

type Props = {
  children: React.ReactNode
}

export default function PublicRoute({ children }: Props) {
  const token = getToken()

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
