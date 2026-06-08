import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Shield, BarChart2, Users } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌊</span>
            <span className="text-xl font-bold text-white">FloodShield BD</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              How It Works
            </a>
            <Link
              href="/map/flood-risk"
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              Risk Map
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-white font-medium text-sm hover:text-white/80 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-white text-blue-600 px-5 py-2 rounded-full font-semibold text-sm hover:bg-blue-50 transition-all shadow-lg"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0c1a2e] via-[#0ea5e9] to-[#14b8a6]">
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-20">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-white text-sm font-medium">
              Bangladesh Flood Response System
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Protecting Farmers,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-300">
              Coordinating Relief
            </span>
          </h1>

          <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            A complete flood disaster management platform for Bangladesh. Report crop damage,
            verify claims, and coordinate relief distribution efficiently.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-base hover:bg-blue-50 transition-all shadow-xl hover:-translate-y-1 hover:shadow-2xl"
            >
              Get Started Free
            </Link>
            <Link
              href="/map/flood-risk"
              className="px-8 py-4 border-2 border-white text-white rounded-full font-bold text-base hover:bg-white hover:text-blue-600 transition-all hover:-translate-y-1"
            >
              🗺️ View Risk Map
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <div className="relative h-32 overflow-hidden">
            <div className="wave absolute bottom-0 w-[200%] h-full bg-white/10 rounded-[100%]" style={{ left: '-50%' }}></div>
            <div
              className="wave2 absolute bottom-0 w-[200%] h-full bg-white/5 rounded-[100%]"
              style={{ left: '-50%', animationDelay: '-2s' }}
            ></div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-6 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Built specifically for Bangladesh's flood relief ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🗺️",
                title: "Flood Risk Map",
                desc: "Real-time risk zones across Bangladesh with color-coded severity levels",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: "📋",
                title: "Claim Verification",
                desc: "Field volunteers verify crop damage with photo evidence",
                color: "from-teal-500 to-green-500",
              },
              {
                icon: "📊",
                title: "Smart Analytics",
                desc: "Data-driven insights for efficient relief distribution",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: "👥",
                title: "Multi-Role System",
                desc: "Farmer, Volunteer, NGO, and Admin roles with tailored dashboards",
                color: "from-orange-500 to-red-500",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="glass-card p-6 hover:-translate-y-2 transition-all duration-300 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}
                >
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-6 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Register",
                desc: "Farmer signs up and registers their land plots with GPS location",
              },
              {
                step: "2",
                title: "Report Damage",
                desc: "Submit flood damage claim with photos and loss percentage",
              },
              {
                step: "3",
                title: "Field Verification",
                desc: "Volunteer visits location and verifies the damage on-site",
              },
              {
                step: "4",
                title: "Receive Relief",
                desc: "Approved claims get relief packages delivered to farmers",
              },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg">
                  {s.step}
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">{s.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#0c1a2e] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🌊</span>
                <span className="text-xl font-bold">FloodShield BD</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Protecting Bangladesh's farming communities through technology-driven flood relief coordination.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-slate-300">Quick Links</h4>
              <div className="flex flex-col gap-2">
                <Link href="/map/flood-risk" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Flood Risk Map
                </Link>
                <Link href="/register" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Register as Farmer
                </Link>
                <Link href="/login" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Login
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-slate-300">For Users</h4>
              <div className="flex flex-col gap-2">
                <span className="text-slate-400 text-sm">👨‍🌾 Farmers</span>
                <span className="text-slate-400 text-sm">🤝 Volunteers</span>
                <span className="text-slate-400 text-sm">🏢 NGOs</span>
                <span className="text-slate-400 text-sm">⚙️ Administrators</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6 text-center">
            <p className="text-slate-500 text-sm">
              © 2026 FloodShield BD. Built for Bangladesh's resilience.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}