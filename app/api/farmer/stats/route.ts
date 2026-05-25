import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

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

    const [totalLand, totalClaims, approvedClaims, relievedClaims] =
      await Promise.all([
        prisma.landPlot.count({ where: { farmerId: farmer.id } }),
        prisma.damageClaim.count({ where: { farmerId: farmer.id } }),
        prisma.damageClaim.count({
          where: { farmerId: farmer.id, status: "APPROVED" },
        }),
        prisma.damageClaim.count({
          where: { farmerId: farmer.id, status: "COMPLETED" },
        }),
      ])

    return NextResponse.json({
      totalLand,
      totalClaims,
      approvedClaims,
      relievedClaims,
      farmerName: payload.email,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}