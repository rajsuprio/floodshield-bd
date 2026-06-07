"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, Package, CheckCircle, MapPin, Loader2 } from "lucide-react"

const statusConfig: Record<string, string> = {
  PENDING: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  FIELD_VERIFIED: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  RELIEF_ASSIGNED: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  COMPLETED: "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400",
}

export default function AdminDashboard() {
  const [claims, setClaims] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get("/api/admin/claims"),
      axios.get("/api/admin/users"),
    ]).then(([claimsRes, usersRes]) => {
      setClaims(claimsRes.data)
      setUsers(usersRes.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const pending = claims.filter((c) => c.status === "PENDING").length
  const verified = claims.filter((c) => c.verification).length
  const relieved = claims.filter((c) => c.relief).length
  const farmers = users.filter((u) => u.role === "FARMER").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-base text-gray-500 mt-1">System overview and management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {[
          { title: "Total Users", value: users.length, icon: Users, iconColor: "text-sky-500", iconBg: "bg-sky-500/10" },
          { title: "Total Claims", value: claims.length, icon: FileText, iconColor: "text-teal-500", iconBg: "bg-teal-500/10" },
          { title: "Verified Claims", value: verified, icon: CheckCircle, iconColor: "text-green-500", iconBg: "bg-green-500/10" },
          { title: "Relief Assigned", value: relieved, icon: Package, iconColor: "text-orange-500", iconBg: "bg-orange-500/10" },
        ].map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="glass-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-default">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
                  <p className="text-4xl font-bold mt-2 text-slate-800 dark:text-slate-100">{loading ? "..." : card.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.iconBg}`}>
                  <Icon className={`${card.iconColor} w-6 h-6`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Claims</CardTitle>
              <Link href="/admin/claims">
                <Button size="sm" variant="outline">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : (
              <div className="space-y-3">
                {claims.slice(0, 5).map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-base">
                    <div>
                      <p className="text-base font-semibold">{claim.farmer.user.name}</p>
                      <p className="text-base text-gray-500 flex items-center gap-1">
                        <MapPin size={10} />
                        {claim.land.district} — {claim.lossPercentage}% loss
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusConfig[claim.status] || ""}`}>
                      {claim.status.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/claims">
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                Manage All Claims
              </Button>
            </Link>
            <Link href="/admin/relief">
              <Button variant="outline" className="w-full">
                Relief Management
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full">
                User Management
              </Button>
            </Link>
            <Link href="/map/flood-risk">
              <Button variant="outline" className="w-full">
                View Flood Risk Map
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}