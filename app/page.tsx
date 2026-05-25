import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Shield, BarChart2, Users } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🌊</span>
          <span className="text-white font-bold text-xl">FloodShield BD</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10">Login</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-white text-blue-900 hover:bg-blue-50">Register</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm px-4 py-2 rounded-full mb-6">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Bangladesh Flood Response System
        </div>
        <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
          Protecting Farmers,<br />Coordinating Relief
        </h1>
        <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
          A complete flood disaster management platform for Bangladesh. Report crop damage,
          verify claims, and coordinate relief distribution efficiently.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/map/flood-risk">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
              View Flood Map
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: MapPin, title: "Flood Risk Map", desc: "Real-time risk zones" },
            { icon: Shield, title: "Claim Verification", desc: "Field-verified claims" },
            { icon: BarChart2, title: "Smart Analytics", desc: "Data-driven insights" },
            { icon: Users, title: "Multi-Role System", desc: "Farmer, NGO, Admin" },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="bg-white/10 backdrop-blur rounded-xl p-5 text-white">
                <Icon size={24} className="mb-3 text-blue-200" />
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-blue-200 text-xs mt-1">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}