import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { getLandRiskLevel } from "@/lib/geoUtils"

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: payload.userId },
    })
    if (!farmer) return NextResponse.json({ error: "Farmer profile not found" }, { status: 404 })

    const {
      cropType, landSize, district, upazila, union,
      latitude, longitude, plantingDate, harvestDate,
    } = await req.json()

    const land = await prisma.landPlot.create({
      data: {
        farmerId: farmer.id,
        cropType,
        landSize: parseFloat(landSize),
        district,
        upazila,
        union,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        plantingDate: plantingDate ? new Date(plantingDate) : null,
        harvestDate: harvestDate ? new Date(harvestDate) : null,
      },
    })

    return NextResponse.json(land, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: payload.userId },
    })
    if (!farmer) return NextResponse.json({ error: "Farmer not found" }, { status: 404 })

    const lands = await prisma.landPlot.findMany({
      where: { farmerId: farmer.id },
      orderBy: { createdAt: "desc" },
    })

    const zones = await prisma.floodZone.findMany()
    const mappedZones = zones.map((z) => ({
      latitude: z.latitude,
      longitude: z.longitude,
      // convert stored meters to km
      radius: (z.radius ?? 0) / 1000,
      riskLevel: z.riskLevel,
    }))

    const landsWithRisk = lands.map((l) => ({
      ...l,
      riskLevel: getLandRiskLevel(l.latitude, l.longitude, mappedZones),
    }))

    return NextResponse.json(landsWithRisk)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}