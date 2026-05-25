import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center px-4">
      <div className="text-center text-white">
        <div className="text-8xl mb-6">🌊</div>
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-blue-100 text-xl mb-8">Page not found</p>
        <Link href="/">
          <Button className="bg-white text-blue-900 hover:bg-blue-50 px-8">
            Go Home
          </Button>
        </Link>
      </div>
    </main>
  )
}