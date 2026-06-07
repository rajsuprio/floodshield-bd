"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Users, CheckCircle, TrendingUp, MapPin, Loader2 } from "lucide-react"

const statusConfig: Record<string, string> = {
  PENDING: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  FIELD_VERIFIED: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  RELIEF_ASSIGNED: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  COMPLETED: "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400",
}

export default function NGODashboard() {
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get("/api/admin/claims")
      .then((res) => setClaims(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const highPriority = claims.filter((c) => c.priorityScore >= 30)
  const verified = claims.filter((c) => c.verification)
  const relieved = claims.filter((c) => c.relief)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">NGO Dashboard</h1>
        <p className="text-gray-500 mt-1">Relief coordination overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Claims", value: claims.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "High Priority", value: highPriority.length, icon: TrendingUp, color: "text-red-600", bg: "bg-red-50" },
          { title: "Verified Claims", value: verified.length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { title: "Relief Assigned", value: relieved.length, icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">High Priority Claims</CardTitle>
            <Link href="/ngo/relief">
              <Button size="sm" className="gradient-btn cursor-pointer">
                Manage Relief
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-purple-600" size={24} />
            </div>
          ) : highPriority.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No high priority claims</p>
          ) : (
            <div className="space-y-3">
              {highPriority.slice(0, 5).map((claim) => (
                <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{claim.farmer.user.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />
                      {claim.land.district} — {claim.cropType} — {claim.lossPercentage}% loss
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-600">Score: {claim.priorityScore}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[claim.status] || ""}`}>
                      {claim.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}