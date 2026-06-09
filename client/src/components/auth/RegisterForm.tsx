import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Store,
  User,
} from "lucide-react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRegister } from "@/hooks/use-register"
import { registerSchema, type RegisterFormData } from "@/schema/register-schema"
import { useNavigate } from "react-router-dom"
const SHOP_TYPES = [
  "Kirana / Grocery",
  "Cosmetic Store",
  "Mobile Shop",
  "Hardware Store",
  "Mart",
]

export function RegisterForm() {
  const { mutateAsync, isPending } = useRegister()
  const navigate = useNavigate()
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),

    defaultValues: {
      ownerName: "",
      shopName: "",
      phone: "",
      city: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: RegisterFormData) {
    try {
      const payload = {
        name: values.ownerName,
        shopName: values.shopName,
        shopAddress: values.city,
        shopPhone: values.phone,
        email: values.email,
        password: values.password,
      }

      const data = await mutateAsync(payload)

      console.log(data)

      toast.success("Account created successfully, please login to continue")

      form.reset()
      navigate("/login") // redirect here
    } catch (error: any) {
      console.error(error)

      toast.error(error?.response?.data?.message || "Registration failed")
    }
  }

  return (
    <Card className="rounded-3xl border-0 shadow-xl shadow-black/5">
      <CardContent className="p-6 sm:p-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Register your shop
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Start your 30-day free trial.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              icon={<User className="h-4 w-4" />}
              placeholder="Owner name"
              {...form.register("ownerName")}
            />

            <InputField
              icon={<Store className="h-4 w-4" />}
              placeholder="Shop name"
              {...form.register("shopName")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              icon={<Phone className="h-4 w-4" />}
              placeholder="Phone"
              {...form.register("phone")}
            />

            <InputField
              icon={<MapPin className="h-4 w-4" />}
              placeholder="Address / City"
              {...form.register("city")}
            />
          </div>

          <InputField
            icon={<Mail className="h-4 w-4" />}
            placeholder="Email"
            type="email"
            {...form.register("email")}
          />

          <InputField
            icon={<Lock className="h-4 w-4" />}
            placeholder="Password"
            type="password"
            {...form.register("password")}
          />

          <Button
            type="submit"
            disabled={isPending}
            className="h-12 w-full cursor-pointer rounded-2xl"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Register
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

function InputField({ icon, ...props }: any) {
  return (
    <div className="relative">
      <div className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
        {icon}
      </div>

      <Input className="h-11 rounded-2xl pl-10" {...props} />
    </div>
  )
}
