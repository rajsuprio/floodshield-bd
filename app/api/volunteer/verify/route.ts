import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { createNotification } from "@/lib/notifications"
import { notifyAllAdmins } from "@/lib/notifications"

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { claimId, notes, verificationStatus, photoUrl } = await req.json()

    // Get farmer info for notification
    const claim = await prisma.damageClaim.findUnique({
      where: { id: claimId },
      include: { farmer: { include: { user: true } } },
    })

    if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 })

    const existing = await prisma.fieldVerification.findUnique({
      where: { claimId },
    })

    let isNewAssignment = false
    if (existing) {
      await prisma.fieldVerification.update({
        where: { claimId },
        data: { notes, verificationStatus, photoUrl },
      })
    } else {
      await prisma.fieldVerification.create({
        data: {
          claimId,
          volunteerId: payload.userId,
          notes,
          verificationStatus,
          photoUrl,
        },
      })
      isNewAssignment = true
    }

    await prisma.damageClaim.update({
      where: { id: claimId },
      data: {
        status: verificationStatus === "VERIFIED" ? "FIELD_VERIFIED" : "UNDER_REVIEW",
      },
    })

    // Send notification if this is a new volunteer assignment
    if (isNewAssignment) {
      await createNotification(
        claim.farmer.userId,
        "Claim Under Review",
        "A volunteer has been assigned to verify your claim."
      )
    }

    const volunteerInfo = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { name: true },
    })
    await notifyAllAdmins(
      "Claim Verification Completed",
      `${volunteerInfo?.name} has completed verification (Status: ${verificationStatus}).`
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}