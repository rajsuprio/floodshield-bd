import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [
      totalUsers, totalClaims, totalLand,
      totalRelief, verifiedClaims, completedClaims,
      claimsByStatus, claimsByCrop, claimsByDistrict,
      recentClaims,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.damageClaim.count(),
      prisma.landPlot.count(),
      prisma.reliefDistribution.count(),
      prisma.fieldVerification.count(),
      prisma.damageClaim.count({ where: { status: "COMPLETED" } }),

      prisma.damageClaim.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      prisma.damageClaim.groupBy({
        by: ["cropType"],
        _count: { cropType: true },
        orderBy: { _count: { cropType: "desc" } },
        take: 6,
      }),

      prisma.landPlot.groupBy({
        by: ["district"],
        _count: { district: true },
        orderBy: { _count: { district: "desc" } },
        take: 6,
      }),

      prisma.damageClaim.findMany({
        take: 7,
        orderBy: { createdAt: "asc" },
        select: { createdAt: true, lossPercentage: true },
      }),
    ])

    const statusData = claimsByStatus.map((s) => ({
      name: s.status.replace(/_/g, " "),
      value: s._count.status,
    }))

    const cropData = claimsByCrop.map((c) => ({
      name: c.cropType,
      claims: c._count.cropType,
    }))

    const districtData = claimsByDistrict.map((d) => ({
      name: d.district,
      plots: d._count.district,
    }))

    const trendData = recentClaims.map((c, i) => ({
      day: `Day ${i + 1}`,
      claims: i + 1,
      loss: Math.round(c.lossPercentage),
    }))

    return NextResponse.json({
      stats: {
        totalUsers,
        totalClaims,
        totalLand,
        totalRelief,
        verifiedClaims,
        completedClaims,
      },
      statusData,
      cropData,
      districtData,
      trendData,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}