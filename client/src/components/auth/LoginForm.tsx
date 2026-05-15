import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Loader2, Mail, Lock } from "lucide-react"
import { useLogin } from "@/hooks/useLogin";


export default function LoginForm() {
  const navigate = useNavigate()
  
  const loginMutation = useLogin()

  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    loginMutation.mutate(
      {
        email: form.email,
        password: form.password,
      },
      {
        onSuccess: (data) => {
          localStorage.setItem("token", data.token)
          navigate("/dashboard")
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
            type="password"
            className="w-full py-2 outline-none"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      {/* ERROR */}
      {loginMutation.isError && (
        <p className="text-sm text-red-500">Invalid email or password</p>
      )}

      {/* BUTTON */}
      <button
        disabled={loginMutation.isPending}
        className="flex w-full items-center justify-center rounded bg-black py-2 text-white"
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
