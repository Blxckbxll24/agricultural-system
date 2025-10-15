"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Activity, Map, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme/theme-toggle"

export function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">AgroMonitor</span>
            </Link>

            <nav className="flex items-center gap-1">
              <Link href="/dashboard">
                <Button variant={pathname === "/dashboard" ? "secondary" : "ghost"} size="sm">
                  Dashboard
                </Button>
              </Link>
              <Link href="/parcels">
                <Button variant={pathname === "/parcels" ? "secondary" : "ghost"} size="sm">
                  <Map className="h-4 w-4 mr-2" />
                  Parcelas
                </Button>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
