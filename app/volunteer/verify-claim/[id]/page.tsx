"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, MapPin, Upload, Loader2 } from "lucide-react"

export default function VerifyClaimPage() {
  const { id } = useParams()
  const router = useRouter()
  const [claim, setClaim] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notes, setNotes] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    axios.get("/api/volunteer/claims")
      .then((res) => {
        const found = res.data.find((c: any) => c.id === id)
        setClaim(found)
        if (found?.verification) {
          setNotes(found.verification.notes || "")
          setPhotoUrl(found.verification.photoUrl || "")
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await axios.post("/api/upload", formData)
      setPhotoUrl(res.data.url)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (status: "VERIFIED" | "SUSPICIOUS") => {
    setSubmitting(true)
    try {
      await axios.post("/api/volunteer/verify", {
        claimId: id,
        notes,
        verificationStatus: status,
        photoUrl,
      })
      setSuccess(true)
      setTimeout(() => router.push("/volunteer/assigned-claims"), 1500)
    } catch {
      alert("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" size={32} /></div>
  if (!claim) return <div className="p-6 text-gray-500">Claim not found</div>
  if (success) return (
    <div className="flex items-center justify-center h-64 text-center">
      <div>
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-green-700">Verification Submitted!</h2>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verify Claim</h1>
        <p className="text-gray-500 mt-1">Review and verify this crop loss claim</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Claim Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Farmer</p>
              <p className="font-medium">{claim.farmer.user.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Crop Type</p>
              <p className="font-medium">{claim.cropType}</p>
            </div>
            <div>
              <p className="text-gray-500">Location</p>
              <p className="font-medium">{claim.land.district}, {claim.land.upazila}</p>
            </div>
            <div>
              <p className="text-gray-500">Loss</p>
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
          </div>
          {claim.description && (
            <div className="pt-2 border-t">
              <p className="text-gray-500 text-sm">Description</p>
              <p className="text-sm mt-1">{claim.description}</p>
            </div>
          )}
          {claim.photos.length > 0 && (
            <div className="pt-2 border-t">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Field Notes</Label>
            <Textarea
              placeholder="Describe what you observed at the location..."
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Verification Photo (optional)</Label>
            <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              {uploading ? (
                <Loader2 size={20} className="animate-spin text-gray-400" />
              ) : photoUrl ? (
                <img src={photoUrl} alt="Verification" className="h-full object-cover rounded-lg" />
              ) : (
                <div className="text-center text-gray-400">
                  <Upload size={20} className="mx-auto mb-1" />
                  <p className="text-xs">Upload field photo</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleSubmit("VERIFIED")}
              disabled={submitting}
            >
              <CheckCircle size={16} className="mr-2" />
              Mark as Verified
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              onClick={() => handleSubmit("SUSPICIOUS")}
              disabled={submitting}
            >
              <XCircle size={16} className="mr-2" />
              Mark as Suspicious
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}