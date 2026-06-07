import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authorizeToken } from "@/lib/auth"

const alertLevelMap: Record<string, string> = {
  GREEN: "LOW",
  ORANGE: "MODERATE",
  RED: "HIGH",
  PURPLE: "EMERGENCY",
  VIOLET: "EMERGENCY",
  LOW: "LOW",
  MODERATE: "MODERATE",
  HIGH: "HIGH",
  EMERGENCY: "EMERGENCY",
}

function mapRiskLevel(value: unknown) {
  if (!value) return "LOW"
  const normalized = String(value).trim().toUpperCase()
  return alertLevelMap[normalized] || "LOW"
}

function getCoordinates(event: any) {
  const lat = event.latitude ?? event.Latitude ?? event.lat ?? event.Lat ?? event.location?.lat
  const lng = event.longitude ?? event.Longitude ?? event.lon ?? event.Lng ?? event.location?.lon ?? event.location?.lng

  if (typeof lat === "number" && typeof lng === "number") {
    return { latitude: lat, longitude: lng }
  }

  if (event.geometry?.coordinates) {
    const [lon, lat] = event.geometry.coordinates
    if (typeof lat === "number" && typeof lon === "number") {
      return { latitude: lat, longitude: lon }
    }
  }

  if (event.point?.coordinates) {
    const [lon, lat] = event.point.coordinates
    if (typeof lat === "number" && typeof lon === "number") {
      return { latitude: lat, longitude: lon }
    }
  }

  if (event.location?.latitude && event.location?.longitude) {
    return {
      latitude: Number(event.location.latitude),
      longitude: Number(event.location.longitude),
    }
  }

  return null
}

function extractEvents(payload: any) {
  if (!payload) return []
  if (Array.isArray(payload.events)) return payload.events
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.features)) return payload.features
  return []
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    const payload = authorizeToken(token, ["ADMIN"])
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const response = await fetch(
      "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventtype=FL&country=BGD"
    )
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch live data" }, { status: 502 })
    }

    const body = await response.json().catch(() => null)
    const events = extractEvents(body)

    const created: string[] = []
    for (const event of events) {
      const coords = getCoordinates(event)
      if (!coords) continue

      const zoneName = event.title || event.name || event.event || "GDACS Flood Event"
      const riskLevel = mapRiskLevel(event.alertlevel ?? event.alertLevel ?? event.severity)
      const description = event.description || event.details || event.summary || "Imported from GDACS"

      const existing = await prisma.floodZone.findFirst({
        where: {
          name: zoneName,
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      })

      if (existing) {
        await prisma.floodZone.update({
          where: { id: existing.id },
          data: {
            riskLevel,
            radius: existing.radius || 10000,
            description: description || existing.description,
          },
        })
      } else {
        await prisma.floodZone.create({
          data: {
            name: zoneName,
            riskLevel,
            latitude: coords.latitude,
            longitude: coords.longitude,
            radius: 10000,
            description: `${description} (Source: GDACS)`,
          },
        })
      }
      created.push(zoneName)
    }

    return NextResponse.json({ imported: created.length })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
