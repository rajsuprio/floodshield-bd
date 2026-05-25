import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { calculatePriorityScore } from "@/lib/priority"

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const claims = await prisma.damageClaim.findMany({
      include: {
        farmer: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        land: true,
        photos: true,
        verification: true,
        relief: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const claimsWithScore = claims.map((claim) => {
      const score = calculatePriorityScore({
        lossPercentage: claim.lossPercentage,
        affectedArea: claim.affectedArea,
        isVerified: !!claim.verification,
        hasReceivedRelief: !!claim.relief,
      })
      return { ...claim, priorityScore: score }
    })

    claimsWithScore.sort((a, b) => b.priorityScore - a.priorityScore)

    return NextResponse.json(claimsWithScore)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { claimId, status } = await req.json()

    const claim = await prisma.damageClaim.update({
      where: { id: claimId },
      data: { status },
    })

    return NextResponse.json(claim)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}