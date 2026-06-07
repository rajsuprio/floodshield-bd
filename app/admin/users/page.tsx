"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const roleColors: Record<string, string> = {
  FARMER: "bg-green-100 text-green-700",
  VOLUNTEER: "bg-blue-100 text-blue-700",
  NGO: "bg-purple-100 text-purple-700",
  ADMIN: "bg-red-100 text-red-700",
}

const roleOptions = ["FARMER", "VOLUNTEER", "NGO", "ADMIN"]

type User = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadCurrentUser = async () => {
    try {
      const res = await axios.get("/api/auth/me")
      setCurrentUserId(res.data?.id ?? null)
    } catch (error) {
      console.error(error)
      setCurrentUserId(null)
    }
  }

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await axios.get("/api/admin/users")
      setUsers(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      await loadCurrentUser()
      await loadUsers()
    }

    init()
  }, [])

  const handleRoleChange = async (userId: string, newRole: string) => {
    const confirmed = window.confirm(`Change this user's role to ${newRole}?`)
    if (!confirmed) return

    setActionLoading(userId)
    try {
      await axios.patch(`/api/admin/users/${userId}`, { role: newRole })
      await loadUsers()
    } catch (error) {
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (userId: string) => {
    const confirmed = window.confirm("Delete this user permanently?")
    if (!confirmed) return

    setActionLoading(userId)
    try {
      await axios.delete(`/api/admin/users/${userId}`)
      await loadUsers()
    } catch (error) {
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = filter === "ALL" ? users : users.filter((u) => u.role === filter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">{users.length} registered users</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["ALL", "FARMER", "VOLUNTEER", "NGO", "ADMIN"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === f
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f} ({f === "ALL" ? users.length : users.filter((u) => u.role === f).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600">Name</th>
                  <th className="text-left p-4 font-medium text-gray-600">Email</th>
                  <th className="text-left p-4 font-medium text-gray-600">Role</th>
                  <th className="text-left p-4 font-medium text-gray-600">Joined</th>
                  <th className="text-left p-4 font-medium text-gray-600">Change Role</th>
                  <th className="text-left p-4 font-medium text-gray-600">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((user) => {
                  const isCurrentAdmin = user.id === currentUserId

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium">{user.name}</td>
                      <td className="p-4 text-gray-500">{user.email}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColors[user.role]}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        {isCurrentAdmin ? (
                          <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                            Current admin
                          </span>
                        ) : (
                          <select
                            value={user.role}
                            disabled={actionLoading === user.id}
                            onChange={(event) => handleRoleChange(user.id, event.target.value)}
                            className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-900"
                          >
                            {roleOptions.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="p-4">
                        {isCurrentAdmin ? null : (
                          <button
                            type="button"
                            disabled={actionLoading === user.id}
                            onClick={() => handleDelete(user.id)}
                            className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
