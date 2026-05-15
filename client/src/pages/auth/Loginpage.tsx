import { AuthHero } from "@/components/auth/AuthHero";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-2 lg:items-center">
        <AuthHero />
        <div>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}