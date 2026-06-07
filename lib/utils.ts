import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRoleDashboard(role: string) {
  switch (role) {
    case "FARMER":
      return "/farmer/dashboard"
    case "ADMIN":
      return "/admin/dashboard"
    case "VOLUNTEER":
      return "/volunteer/dashboard"
    case "NGO":
      return "/ngo/dashboard"
    default:
      return "/login"
  }
}
