import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./lib/auth"
import { getRoleDashboard } from "./lib/utils"

const protectedRoutes: Record<string, string> = {
  "/farmer": "FARMER",
  "/admin": "ADMIN",
  "/volunteer": "VOLUNTEER",
  "/ngo": "NGO",
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const matchedRoute = Object.entries(protectedRoutes).find(([route]) =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

  if (!matchedRoute) {
    return NextResponse.next()
  }

  const token = req.cookies.get("token")?.value
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const [, expectedRole] = matchedRoute
  if (payload.role !== expectedRole) {
    const redirectUrl = getRoleDashboard(payload.role)
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/farmer/:path*",
    "/volunteer/:path*",
    "/ngo/:path*",
    "/admin/:path*",
  ],
}
