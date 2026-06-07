import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authorizeToken } from "@/lib/auth"
import { calculatePriorityScore } from "@/lib/priority"
import { createNotification } from "@/lib/notifications"

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    const payload = authorizeToken(token, ["ADMIN"])
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
        verification: {
          include: {
            volunteer: { select: { id: true, name: true, email: true } },
          },
        },
        relief: true,
      },
      orderBy: [{ priorityScore: "desc" }, { createdAt: "desc" }],
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
    const payload = authorizeToken(token, ["ADMIN"])
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { claimId, status } = await req.json()

    // Get the farmer's userId to send notification
    const claim = await prisma.damageClaim.findUnique({
      where: { id: claimId },
      include: { farmer: { include: { user: true } } },
    })

    if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 })

    const updated = await prisma.damageClaim.update({
      where: { id: claimId },
      data: { status },
    })

    // Create notification based on status
    const farmerId = claim.farmer.userId
    if (status === "APPROVED") {
      await createNotification(
        farmerId,
        "Claim Approved",
        "Your crop loss claim has been approved."
      )
    } else if (status === "RELIEF_ASSIGNED") {
      await createNotification(
        farmerId,
        "Relief Assigned",
        "Relief package has been assigned to your claim."
      )
    } else if (status === "COMPLETED") {
      await createNotification(
        farmerId,
        "Relief Delivered",
        "Your relief package has been marked as delivered."
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}