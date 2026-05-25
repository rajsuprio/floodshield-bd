"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, CheckCircle, XCircle, Loader2, FileText } from "lucide-react"

const statusConfig: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  UNDER_REVIEW: "bg-blue-100 text-blue-700",
  FIELD_VERIFIED: "bg-cyan-100 text-cyan-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  RELIEF_ASSIGNED: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")

  useEffect(() => {
    axios.get("/api/admin/claims")
      .then((res) => setClaims(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleStatus = async (claimId: string, status: string) => {
    try {
      await axios.put("/api/admin/claims", { claimId, status })
      setClaims((prev) =>
        prev.map((c) => (c.id === claimId ? { ...c, status } : c))
      )
    } catch {
      alert("Something went wrong")
    }
  }

  const filtered = filter === "ALL" ? claims : claims.filter((c) => c.status === filter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Claims</h1>
        <p className="text-gray-500 mt-1">Manage and approve damage claims</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["ALL", "PENDING", "FIELD_VERIFIED", "APPROVED", "REJECTED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
              ${filter === f ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <FileText size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500">No claims found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((claim) => (
            <Card key={claim.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{claim.farmer.user.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[claim.status] || ""}`}>
                        {claim.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-purple-600 font-bold ml-auto">
                        Score: {claim.priorityScore}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={12} />
                      {claim.land.district} — {claim.cropType} — {claim.lossPercentage}% loss
                    </p>
                    {claim.verification && (
                      <p className="text-xs text-green-600 mt-1">✓ Field verified by volunteer</p>
                    )}
                  </div>
                  {claim.status === "FIELD_VERIFIED" && (
                    <div className="flex gap-2 ml-4">
                      <Link href={`/admin/verify-claim/${claim.id}`}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          Review
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleStatus(claim.id, "APPROVED")}
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleStatus(claim.id, "REJECTED")}
                      >
                        <XCircle size={14} className="mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}