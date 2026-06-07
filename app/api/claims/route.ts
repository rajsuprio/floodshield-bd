import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { notifyAllAdmins } from "@/lib/notifications"

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: payload.userId },
    })
    if (!farmer) return NextResponse.json({ error: "Farmer not found" }, { status: 404 })

    const {
      landId, cropType, affectedArea,
      lossPercentage, description, dateOfDamage, photos,
    } = await req.json()

    const claim = await prisma.damageClaim.create({
      data: {
        farmerId: farmer.id,
        landId,
        cropType,
        affectedArea: parseFloat(affectedArea),
        lossPercentage: parseFloat(lossPercentage),
        description,
        dateOfDamage: new Date(dateOfDamage),
        status: "PENDING",
        photos: photos?.length
          ? {
              create: photos.map((p: { url: string; publicId: string }) => ({
                url: p.url,
                publicId: p.publicId,
              })),
            }
          : undefined,
      },
      include: { photos: true },
    })

    // Notify all admins
    const userInfo = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { name: true },
    })
    await notifyAllAdmins(
      "New Damage Claim Submitted",
      `${userInfo?.name} has submitted a new damage claim for ${cropType} (${lossPercentage}% loss).`
    )

    return NextResponse.json(claim, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: payload.userId },
    })
    if (!farmer) return NextResponse.json({ error: "Farmer not found" }, { status: 404 })

    const claims = await prisma.damageClaim.findMany({
      where: { farmerId: farmer.id },
      include: { photos: true, land: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(claims)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
