import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authorizeToken } from "@/lib/auth"

const validRiskLevels = ["LOW", "MODERATE", "HIGH", "EMERGENCY"]

export async function GET() {
  try {
    const zones = await prisma.floodZone.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ zones })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    const payload = authorizeToken(token, ["ADMIN"])
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { name, riskLevel, radiusKm, latitude, longitude, description } = await req.json()

    if (!name || !riskLevel || radiusKm == null || latitude == null || longitude == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!validRiskLevels.includes(riskLevel)) {
      return NextResponse.json({ error: "Invalid risk level" }, { status: 400 })
    }

    const zone = await prisma.floodZone.create({
      data: {
        name,
        riskLevel,
        radius: Number(radiusKm) * 1000,
        latitude: Number(latitude),
        longitude: Number(longitude),
        description: description || null,
      },
    })

    return NextResponse.json(zone)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
