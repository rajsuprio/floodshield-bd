"use client"
import Topbar from "@/components/Topbar"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MapPin,
  PlusCircle,
  FileText,
  ClipboardList,
  Menu,
  X,
  Wave,
} from "lucide-react"

const navItems = [
  { href: "/farmer/dashboard", label: "Dashboard", icon: LayoutDashboard },
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
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30 transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:block`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌊</span>
            <div>
              <p className="font-bold text-blue-900 text-sm">FloodShield BD</p>
              <p className="text-xs text-gray-500">Farmer Portal</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <Link
            href="/login"
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

        <Topbar role="Farmer" />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}