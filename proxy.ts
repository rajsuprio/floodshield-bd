import { NextRequest, NextResponse } from "next/server"

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get("token")?.value

  const protectedPrefixes = ["/farmer", "/volunteer", "/ngo", "/admin"]
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url))
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