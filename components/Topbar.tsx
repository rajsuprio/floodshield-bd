"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import NotificationBell from "./NotificationBell"
import ThemeToggle from "@/components/ThemeToggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User } from "lucide-react"

export default function Topbar({ role, showThemeToggle = false }: { role: string; showThemeToggle?: boolean }) {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    axios.get("/api/auth/me")
      .then((res) => setUser(res.data))
      .catch(console.error)
  }, [])

  const handleLogout = async () => {
    await axios.post("/api/auth/logout")
    window.location.href = "/login"
}

  const initials = user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?"

  return (
    <div className="hidden md:flex items-center justify-end px-6 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 gap-3">
      {showThemeToggle && <ThemeToggle />}
      <NotificationBell />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-base font-medium text-gray-900">{user?.name || "..."}</p>
              <p className="text-sm text-gray-500">{role}</p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="gap-2 text-gray-600">
            <User size={14} />
            {user?.email}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 text-red-500 cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut size={14} />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}