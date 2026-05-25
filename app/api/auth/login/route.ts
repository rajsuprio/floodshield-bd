import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, generateToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })

    const token = generateToken({ userId: user.id, email: user.email, role: user.role })

    const res = NextResponse.json({ message: "Login successful", role: user.role })
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })
    return res
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}