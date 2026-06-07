"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, User, Loader2, ClipboardList } from "lucide-react"

const statusConfig: Record<string, string> = {
  PENDING: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  FIELD_VERIFIED: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400",
}

export default function AssignedClaimsPage() {
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get("/api/volunteer/claims")
      .then((res) => setClaims(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Assigned Claims</h1>
        <p className="text-gray-500 mt-1">{claims.length} claims awaiting verification</p>
      </div>

      {claims.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-5 text-center">
            <ClipboardList size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No claims to verify</h3>
            <p className="text-gray-400 text-sm mt-1">All claims have been processed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{claim.cropType}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {claim.farmer.user.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {claim.land.district}, {claim.land.upazila}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusConfig[claim.status] || "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"}`}>
                    {claim.status.replace("_", " ")}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm border-t pt-3 mb-3">
                  <div>
                    <p className="text-gray-500 text-xs">Crop</p>
                    <p className="font-medium">{claim.cropType}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Loss</p>
                    <p className="font-medium text-red-600">{claim.lossPercentage}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Area</p>
                    <p className="font-medium">{claim.affectedArea} acres</p>
                  </div>
                </div>

                {claim.photos.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {claim.photos.slice(0, 3).map((photo: any, i: number) => (
                      <img key={i} src={photo.url} alt="Damage" className="w-16 h-16 object-cover rounded-lg border" />
                    ))}
                  </div>
                )}

                <Link href={`/volunteer/verify-claim/${claim.id}`}>
                  <Button className="gradient-btn cursor-pointer w-full text-sm" size="sm">
                    {claim.verification ? "Update Verification" : "Verify This Claim"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}