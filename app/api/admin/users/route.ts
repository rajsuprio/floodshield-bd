import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authorizeToken } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    const payload = authorizeToken(token, ["ADMIN"])
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(req.url)
    const role = url.searchParams.get("role")
    const validRoles = ["FARMER", "VOLUNTEER", "NGO", "ADMIN"]

    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role filter" }, { status: 400 })
    }

    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}