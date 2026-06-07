"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getRoleDashboard } from "@/lib/utils"
import { ArrowLeft, Loader2 } from "lucide-react"

const FloodMap = dynamic(() => import("@/components/FloodMap"), { ssr: false })

const riskConfig = {
  LOW: { color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
  MODERATE: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
  HIGH: { color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  EMERGENCY: { color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
}

interface FloodZone {
  id: string
  name: string
  riskLevel: string
  latitude: number
  longitude: number
  radius: number
  description: string | null
}

export default function FloodRiskMapPage() {
  const [zones, setZones] = useState<FloodZone[]>([])
  const [lands, setLands] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [dashboardHref, setDashboardHref] = useState(getRoleDashboard("FARMER"))

  useEffect(() => {
    axios.get("/api/auth/me")
      .then((res) => setDashboardHref(getRoleDashboard(res.data.role)))
      .catch(() => setDashboardHref("/login"))
  }, [])

  useEffect(() => {
    Promise.all([
      axios.get("/api/flood-zones"),
      axios.get("/api/land").catch(() => ({ data: [] })),
    ]).then(([zonesRes, landsRes]) => {
      setZones(zonesRes.data.zones || [])
      setLands(landsRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const filteredZones = activeFilter
    ? zones.filter((z) => z.riskLevel === activeFilter)
    : zones

  const counts = {
    LOW: zones.filter((z) => z.riskLevel === "LOW").length,
    MODERATE: zones.filter((z) => z.riskLevel === "MODERATE").length,
    HIGH: zones.filter((z) => z.riskLevel === "HIGH").length,
    EMERGENCY: zones.filter((z) => z.riskLevel === "EMERGENCY").length,
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={dashboardHref}>
            <Button variant="ghost" size="sm">
              <ArrowLeft size={16} className="mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-gray-900">Flood Risk Map</h1>
            <p className="text-xs text-gray-500">Bangladesh — Live Risk Zones</p>
          </div>
        </div>
        <span className="text-2xl">🌊</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          <div className="p-4 border-b">
            <p className="text-sm font-semibold text-gray-700 mb-3">Filter by Risk Level</p>
            <div className="grid grid-cols-2 gap-2">
              {(["LOW", "MODERATE", "HIGH", "EMERGENCY"] as const).map((level) => {
                const cfg = riskConfig[level]
                return (
                  <button
                    key={level}
                    onClick={() =>
                      setActiveFilter(activeFilter === level ? null : level)
                    }
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all
                      ${activeFilter === level ? cfg.color + " border-current" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    {level}
                    <span className="ml-auto text-gray-400">{counts[level]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Risk Zones ({filteredZones.length})
            </p>
            <div className="space-y-2">
              {filteredZones.map((zone) => {
                const cfg = riskConfig[zone.riskLevel as keyof typeof riskConfig]
                return (
                  <Card key={zone.id} className="border-gray-100">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">{zone.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>
                          {zone.riskLevel}
                        </span>
                      </div>
                      {zone.description && (
                        <p className="text-xs text-gray-500">{zone.description}</p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </aside>

        <div className="flex-1 relative">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : (
            <div className="h-[300px] md:h-[500px]">
              <FloodMap zones={filteredZones} lands={lands} />
            </div>
          )}

          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md p-3 z-[1000]">
            <p className="text-xs font-semibold text-gray-700 mb-2">Legend</p>
            {Object.entries(riskConfig).map(([level, cfg]) => (
              <div key={level} className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                <div className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                {level}
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-2 pt-2 border-t">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              Your Land
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}