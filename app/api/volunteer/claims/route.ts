import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authorizeToken } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    const payload = authorizeToken(token, ["VOLUNTEER"])
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const claims = await prisma.damageClaim.findMany({
      where: {
        verification: { volunteerId: payload.userId },
        status: { in: ["UNDER_REVIEW", "FIELD_VERIFIED"] },
      },
      include: {
        photos: true,
        land: true,
        farmer: {
          include: { user: { select: { name: true, email: true } } },
        },
        verification: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(claims)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}