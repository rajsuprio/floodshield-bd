"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClipboardList, CheckCircle, Clock, AlertTriangle } from "lucide-react"

export default function VolunteerDashboard() {
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get("/api/volunteer/claims")
      .then((res) => setClaims(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const pending = claims.filter((c) => c.status === "PENDING").length
  const underReview = claims.filter((c) => c.status === "UNDER_REVIEW").length
  const verified = claims.filter((c) => c.status === "FIELD_VERIFIED").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Volunteer Dashboard</h1>
        <p className="text-gray-500 mt-1">Field verification overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Pending Claims", value: pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
          { title: "Under Review", value: underReview, icon: AlertTriangle, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Field Verified", value: verified, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
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
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/volunteer/assigned-claims">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              <ClipboardList size={16} className="mr-2" />
              View Assigned Claims
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}