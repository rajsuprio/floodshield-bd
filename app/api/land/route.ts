import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

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

    return NextResponse.json(lands)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}