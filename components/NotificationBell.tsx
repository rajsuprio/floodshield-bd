"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
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
  type?: string
  link?: string
  read: boolean
  createdAt: string
}

function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) > 1 ? "s" : ""} ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) > 1 ? "s" : ""} ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? "s" : ""} ago`

  return date.toLocaleDateString()
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  const getNotificationIcon = (type?: string) => {
    if (type === "FARMER_FEEDBACK") return "💬"
    return "🔔"
  }

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/notifications")
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unreadCount || 0)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  // Fetch on mount
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Poll every 30 seconds
  useEffect(() => {
    pollIntervalRef.current = setInterval(() => {
      fetchNotifications()
    }, 30000)

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [])

  const handleOpen = async (val: boolean) => {
    setOpen(val)
    if (val && unreadCount > 0) {
      try {
        await axios.patch("/api/notifications")
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
      } catch (error) {
        console.error("Failed to mark notifications as read:", error)
      }
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={20} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-3 py-2 font-semibold text-sm text-gray-700">
          Notifications
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-gray-400">
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`px-3 py-3 border-b border-gray-100 transition-colors last:border-b-0 ${n.link ? "cursor-pointer hover:bg-gray-50" : ""}`}
                onClick={() => n.link && router.push(n.link)}
              >
                <div className="flex items-start gap-2">
                  <div className="text-lg leading-none">{getNotificationIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!n.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                      <p className={`text-sm font-medium ${n.read ? "text-gray-600" : "text-gray-900"}`}>
                        {n.title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTimeAgo(n.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}