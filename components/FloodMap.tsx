"use client"

import { useEffect } from "react"
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  Popup,
  useMap,
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
  MODERATE: "#f59e0b",
  HIGH: "#ef4444",
  EMERGENCY: "#7c3aed",
}

const riskOpacity: Record<string, number> = {
  LOW: 0.2,
  MODERATE: 0.25,
  HIGH: 0.3,
  EMERGENCY: 0.35,
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

interface LandPlot {
  id: string
  cropType: string
  district: string
  upazila: string
  latitude: number
  longitude: number
  landSize: number
}

const farmIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [0, -32],
})

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center])
  return null
}

export default function FloodMap({
  zones,
  lands,
}: {
  zones: FloodZone[]
  lands: LandPlot[]
}) {
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
      <RecenterMap center={[23.6850, 90.3563]} />

      {zones.map((zone) => (
        <Circle
          key={zone.id}
          center={[zone.latitude, zone.longitude]}
          radius={zone.radius}
          pathOptions={{
            color: riskColors[zone.riskLevel],
            fillColor: riskColors[zone.riskLevel],
            fillOpacity: riskOpacity[zone.riskLevel],
            weight: 2,
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{zone.name}</p>
              <p
                className="text-xs font-medium mt-1"
                style={{ color: riskColors[zone.riskLevel] }}
              >
                {zone.riskLevel} RISK
              </p>
              {zone.description && (
                <p className="text-gray-600 mt-1">{zone.description}</p>
              )}
            </div>
          </Popup>
        </Circle>
      ))}

      {lands.map((land) => (
        <Marker
          key={land.id}
          position={[land.latitude, land.longitude]}
          icon={farmIcon}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{land.cropType}</p>
              <p className="text-gray-600">
                {land.district}, {land.upazila}
              </p>
              <p className="text-gray-600">{land.landSize} acres</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}