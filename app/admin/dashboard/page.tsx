"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, Package, CheckCircle, MapPin, Loader2 } from "lucide-react"

const statusConfig: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  UNDER_REVIEW: "bg-blue-100 text-blue-700",
  FIELD_VERIFIED: "bg-cyan-100 text-cyan-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  RELIEF_ASSIGNED: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
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
        <p className="text-gray-500 mt-1">System overview and management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Users", value: users.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Total Claims", value: claims.length, icon: FileText, color: "text-orange-600", bg: "bg-orange-50" },
          { title: "Verified Claims", value: verified, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { title: "Relief Assigned", value: relieved, icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${card.bg}`}>
                    <Icon size={18} className={card.color} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{loading ? "..." : card.value}</p>
              </CardContent>
            </Card>
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
                  <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{claim.farmer.user.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={10} />
                        {claim.land.district} — {claim.lossPercentage}% loss
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[claim.status] || ""}`}>
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