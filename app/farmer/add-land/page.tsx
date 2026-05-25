"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios from "axios"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false })

const schema = z.object({
  cropType: z.string().min(1, "Crop type is required"),
  landSize: z.string().min(1, "Land size is required"),
  district: z.string().min(1, "District is required"),
  upazila: z.string().min(1, "Upazila is required"),
  union: z.string().optional(),
  plantingDate: z.string().optional(),
  harvestDate: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function AddLandPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [coords, setCoords] = useState({ lat: 23.8103, lng: 90.4125 })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError("")
    try {
      await axios.post("/api/land", {
        ...data,
        latitude: coords.lat,
        longitude: coords.lng,
      })
      window.location.href = "/farmer/my-land"
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Register New Land</h1>
        <p className="text-gray-500 mt-1">Add your agricultural land details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin size={18} className="text-blue-600" />
            Select Location on Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
            <MapPicker coords={coords} setCoords={setCoords} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click on the map to set your land location. Current: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Land Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Crop Type</Label>
                <Input placeholder="e.g. Rice, Wheat" {...register("cropType")} />
                {errors.cropType && <p className="text-red-500 text-xs">{errors.cropType.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Land Size (acres)</Label>
                <Input type="number" step="0.01" placeholder="e.g. 2.5" {...register("landSize")} />
                {errors.landSize && <p className="text-red-500 text-xs">{errors.landSize.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>District</Label>
                <Input placeholder="e.g. Sylhet" {...register("district")} />
                {errors.district && <p className="text-red-500 text-xs">{errors.district.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Upazila</Label>
                <Input placeholder="e.g. Companiganj" {...register("upazila")} />
                {errors.upazila && <p className="text-red-500 text-xs">{errors.upazila.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Union (optional)</Label>
              <Input placeholder="e.g. Islampur" {...register("union")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Planting Date</Label>
                <Input type="date" {...register("plantingDate")} />
              </div>
              <div className="space-y-1">
                <Label>Harvest Date</Label>
                <Input type="date" {...register("harvestDate")} />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? "Saving..." : "Register Land"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}