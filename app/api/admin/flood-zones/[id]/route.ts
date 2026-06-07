import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authorizeToken } from "@/lib/auth"
import { Prisma } from "@prisma/client"

const validRiskLevels = ["LOW", "MODERATE", "HIGH", "EMERGENCY"]

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("token")?.value
    const payload = authorizeToken(token, ["ADMIN"])
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const { name, riskLevel, radiusKm, latitude, longitude, description } = await req.json()

    const updateData = {} as Prisma.FloodZoneUpdateInput
    if (name != null) updateData.name = name
    if (riskLevel != null) {
      if (!validRiskLevels.includes(riskLevel)) {
        return NextResponse.json({ error: "Invalid risk level" }, { status: 400 })
      }
      updateData.riskLevel = riskLevel
    }
    if (radiusKm != null) updateData.radius = Number(radiusKm) * 1000
    if (latitude != null) updateData.latitude = Number(latitude)
    if (longitude != null) updateData.longitude = Number(longitude)
    if (description != null) updateData.description = description || null

    const updated = await prisma.floodZone.update({ where: { id }, data: updateData })
    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("token")?.value
    const payload = authorizeToken(token, ["ADMIN"])
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    await prisma.floodZone.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
