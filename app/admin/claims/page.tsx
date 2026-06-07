"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, CheckCircle, XCircle, Loader2, FileText } from "lucide-react"

const statusConfig: Record<string, string> = {
  PENDING: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  FIELD_VERIFIED: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  RELIEF_ASSIGNED: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  COMPLETED: "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400",
}

function statusLabel(status: string) {
  if (status === "PENDING") return "SUBMITTED"
  return status.replace(/_/g, " ")
}

type Claim = {
  id: string
  priorityScore?: number
  status: string
  farmer: { user: { name: string } }
  land: { district: string }
  cropType: string
  lossPercentage: number
  verification?: Record<string, unknown> | null
}

type Volunteer = {
  id: string
  name: string
}

function renderPriorityBadge(score: number | null | undefined) {
  const value = score ?? 0
  if (value >= 40) {
    return (
      <span className="text-xs font-semibold bg-red-100 text-red-700 rounded-full px-2.5 py-1">
        HIGH PRIORITY ({value})
      </span>
    )
  }

  if (value >= 25) {
    return (
      <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full px-2.5 py-1">
        MEDIUM ({value})
      </span>
    )
  }

  return (
    <span className="text-xs font-semibold bg-green-100 text-green-700 rounded-full px-2.5 py-1">
      LOW ({value})
    </span>
  )
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [selectedVolunteer, setSelectedVolunteer] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState<Record<string, boolean>>({})
  const [filter, setFilter] = useState("ALL")

  useEffect(() => {
    const fetchClaims = axios.get("/api/admin/claims")
    const fetchVolunteers = axios.get("/api/admin/users?role=VOLUNTEER")

    Promise.all([fetchClaims, fetchVolunteers])
      .then(([claimsRes, volunteersRes]) => {
        const sortedClaims = claimsRes.data.slice().sort((a: Claim, b: Claim) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0))
        setClaims(sortedClaims)
        setVolunteers(volunteersRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleStatus = async (claimId: string, status: string) => {
    try {
      await axios.patch(`/api/admin/claims/${claimId}`, { action: "updateStatus", status })
      setClaims((prev) =>
        prev.map((c) => (c.id === claimId ? { ...c, status } : c))
      )
    } catch {
      alert("Something went wrong")
    }
  }

  const handleAssignVolunteer = async (claimId: string) => {
    const volunteerId = selectedVolunteer[claimId]
    if (!volunteerId) {
      alert("Select a volunteer first")
      return
    }

    setAssigning((prev) => ({ ...prev, [claimId]: true }))
    try {
      const res = await axios.patch(`/api/admin/claims/${claimId}`, {
        action: "assignVolunteer",
        volunteerId,
      })
      setClaims((prev) =>
        prev.map((c) =>
          c.id === claimId
            ? {
                ...c,
                status: "UNDER_REVIEW",
                verification: {
                  ...res.data,
                  volunteer: volunteers.find((v) => v.id === volunteerId) || null,
                },
              }
            : c
        )
      )
    } catch {
      alert("Something went wrong")
    } finally {
      setAssigning((prev) => ({ ...prev, [claimId]: false }))
    }
  }

  const filtered = filter === "ALL" ? claims : claims.filter((c) => c.status === filter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">All Claims</h1>
        <p className="text-gray-500 mt-1">Manage and approve damage claims</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["ALL", "PENDING", "UNDER_REVIEW", "FIELD_VERIFIED", "APPROVED", "RELIEF_ASSIGNED", "COMPLETED", "REJECTED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
              ${filter === f ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {statusLabel(f)}
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
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-semibold">{claim.farmer.user.name}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusConfig[claim.status] || ""}`}>
                        {statusLabel(claim.status)}
                      </span>
                      <span className="ml-auto">
                        {renderPriorityBadge(claim.priorityScore)}
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
                  {claim.status === "PENDING" && (
                    <div className="grid gap-2 ml-4 w-full md:w-auto">
                      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                        <select
                          value={selectedVolunteer[claim.id] || ""}
                          onChange={(event) =>
                            setSelectedVolunteer((prev) => ({
                              ...prev,
                              [claim.id]: event.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-base"
                        >
                          <option value="">Assign volunteer</option>
                          {volunteers.map((vol) => (
                            <option key={vol.id} value={vol.id}>
                              {vol.name}
                            </option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          className="gradient-btn cursor-pointer"
                          disabled={!selectedVolunteer[claim.id] || assigning[claim.id]}
                          onClick={() => handleAssignVolunteer(claim.id)}
                        >
                          {assigning[claim.id] ? "Assigning..." : "Assign"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {claim.status === "FIELD_VERIFIED" && (
                    <div className="flex gap-2 ml-4 flex-wrap">
                      <Link href={`/admin/verify-claim/${claim.id}`}>
                        <Button size="sm" className="gradient-btn cursor-pointer">
                          Review
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        className="gradient-btn cursor-pointer"
                        onClick={() => handleStatus(claim.id, "APPROVED")}
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-4 py-2.5 rounded-xl border-2 border-sky-500 text-sky-600 dark:text-sky-400 font-semibold hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all text-sm"
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