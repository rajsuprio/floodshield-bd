import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const zones = await prisma.floodZone.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(zones)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}