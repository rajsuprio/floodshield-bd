"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    axios.get("/api/notifications")
      .then((res) => setNotifications(res.data))
      .catch(console.error)
  }, [])

  const unread = notifications.filter((n) => !n.read).length

  const handleOpen = async (val: boolean) => {
    setOpen(val)
    if (val && unread > 0) {
      await axios.put("/api/notifications/read")
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={20} className="text-gray-600" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-3 py-2 font-semibold text-sm text-gray-700">
          Notifications
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-gray-400">
            No notifications yet
          </div>
        ) : (
          notifications.slice(0, 8).map((n) => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start px-3 py-2 cursor-default">
              <div className="flex items-center gap-2 w-full">
                {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                <p className={`text-sm font-medium ${n.read ? "text-gray-600" : "text-gray-900"}`}>
                  {n.title}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 ml-4">{n.message}</p>
              <p className="text-xs text-gray-400 mt-0.5 ml-4">
                {new Date(n.createdAt).toLocaleDateString()}
              </p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}