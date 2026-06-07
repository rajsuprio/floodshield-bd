"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, FileText, CheckCircle, Gift, Layers } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Stats {
  totalLand: number
  totalClaims: number
  approvedClaims: number
  relievedClaims: number
  farmerName: string
}

export default function FarmerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get("/api/farmer/stats")
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    {
      title: "Total Land Registered",
      value: stats?.totalLand ?? 0,
      icon: MapPin,
      iconColor: "text-sky-500",
      iconBg: "bg-sky-500/10",
      href: "/farmer/my-land",
    },
    {
      title: "Claims Submitted",
      value: stats?.totalClaims ?? 0,
      icon: FileText,
      iconColor: "text-teal-500",
      iconBg: "bg-teal-500/10",
      href: "/farmer/my-claims",
    },
    {
      title: "Approved Claims",
      value: stats?.approvedClaims ?? 0,
      icon: CheckCircle,
      iconColor: "text-green-500",
      iconBg: "bg-green-500/10",
      href: "/farmer/my-claims",
    },
    {
      title: "Relief Received",
      value: stats?.relievedClaims ?? 0,
      icon: Gift,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-500/10",
      href: "/farmer/my-claims",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Farmer Dashboard</h1>
        <p className="text-base text-gray-500 mt-1">
          Welcome back! Here's an overview of your farm and claims.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link href={card.href} key={card.title}>
              <div className="glass-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-default">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {card.title}
                    </p>
                    <p className="text-4xl font-bold mt-2 text-slate-800 dark:text-slate-100">
                      {loading ? "..." : card.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${card.iconBg}`}>
                    <Icon className={`${card.iconColor} w-6 h-6`} />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/farmer/add-land">
              <Button className="gradient-btn cursor-pointer w-full text-base font-medium py-3">
                + Register New Land
              </Button>
            </Link>
            <Link href="/farmer/report-loss">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-base font-medium">
                Report Crop Loss
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
              <div>
                <p className="text-base font-semibold text-yellow-800">Moderate Risk</p>
                <p className="text-sm text-yellow-600">
                  Check the flood map for your area
                </p>
              </div>
            </div>
            <Link href="/map/flood-risk" className="mt-3 block">
              <Button variant="outline" className="w-full text-sm">
                View Flood Risk Map
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}