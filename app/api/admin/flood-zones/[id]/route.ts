import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authorizeToken } from "@/lib/auth"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("token")?.value
    const payload = authorizeToken(token, ["ADMIN"])
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id: zoneId } = await params
    await prisma.floodZone.delete({ where: { id: zoneId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
