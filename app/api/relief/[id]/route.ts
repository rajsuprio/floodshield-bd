import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { createNotification, notifyAllAdmins } from "@/lib/notifications"

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
    const body = await req.json()
    const { deliveryStatus, farmerFeedback, farmerRating } = body

    // fetch existing relief to know related volunteer and claim/farmer
    const existing = await prisma.reliefDistribution.findUnique({
      where: { id },
      include: { volunteer: true, claim: { include: { farmer: { include: { user: true } } } } },
    })

    if (!existing) return NextResponse.json({ error: "Relief not found" }, { status: 404 })

    const updateData: any = {}
    if (typeof deliveryStatus !== "undefined") updateData.deliveryStatus = deliveryStatus
    if (typeof farmerFeedback !== "undefined") updateData.farmerFeedback = farmerFeedback
    if (typeof farmerRating !== "undefined") updateData.farmerRating = farmerRating

    const relief = await prisma.reliefDistribution.update({
      where: { id },
      data: updateData,
      include: { volunteer: true, claim: { include: { farmer: { include: { user: true } } } } },
    })

    // If volunteer marked completed
    if (deliveryStatus === "COMPLETED") {
      const claim = await prisma.damageClaim.update({
        where: { id: relief.claimId },
        data: { status: "COMPLETED" },
        include: { farmer: { include: { user: true } } },
      })

      await notifyAllAdmins(
        "Relief Distribution Completed",
        `A volunteer has marked the relief delivery for ${claim.farmer?.user?.name || "a farmer"} as completed.`
      )

      if (payload?.userId) {
        await createNotification(
          payload.userId,
          "Distribution Completed",
          "You have marked the assigned relief distribution as completed."
        )
      }

      if (claim?.farmer?.userId) {
        await createNotification(
          claim.farmer.userId,
          "Relief Delivered",
          "Your relief package has been marked as delivered. Please share feedback for the volunteer."
        )
      }
    }

    // If farmer submitted feedback (could be separate action), notify admins
    if (typeof farmerFeedback !== "undefined" && farmerFeedback) {
      const farmerName = relief.claim?.farmer?.user?.name || "a farmer"
      await notifyAllAdmins(
        "New farmer feedback received",
        `${farmerName} submitted feedback for relief claim ${relief.claimId}.`,
        "FARMER_FEEDBACK",
        "/admin/feedback"
      )

      // If farmer also provided a rating, notify the assigned volunteer
      if (typeof farmerRating !== "undefined" && farmerRating != null && relief.volunteer && relief.volunteer.id) {
        await createNotification(
          relief.volunteer.id,
          "You received a rating",
          `You received a ${farmerRating}/5 rating from ${farmerName}.`
        )
      }
    }

    return NextResponse.json(relief)
  } catch (error) {
    console.error("Relief PUT error:", error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}