import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const { deliveryStatus } = await req.json()

    const relief = await prisma.reliefDistribution.update({
      where: { id },
      data: { deliveryStatus },
    })

    if (deliveryStatus === "COMPLETED") {
      await prisma.damageClaim.update({
        where: { id: relief.claimId },
        data: { status: "COMPLETED" },
      })
    }

    return NextResponse.json(relief)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}