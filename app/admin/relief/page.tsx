"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Package, Loader2, CheckCircle } from "lucide-react"

const statusConfig: Record<string, string> = {
  PENDING: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  FIELD_VERIFIED: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  RELIEF_ASSIGNED: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  COMPLETED: "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400",
}

const reliefItems = [
  "Rice (10kg)", "Lentils (2kg)", "Cooking Oil (2L)",
  "Cash Support (BDT 2000)", "Seeds", "Fertilizer",
]

export default function AdminReliefPage() {
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [packageDetails, setPackageDetails] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState("ALL")

  useEffect(() => {
    axios.get("/api/admin/claims")
      .then((res) => setClaims(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === "ALL"
    ? claims
    : filter === "HIGH"
    ? claims.filter((c) => c.priorityScore >= 30)
    : claims.filter((c) => c.status === filter)

  const handleAssignRelief = async () => {
    if (!selectedClaim || !packageDetails) return
    setSubmitting(true)
    try {
      await axios.post("/api/relief", {
        claimId: selectedClaim.id,
        packageDetails,
      })
      setClaims((prev) =>
        prev.map((c) =>
          c.id === selectedClaim.id ? { ...c, status: "RELIEF_ASSIGNED" } : c
        )
      )
      setSelectedClaim(null)
      setPackageDetails("")
    } catch {
      alert("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Relief Management</h1>
        <p className="text-gray-500 mt-1">Assign relief packages to verified victims</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["ALL", "HIGH", "FIELD_VERIFIED", "APPROVED", "RELIEF_ASSIGNED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
              ${filter === f ? "bg-purple-600 text-white border-purple-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {f === "ALL" ? "All Claims" : f === "HIGH" ? "High Priority" : f.replace(/_/g, " ")}
            <span className="ml-1 opacity-70">
              ({f === "ALL" ? claims.length : f === "HIGH" ? claims.filter(c => c.priorityScore >= 30).length : claims.filter(c => c.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-purple-600" size={32} />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((claim) => (
            <Card key={claim.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{claim.farmer.user.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[claim.status] || "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"}`}>
                        {claim.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-bold text-purple-600 ml-auto">
                        Priority: {claim.priorityScore}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={12} />
                      {claim.land.district}, {claim.land.upazila} — {claim.cropType} — {claim.lossPercentage}% loss
                    </p>
                    {claim.verification && (
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <CheckCircle size={10} />
                        Field verified
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="gradient-btn cursor-pointer ml-4"
                    onClick={() => { setSelectedClaim(claim); setPackageDetails(claim.relief?.packageDetails || "") }}
                    disabled={claim.status === "COMPLETED"}
                  >
                    <Package size={14} className="mr-1" />
                    {claim.relief ? "Update" : "Assign Relief"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Relief Package</DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-medium">{selectedClaim.farmer.user.name}</p>
                <p className="text-gray-500">{selectedClaim.land.district}, {selectedClaim.land.upazila}</p>
                <p className="text-purple-600 font-medium mt-1">Priority Score: {selectedClaim.priorityScore}</p>
              </div>

              <div>
                <Label className="mb-2 block">Select Relief Items</Label>
                <div className="grid grid-cols-2 gap-2">
                  {reliefItems.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setPackageDetails((prev) =>
                          prev.includes(item)
                            ? prev.replace(item + "\n", "").replace(item, "").trim()
                            : prev + (prev ? "\n" : "") + item
                        )
                      }}
                      className={`text-xs px-3 py-2 rounded-lg border text-left transition-colors
                        ${packageDetails.includes(item)
                          ? "bg-purple-50 border-purple-300 text-purple-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label>Package Details</Label>
                <Textarea
                  value={packageDetails}
                  onChange={(e) => setPackageDetails(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="px-4 py-2.5 rounded-xl border-2 border-sky-500 text-sky-600 dark:text-sky-400 font-semibold hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all text-sm flex-1" onClick={() => setSelectedClaim(null)}>
                  Cancel
                </Button>
                <Button
                  className="gradient-btn cursor-pointer flex-1"
                  onClick={handleAssignRelief}
                  disabled={submitting || !packageDetails}
                >
                  {submitting ? "Assigning..." : "Assign Relief"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}