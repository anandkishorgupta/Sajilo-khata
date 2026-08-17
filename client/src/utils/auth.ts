// export function getToken() {
//   const token = localStorage.getItem("token")

//   if (
//     !token ||
//     token === "undefined" ||
//     token === "null"
//   ) {
//     return null
//   }

//   return token
// }



export const getStoredUser = () => {
  const user = localStorage.getItem("user")
  return user ? JSON.parse(user) : null
}

export const getStoredToken = () => {
  return localStorage.getItem("token")
}

export const clearAuth = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function getRoleFromToken(): string | null {
  const token = getStoredToken()
  if (!token) return null
  const payload = decodeJwtPayload(token)
  return payload?.role ?? null
}