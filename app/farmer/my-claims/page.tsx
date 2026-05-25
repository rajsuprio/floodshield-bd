"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Loader2, MapPin, Calendar } from "lucide-react"

interface Claim {
  id: string
  cropType: string
  affectedArea: number
  lossPercentage: number
  description: string | null
  dateOfDamage: string
  status: string
  priorityScore: number
  createdAt: string
  photos: { url: string }[]
  land: {
    district: string
    upazila: string
  }
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-gray-100 text-gray-700" },
  UNDER_REVIEW: { label: "Under Review", color: "bg-blue-100 text-blue-700" },
  FIELD_VERIFIED: { label: "Field Verified", color: "bg-cyan-100 text-cyan-700" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-700" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700" },
  RELIEF_ASSIGNED: { label: "Relief Assigned", color: "bg-purple-100 text-purple-700" },
  COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
}

export default function MyClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get("/api/claims")
      .then((res) => setClaims(res.data))
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
          <h1 className="text-2xl font-bold text-gray-900">My Claims</h1>
          <p className="text-gray-500 mt-1">Track your crop loss claims</p>
        </div>
        <Link href="/farmer/report-loss">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus size={16} className="mr-2" />
            New Claim
          </Button>
        </Link>
      </div>

      {claims.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No claims yet</h3>
            <p className="text-gray-400 text-sm mt-1 mb-4">
              Submit a claim if your crops were damaged by flooding
            </p>
            <Link href="/farmer/report-loss">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Report Crop Loss
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => {
            const status = statusConfig[claim.status] || statusConfig.PENDING
            return (
              <Card key={claim.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{claim.cropType}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {claim.land.district}, {claim.land.upazila}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(claim.dateOfDamage).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm border-t pt-3">
                    <div>
                      <p className="text-gray-500 text-xs">Affected Area</p>
                      <p className="font-medium">{claim.affectedArea} acres</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Loss</p>
                      <p className="font-medium text-red-600">{claim.lossPercentage}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Priority Score</p>
                      <p className="font-medium text-purple-600">{claim.priorityScore}</p>
                    </div>
                  </div>

                  {claim.photos.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {claim.photos.slice(0, 3).map((photo, i) => (
                        <img
                          key={i}
                          src={photo.url}
                          alt="Damage"
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                      ))}
                      {claim.photos.length > 3 && (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center text-xs text-gray-500">
                          +{claim.photos.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}