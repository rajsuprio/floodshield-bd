"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, Loader2 } from "lucide-react"

interface LandPlot {
  id: string
  cropType: string
  landSize: number
  district: string
  upazila: string
  union: string | null
  latitude: number
  longitude: number
  plantingDate: string | null
  harvestDate: string | null
  createdAt: string
  riskLevel?: string | null
}

export default function MyLandPage() {
  const [lands, setLands] = useState<LandPlot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get("/api/land")
      .then((res) => setLands(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Land</h1>
          <p className="text-gray-500 mt-1">All your registered agricultural land</p>
        </div>
        <Link href="/farmer/add-land">
          <Button className="gradient-btn cursor-pointer">
            <Plus size={16} className="mr-2" />
            Add Land
          </Button>
        </Link>
      </div>

      {lands.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No land registered yet</h3>
            <p className="text-gray-400 text-sm mt-1 mb-4">
              Register your agricultural land to start tracking flood risks
            </p>
            <Link href="/farmer/add-land">
              <Button className="gradient-btn cursor-pointer">
                Register Your First Land
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lands.map((land) => (
            <Card key={land.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{land.cropType}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} />
                      {land.district}, {land.upazila}
                      {land.union && `, ${land.union}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      {land.landSize} acres
                    </Badge>
                    <div>
                      {land.riskLevel === "EMERGENCY" || land.riskLevel === "HIGH" ? (
                        <span className="inline-flex items-center text-xs bg-red-50 text-red-700 px-2 py-1 rounded">⚠️ Flood Risk Zone</span>
                      ) : land.riskLevel === "MODERATE" ? (
                        <span className="inline-flex items-center text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">⚡ Moderate Risk</span>
                      ) : land.riskLevel === "LOW" ? (
                        <span className="inline-flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded">✓ Low Risk</span>
                      ) : (
                        <span className="inline-flex items-center text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">No Risk Data</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 border-t pt-3">
                  <div>
                    <p className="font-medium text-gray-700">GPS Location</p>
                    <p>{land.latitude.toFixed(4)}, {land.longitude.toFixed(4)}</p>
                  </div>
                  {land.plantingDate && (
                    <div>
                      <p className="font-medium text-gray-700">Planted</p>
                      <p>{new Date(land.plantingDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {land.harvestDate && (
                    <div>
                      <p className="font-medium text-gray-700">Harvest</p>
                      <p>{new Date(land.harvestDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-700">Registered</p>
                    <p>{new Date(land.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}