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