import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authorizeToken } from "@/lib/auth"
import { createNotification } from "@/lib/notifications"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("token")?.value
    const payload = authorizeToken(token, ["ADMIN"])
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id: claimId } = await params
    const { action, volunteerId, status } = await req.json()

    if (action === "assignVolunteer") {
      if (!volunteerId) {
        return NextResponse.json({ error: "Volunteer ID is required" }, { status: 400 })
      }

      const existing = await prisma.fieldVerification.findFirst({
        where: { claimId },
      })

      let verification
      if (existing) {
        verification = await prisma.fieldVerification.update({
          where: { id: existing.id },
          data: {
            volunteerId,
            verificationStatus: "ASSIGNED",
          },
        })
      } else {
        verification = await prisma.fieldVerification.create({
          data: {
            claimId,
            volunteerId,
            verificationStatus: "ASSIGNED",
          },
        })
      }

      await prisma.damageClaim.update({
        where: { id: claimId },
        data: { status: "UNDER_REVIEW" },
      })

      await createNotification(
        volunteerId,
        "New Claim Assignment",
        `You have been assigned to verify claim ${claimId}.`
      )

      return NextResponse.json(verification)
    }

    if (action === "updateStatus") {
      if (!status) {
        return NextResponse.json({ error: "Status is required" }, { status: 400 })
      }

      const updatedClaim = await prisma.damageClaim.update({
        where: { id: claimId },
        data: { status },
      })

      return NextResponse.json(updatedClaim)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
