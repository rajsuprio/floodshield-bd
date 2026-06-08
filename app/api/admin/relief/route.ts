import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch relief distributions with farmer feedback
    const feedbacks = await prisma.reliefDistribution.findMany({
      where: {
        farmerFeedback: {
          not: null,
        },
      },
      include: {
        claim: {
          include: {
            farmer: {
              include: {
                user: true,
              },
            },
          },
        },
        volunteer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(feedbacks)
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    )
  }
}
