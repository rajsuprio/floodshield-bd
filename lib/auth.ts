import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: {
  userId: string
  email: string
  role: string
}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      role: string
    }
  } catch {
    return null
  }
}

export function authorizeToken(token?: string, allowedRoles: string[] = []) {
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) return null
  return payload
}