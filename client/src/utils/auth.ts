export function getToken() {
  const token = localStorage.getItem("token")

  if (
    !token ||
    token === "undefined" ||
    token === "null"
  ) {
    return null
  }

  return token
}