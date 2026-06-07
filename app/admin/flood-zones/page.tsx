"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const FloodZoneAdminMap = dynamic(
  () => import("@/components/FloodZoneAdminMap"),
  { ssr: false }
)

export default function AdminFloodZonesPage() {
  const [zones, setZones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fetchingLive, setFetchingLive] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [form, setForm] = useState({
    name: "",
    riskLevel: "LOW",
    radiusKm: "10",
    description: "",
  })

  const loadZones = async () => {
    setLoading(true)
    try {
      const res = await axios.get("/api/admin/flood-zones")
      setZones(res.data.zones || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadZones()
  }, [])

  const handleSave = async () => {
    if (!selectedPosition) {
      alert("Click on the map to choose the zone location")
      return
    }
    if (!form.name.trim()) {
      alert("Enter a zone name")
      return
    }

    setSaving(true)
    try {
      await axios.post("/api/admin/flood-zones", {
        name: form.name,
        riskLevel: form.riskLevel,
        radiusKm: Number(form.radiusKm),
        latitude: selectedPosition.lat,
        longitude: selectedPosition.lng,
        description: form.description,
      })
      setForm({ name: "", riskLevel: "LOW", radiusKm: "10", description: "" })
      setSelectedPosition(null)
      await loadZones()
    } catch (error) {
      console.error(error)
      alert("Unable to create flood zone")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (zoneId: string) => {
    if (!confirm("Delete this flood zone?")) return
    setDeletingId(zoneId)
    try {
      await axios.delete(`/api/admin/flood-zones/${zoneId}`)
      await loadZones()
    } catch (error) {
      console.error(error)
      alert("Unable to delete flood zone")
    } finally {
      setDeletingId(null)
    }
  }

  const handleFetchLive = async () => {
    setFetchingLive(true)
    try {
      const res = await axios.get("/api/flood-zones/fetch-live")
      await loadZones()
      alert(`Live data imported: ${res.data.imported} zones`)
    } catch (error) {
      console.error(error)
    } finally {
      setFetchingLive(false)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Flood Zone Management</h1>
          <p className="text-gray-500 mt-1">Create, remove, and refresh risk zones for Bangladesh.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleFetchLive}
            disabled={fetchingLive}
          >
            {fetchingLive ? "Fetching live data..." : "Fetch Live Data"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <Card className="overflow-hidden">
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Click the map to place a zone</p>
              <p className="text-xs text-gray-500">Selected location will be used for new zone creation.</p>
            </div>

            <div className="h-[460px] rounded-3xl overflow-hidden border border-gray-200">
              {loading ? (
                <div className="h-full flex items-center justify-center bg-gray-50">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
              ) : (
                <FloodZoneAdminMap
                  zones={zones}
                  selectedPosition={selectedPosition}
                  radiusKm={Number(form.radiusKm || 10)}
                  onSelect={(lat, lng) => setSelectedPosition({ lat, lng })}
                  onDeleteZone={handleDelete}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="space-y-4 p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Zone Name</label>
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="Flood zone name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Risk Level</label>
              <select
                value={form.riskLevel}
                onChange={(event) => setForm((prev) => ({ ...prev, riskLevel: event.target.value }))}
                className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="LOW">LOW</option>
                <option value="MODERATE">MODERATE</option>
                <option value="HIGH">HIGH</option>
                <option value="EMERGENCY">EMERGENCY</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Radius (km)</label>
              <input
                type="number"
                min="1"
                value={form.radiusKm}
                onChange={(event) => setForm((prev) => ({ ...prev, radiusKm: event.target.value }))}
                className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="mt-2 block w-full min-h-[110px] rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="Optional zone description"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleSave}
                disabled={saving || !selectedPosition || !form.name.trim()}
                className="flex-1"
              >
                {saving ? "Saving..." : "Save Zone"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedPosition(null)
                  setForm({ name: "", riskLevel: "LOW", radiusKm: "10", description: "" })
                }}
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Saved Flood Zones</h2>
              <p className="text-sm text-gray-500">Manage existing zones created in the system.</p>
            </div>
            <span className="text-sm text-gray-600">{zones.length} zones</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-blue-600" size={28} />
            </div>
          ) : zones.length === 0 ? (
            <p className="text-sm text-gray-500">No zones have been created yet.</p>
          ) : (
            <div className="space-y-2">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{zone.name}</p>
                    <p className="text-xs text-gray-600">
                      {zone.riskLevel} • {(zone.radius / 1000).toFixed(1)} km
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(zone.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
