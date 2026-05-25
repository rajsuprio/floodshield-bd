import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { claimId, notes, verificationStatus, photoUrl } = await req.json()

    const existing = await prisma.fieldVerification.findUnique({
      where: { claimId },
    })

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
    }

    await prisma.damageClaim.update({
      where: { id: claimId },
      data: {
        status: verificationStatus === "VERIFIED" ? "FIELD_VERIFIED" : "UNDER_REVIEW",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}