"use client"

import { useEffect, useState } from "react"
import {
  MapContainer,
  TileLayer,
  Circle,
  Popup,
  useMapEvents,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const riskColors: Record<string, string> = {
  LOW: "#22c55e",
  MODERATE: "#eab308",
  HIGH: "#ef4444",
  EMERGENCY: "#a855f7",
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

interface FloodZoneAdminMapProps {
  zones: FloodZone[]
  selectedPosition: { lat: number; lng: number } | null
  onSelect: (lat: number, lng: number) => void
  onDeleteZone: (zoneId: string) => Promise<void>
  radiusKm: number
}

function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function FloodZoneAdminMap({
  zones,
  selectedPosition,
  onSelect,
  onDeleteZone,
  radiusKm,
}: FloodZoneAdminMapProps) {
  return (
    <MapContainer
      center={[23.6850, 90.3563]}
      zoom={7}
      style={{ height: "100%", width: "100%" }}
    >
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
            fillOpacity: 0.3,
            weight: 2,
          }}
        >
          <Popup>
            <div className="space-y-2 min-w-[200px]">
              <div>
                <p className="font-bold text-gray-900">{zone.name}</p>
                <p className="text-xs text-gray-600">{zone.riskLevel} RISK</p>
              </div>
              {zone.description && (
                <p className="text-xs text-gray-600">{zone.description}</p>
              )}
              <p className="text-xs text-gray-500">
                Radius: {(zone.radius / 1000).toFixed(1)} km
              </p>
              <button
                onClick={() => onDeleteZone(zone.id)}
                className="w-full bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded transition-colors"
              >
                Delete Zone
              </button>
            </div>
          </Popup>
        </Circle>
      ))}

      {selectedPosition && (
        <Circle
          center={[selectedPosition.lat, selectedPosition.lng]}
          radius={radiusKm * 1000}
          pathOptions={{
            color: "#2563eb",
            fillColor: "#2563eb",
            fillOpacity: 0.15,
            weight: 2,
            dashArray: "5, 5",
          }}
        />
      )}
    </MapContainer>
  )
}
