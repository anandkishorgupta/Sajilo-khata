import Footer from "@/components/shared/Footer"
import { Header } from "@/components/shared/Header"
import { Outlet } from "react-router-dom"

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
