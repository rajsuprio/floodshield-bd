import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, generateToken } from "@/lib/auth"
import { notifyAllAdmins } from "@/lib/notifications"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, district, upazila, phone } =
      await req.json()

    if (!name || !email || !password || !district || !upazila) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "FARMER",
        farmerProfile:
          role === "FARMER" || !role
            ? {
                create: {
                  phone,
                  district,
                  upazila,
                },
              }
            : undefined,
      },
    })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const response = NextResponse.json(
      { message: "Account created successfully", role: user.role },
      { status: 201 }
    )

    // Notify all admins
    await notifyAllAdmins(
      "New User Registration",
      `${name} has registered as a ${role || "FARMER"}.`
    )

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response
  } catch (error) {
    console.error(error)
    const message = error instanceof Error ? error.message : "Something went wrong"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}