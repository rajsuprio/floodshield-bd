"use client"
import Topbar from "@/components/Topbar"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { getRoleDashboard } from "@/lib/utils"
import {
  LayoutDashboard,
  MapPin,
  PlusCircle,
  FileText,
  ClipboardList,
  Menu,
  X,
  Waves,
} from "lucide-react"

const navItems = [
  { href: getRoleDashboard("FARMER"), label: "Dashboard", icon: LayoutDashboard },
  { href: "/farmer/my-land", label: "My Land", icon: MapPin },
  { href: "/farmer/add-land", label: "Add Land", icon: PlusCircle },
  { href: "/farmer/report-loss", label: "Report Loss", icon: FileText },
  { href: "/farmer/my-claims", label: "My Claims", icon: ClipboardList },
]

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 min-h-screen w-56 flex flex-col border-r border-slate-700 z-30 transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:block`}
        style={{ background: 'var(--sidebar-bg)' }}
      >
        <div className="px-6 py-5 border-b border-slate-700">
          <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-teal-400 bg-clip-text text-transparent">
            FloodShield BD
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Farmer Portal</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={active ? "flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-sm font-medium bg-sky-500/20 text-sky-400 border border-sky-500/30" : "flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-all"}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto p-4">
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <X size={16} />
            Logout
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-blue-900">FloodShield BD</span>
        </header>

        <Topbar role="Farmer" showThemeToggle />
        <main className="flex-1 p-6 overflow-auto text-base">{children}</main>
      </div>
    </div>
  )
}