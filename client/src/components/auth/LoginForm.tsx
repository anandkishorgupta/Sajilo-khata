import { useLogin } from "@/hooks/useLogin"
import { useAppDispatch } from "@/store/hooks"
import { loginSuccess } from "@/store/slices/authSlice"
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { Link, useNavigate } from "react-router-dom"

export default function LoginForm() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const loginMutation = useLogin()

  const [form, setForm] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    loginMutation.mutate(
      {
        email: form.email,
        password: form.password,
      },
      {
        onSuccess: (response) => {
          // console.log(response)
          // if (response?.data?.access_token) {
          //   localStorage.setItem("token", response.data.access_token)
          // }
          // if (response?.data?.user) {
          //   localStorage.setItem("user", JSON.stringify(response.data.user))
          // }
          console.log("Login successful:", response)
          const user = response?.data?.user
          const token = response?.data?.access_token
          const shop = response?.data?.shop

          if (token && user) {
            // ✅ Redux
            dispatch(loginSuccess({ user, token }))

            // ✅ LocalStorage backup
            localStorage.setItem("token", token)
            localStorage.setItem("user", JSON.stringify(user))
            localStorage.setItem("shop", JSON.stringify(shop))
          }

          toast.success("Login successful")

          setTimeout(() => {
            navigate("/dashboard")
          }, 1000)
        },

        onError: (error: any) => {
          console.error(error)

          toast.error(
            error?.response?.data?.message || "Invalid email or password"
          )
        },
      }
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md space-y-5 rounded-2xl border p-6 shadow-sm"
    >
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="text-sm text-gray-500">Sign in to your shop dashboard</p>

      {/* EMAIL */}
      <div>
        <label className="text-sm">Email</label>

        <div className="mt-1 flex items-center gap-2 rounded border px-3">
          <Mail className="h-4 w-4 text-gray-500" />
          <input
            className="w-full py-2 outline-none"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@shop.com"
          />
        </div>
      </div>

      {/* PASSWORD */}
      <div>
        <label className="text-sm">Password</label>

        <div className="mt-1 flex items-center gap-2 rounded border px-3">
          <Lock className="h-4 w-4 text-gray-500" />

          <input
            type={showPassword ? "text" : "password"}
            className="w-full py-2 outline-none"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="password"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-gray-500 hover:text-black"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* ERROR */}
      {loginMutation.isError && (
        <p className="text-sm text-red-500">Invalid email or password</p>
      )}

      {/* BUTTON */}
      <button
        disabled={loginMutation.isPending}
        className="flex w-full cursor-pointer items-center justify-center rounded-2xl bg-primary py-2 text-white"
      >
        {loginMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Login"
        )}
      </button>

      <p className="text-center text-sm">
        No account?{" "}
        <Link to="/register" className="underline">
          Register
        </Link>
      </p>
    </form>
  )
}
