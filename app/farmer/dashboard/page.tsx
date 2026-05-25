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
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/farmer/my-land",
    },
    {
      title: "Claims Submitted",
      value: stats?.totalClaims ?? 0,
      icon: FileText,
      color: "text-orange-600",
      bg: "bg-orange-50",
      href: "/farmer/my-claims",
    },
    {
      title: "Approved Claims",
      value: stats?.approvedClaims ?? 0,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
      href: "/farmer/my-claims",
    },
    {
      title: "Relief Received",
      value: stats?.relievedClaims ?? 0,
      icon: Gift,
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: "/farmer/my-claims",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Farmer Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here's an overview of your farm and claims.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link href={card.href} key={card.title}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {card.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${card.bg}`}>
                      <Icon size={18} className={card.color} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? "..." : card.value}
                  </p>
                </CardContent>
              </Card>
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
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                + Register New Land
              </Button>
            </Link>
            <Link href="/farmer/report-loss">
              <Button variant="outline" className="w-full border-orange-300 text-orange-600 hover:bg-orange-50">
                Report Crop Loss
              </Button>
            </Link>
            <Link href="/map/flood-risk">
              <Button variant="outline" className="w-full">
                View Flood Risk Map
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
                <p className="font-semibold text-yellow-800">Moderate Risk</p>
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