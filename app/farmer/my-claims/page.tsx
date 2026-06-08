"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
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
  relief?: {
    id: string
    packageDetails: string
    farmerFeedback?: string | null
    farmerRating?: number | null
    volunteer?: { id: string; name: string } | null
  }
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Submitted", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
  UNDER_REVIEW: { label: "Under Review", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400" },
  FIELD_VERIFIED: { label: "Field Verified", color: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" },
  REJECTED: { label: "Rejected", color: "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400" },
  RELIEF_ASSIGNED: { label: "Relief Assigned", color: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" },
  COMPLETED: { label: "Completed", color: "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400" },
}

export default function MyClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [rating, setRating] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({})

  useEffect(() => {
    axios
      .get("/api/claims")
      .then((res) => setClaims(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSubmitFeedback = async (reliefId: string) => {
    setSubmitting((prev) => ({ ...prev, [reliefId]: true }))
    try {
      const response = await axios.put(`/api/relief/${reliefId}`, {
        farmerFeedback: feedback[reliefId],
        farmerRating: rating[reliefId],
      })
      setClaims((prev) =>
        prev.map((claim) =>
          claim.relief?.id === reliefId
            ? { ...claim, relief: response.data }
            : claim
        )
      )
      toast.success("Thank you for your feedback")
    } catch (error) {
      console.error(error)
      const msg = (error as any)?.response?.data?.error || (error as any)?.message || "Unable to submit feedback. Please try again."
      toast.error(msg)
    } finally {
      setSubmitting((prev) => ({ ...prev, [reliefId]: false }))
    }
  }

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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Claims</h1>
          <p className="text-gray-500 mt-1">Track your crop loss claims</p>
        </div>
        <Link href="/farmer/report-loss">
          <Button className="gradient-btn cursor-pointer">
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
              <Button className="gradient-btn cursor-pointer">
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

                  {claim.status === "COMPLETED" && claim.relief && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Relief Delivery Feedback</p>
                      <p className="text-xs text-slate-500 mb-3">Tell us if you received the package clearly and rate the volunteer.</p>

                      {claim.relief.volunteer && (
                        <p className="text-xs text-slate-500 mb-3">
                          Assigned volunteer: <span className="font-medium text-slate-700">{claim.relief.volunteer.name}</span>
                        </p>
                      )}

                      <div className="space-y-3 mb-3">
                        <div>
                          <p className="text-xs text-slate-500">Package received</p>
                          <p className="text-sm text-slate-700 mt-1">{claim.relief.packageDetails}</p>
                        </div>

                        {claim.relief.farmerRating == null ? (
                          <>
                            <div>
                              <p className="text-xs text-slate-500">Rate the volunteer</p>
                              <div className="flex gap-2 mt-2 text-yellow-500">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating((prev) => ({ ...prev, [claim.relief!.id]: star }))}
                                    className={`text-xl ${rating[claim.relief?.id ?? ''] >= star ? "text-amber-500" : "text-slate-300"}`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="text-xs text-slate-500">Feedback</label>
                              <textarea
                                value={feedback[claim.relief.id] || ""}
                                onChange={(e) => setFeedback((prev) => ({ ...prev, [claim.relief!.id]: e.target.value }))}
                                rows={3}
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                                placeholder="Did you receive the items clearly?"
                              />
                            </div>

                            <Button
                              className="gradient-btn cursor-pointer w-full text-sm"
                              disabled={submitting[claim.relief.id] || !feedback[claim.relief.id]}
                              onClick={() => handleSubmitFeedback(claim.relief!.id)}
                            >
                              {submitting[claim.relief.id] ? "Submitting..." : "Submit Feedback"}
                            </Button>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-slate-500">Volunteer rating</p>
                            <p className="text-sm font-medium text-slate-800">{claim.relief.farmerRating} / 5</p>
                            <p className="text-xs text-slate-500">Feedback</p>
                            <p className="text-sm text-slate-700">{claim.relief.farmerFeedback}</p>
                          </div>
                        )}
                      </div>
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