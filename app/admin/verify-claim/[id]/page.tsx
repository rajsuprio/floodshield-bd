"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, MapPin, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminVerifyClaimPage() {
  const { id } = useParams()
  const router = useRouter()
  const [claim, setClaim] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    axios.get("/api/admin/claims")
      .then((res) => {
        const found = res.data.find((c: any) => c.id === id)
        setClaim(found)
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleStatus = async (status: string) => {
    setSubmitting(true)
    try {
      await axios.put("/api/admin/claims", { claimId: id, status })
      router.push("/admin/claims")
    } catch {
      alert("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin" size={32} />
    </div>
  )

  if (!claim) return (
    <div className="p-6 text-gray-500">Claim not found</div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/claims">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Review Claim</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Claim Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Farmer Name</p>
              <p className="font-medium">{claim.farmer.user.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{claim.farmer.user.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Crop Type</p>
              <p className="font-medium">{claim.cropType}</p>
            </div>
            <div>
              <p className="text-gray-500">Loss Percentage</p>
              <p className="font-medium text-red-600">{claim.lossPercentage}%</p>
            </div>
            <div>
              <p className="text-gray-500">Affected Area</p>
              <p className="font-medium">{claim.affectedArea} acres</p>
            </div>
            <div>
              <p className="text-gray-500">Date of Damage</p>
              <p className="font-medium">{new Date(claim.dateOfDamage).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Location</p>
              <p className="font-medium flex items-center gap-1">
                <MapPin size={12} />
                {claim.land.district}, {claim.land.upazila}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Priority Score</p>
              <p className="font-medium text-purple-600">{claim.priorityScore}</p>
            </div>
          </div>

          {claim.description && (
            <div className="border-t pt-3">
              <p className="text-gray-500 text-sm">Description</p>
              <p className="text-sm mt-1">{claim.description}</p>
            </div>
          )}

          {claim.verification && (
            <div className="border-t pt-3 bg-green-50 rounded-lg p-3">
              <p className="text-sm font-medium text-green-700 mb-1">✓ Field Verified</p>
              <p className="text-xs text-green-600">{claim.verification.notes}</p>
            </div>
          )}

          {claim.photos?.length > 0 && (
            <div className="border-t pt-3">
              <p className="text-gray-500 text-sm mb-2">Damage Photos</p>
              <div className="flex gap-2 flex-wrap">
                {claim.photos.map((photo: any, i: number) => (
                  <img key={i} src={photo.url} alt="Damage" className="w-24 h-24 object-cover rounded-lg border" />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          onClick={() => handleStatus("APPROVED")}
          disabled={submitting || claim.status === "APPROVED"}
        >
          <CheckCircle size={16} className="mr-2" />
          Approve Claim
        </Button>
        <Button
          className="flex-1 bg-red-500 hover:bg-red-600 text-white"
          onClick={() => handleStatus("REJECTED")}
          disabled={submitting || claim.status === "REJECTED"}
        >
          <XCircle size={16} className="mr-2" />
          Reject Claim
        </Button>
      </div>
    </div>
  )
}