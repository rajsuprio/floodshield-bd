"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, Loader2, ImageIcon } from "lucide-react"

const schema = z.object({
  landId: z.string().min(1, "Please select a land plot"),
  cropType: z.string().min(1, "Crop type is required"),
  affectedArea: z.string().min(1, "Affected area is required"),
  lossPercentage: z.string().min(1, "Loss percentage is required"),
  description: z.string().optional(),
  dateOfDamage: z.string().min(1, "Date of damage is required"),
})

type FormData = z.infer<typeof schema>

interface LandPlot {
  id: string
  cropType: string
  district: string
  upazila: string
  landSize: number
}

interface UploadedPhoto {
  url: string
  publicId: string
}

export default function ReportLossPage() {
  const [lands, setLands] = useState<LandPlot[]>([])
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    axios.get("/api/land").then((res) => setLands(res.data))
  }, [])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append("file", file)
        const res = await axios.post("/api/upload", formData)
        setPhotos((prev) => [...prev, res.data])
      }
    } catch {
      setError("Photo upload failed")
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (publicId: string) => {
    setPhotos((prev) => prev.filter((p) => p.publicId !== publicId))
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError("")
    try {
      await axios.post("/api/claims", { ...data, photos })
      setSuccess(true)
      setTimeout(() => {
        window.location.href = "/farmer/my-claims"
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-700">Claim Submitted!</h2>
          <p className="text-gray-500 mt-1">Redirecting to your claims...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Report Crop Loss</h1>
        <p className="text-gray-500 mt-1">Submit a flood damage claim for your land</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Damage Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Select Affected Land</Label>
              <Select onValueChange={(val) => setValue("landId", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your land plot" />
                </SelectTrigger>
                <SelectContent>
                  {lands.map((land) => (
                    <SelectItem key={land.id} value={land.id}>
                      {land.cropType} — {land.district}, {land.upazila} ({land.landSize} acres)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.landId && <p className="text-red-500 text-xs">{errors.landId.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Crop Type</Label>
                <Input className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-base py-2.5 px-3" placeholder="e.g. Rice" {...register("cropType")} />
                {errors.cropType && <p className="text-red-500 text-xs">{errors.cropType.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Date of Damage</Label>
                <Input className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-base py-2.5 px-3" type="date" {...register("dateOfDamage")} />
                {errors.dateOfDamage && <p className="text-red-500 text-xs">{errors.dateOfDamage.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Affected Area (acres)</Label>
                <Input className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-base py-2.5 px-3" type="number" step="0.01" placeholder="e.g. 1.5" {...register("affectedArea")} />
                {errors.affectedArea && <p className="text-red-500 text-xs">{errors.affectedArea.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Loss Percentage (%)</Label>
                <Input className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-base py-2.5 px-3" type="number" min="1" max="100" placeholder="e.g. 75" {...register("lossPercentage")} />
                {errors.lossPercentage && <p className="text-red-500 text-xs">{errors.lossPercentage.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Describe the flood damage in detail..."
                rows={3}
                {...register("description")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon size={16} />
              Damage Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center gap-2 text-gray-500">
                {uploading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <Upload size={24} />
                )}
                <p className="text-sm">
                  {uploading ? "Uploading..." : "Click to upload damage photos"}
                </p>
                <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                disabled={uploading}
              />
            </label>

            {photos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {photos.map((photo) => (
                  <div key={photo.publicId} className="relative group">
                    <img
                      src={photo.url}
                      alt="Damage"
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.publicId)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 text-base py-3"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="gradient-btn cursor-pointer flex-1 text-base py-3"
            disabled={loading || uploading}
          >
            {loading ? "Submitting..." : "Submit Claim"}
          </Button>
        </div>
      </form>
    </div>
  )
}