"use client"

import { useEffect } from "react"
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const center: [number, number] = [23.6850, 90.3563]

const riskColors: Record<string, string> = {
  LOW: "#22c55e",
  MODERATE: "#eab308",
  HIGH: "#ef4444",
  EMERGENCY: "#a855f7",
}

const riskOpacity: Record<string, number> = {
  LOW: 0.2,
  MODERATE: 0.25,
  HIGH: 0.3,
  EMERGENCY: 0.35,
}

const zoneIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [0, -32],
})

function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

interface FloodZone {
  id: string
  name: string
  riskLevel: string
  latitude: number
  longitude: number
  radius: number
  description: string | null
}

interface AdminFloodZoneMapProps {
  zones: FloodZone[]
  selectedPosition: { lat: number; lng: number } | null
  radiusKm: number
  onSelect: (lat: number, lng: number) => void
}

export default function AdminFloodZoneMap({
  zones,
  selectedPosition,
  radiusKm,
  onSelect,
}: AdminFloodZoneMapProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })
    }
  }, [])

  return (
    <MapContainer center={center} zoom={7} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      <MapClickHandler onSelect={onSelect} />

      {zones.map((zone) => (
        <Circle
          key={zone.id}
          center={[zone.latitude, zone.longitude]}
          radius={zone.radius}
          pathOptions={{
            color: riskColors[zone.riskLevel] || "#22c55e",
            fillColor: riskColors[zone.riskLevel] || "#22c55e",
            fillOpacity: riskOpacity[zone.riskLevel] ?? 0.25,
            weight: 2,
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{zone.name}</p>
              <p className="text-xs font-medium mt-1" style={{ color: riskColors[zone.riskLevel] || "#22c55e" }}>
                {zone.riskLevel} RISK
              </p>
              {zone.description && <p className="text-gray-600 mt-1">{zone.description}</p>}
            </div>
          </Popup>
        </Circle>
      ))}

      {selectedPosition && (
        <>
          <Marker position={[selectedPosition.lat, selectedPosition.lng]} icon={zoneIcon}>
            <Popup>Selected zone location</Popup>
          </Marker>
          <Circle
            center={[selectedPosition.lat, selectedPosition.lng]}
            radius={radiusKm * 1000}
            pathOptions={{ color: "#2563eb", fillOpacity: 0.15 }}
          />
        </>
      )}
    </MapContainer>
  )
}
