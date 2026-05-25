import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { claimId, packageDetails, assignedVolunteer } = await req.json()

    const existing = await prisma.reliefDistribution.findUnique({
      where: { claimId },
    })

    if (existing) {
      const updated = await prisma.reliefDistribution.update({
        where: { claimId },
        data: { packageDetails, assignedVolunteer, deliveryStatus: "ASSIGNED" },
      })
      await prisma.damageClaim.update({
        where: { id: claimId },
        data: { status: "RELIEF_ASSIGNED" },
      })
      return NextResponse.json(updated)
    }

    const relief = await prisma.reliefDistribution.create({
      data: { claimId, packageDetails, assignedVolunteer, deliveryStatus: "ASSIGNED" },
    })

    await prisma.damageClaim.update({
      where: { id: claimId },
      data: { status: "RELIEF_ASSIGNED" },
    })

    return NextResponse.json(relief, { status: 201 })
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

    const reliefs = await prisma.reliefDistribution.findMany({
      include: {
        claim: {
          include: {
            farmer: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
            land: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(reliefs)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}