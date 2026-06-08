"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, FileText, CheckCircle, Gift } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma" 

interface Stats {
  totalLand: number
  totalClaims: number
  approvedClaims: number
  relievedClaims: number
  farmerName: string
}

export default function FarmerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentRisk, setCurrentRisk] = useState<string | null>(null)

  useEffect(() => {
    axios
      .get("/api/farmer/stats")
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    // fetch lands to compute overall worst risk
    axios
      .get("/api/land")
      .then((res) => {
        type LandWithRisk = { riskLevel?: string | null }
        const lands: LandWithRisk[] = res.data || []
        const severity: Record<string, number> = {
          EMERGENCY: 4,
          HIGH: 3,
          MODERATE: 2,
          LOW: 1,
        }
        let worst: string | null = null
        let worstScore = 0
        for (const l of lands) {
          const r = l.riskLevel
          const score = r ? (severity[r] ?? 0) : 0
          if (score > worstScore) {
            worstScore = score
            worst = r ?? null
          }
        }
        setCurrentRisk(worst)
      })
      .catch(console.error)
  }, [])

  const cards = [
    {
      title: "Total Land Registered",
      value: stats?.totalLand ?? 0,
      icon: MapPin,
      iconColor: "text-sky-500",
      iconBg: "bg-sky-500/10",
      href: "/farmer/my-land",
    },
    {
      title: "Claims Submitted",
      value: stats?.totalClaims ?? 0,
      icon: FileText,
      iconColor: "text-teal-500",
      iconBg: "bg-teal-500/10",
      href: "/farmer/my-claims",
    },
    {
      title: "Approved Claims",
      value: stats?.approvedClaims ?? 0,
      icon: CheckCircle,
      iconColor: "text-green-500",
      iconBg: "bg-green-500/10",
      href: "/farmer/my-claims",
    },
    {
      title: "Relief Received",
      value: stats?.relievedClaims ?? 0,
      icon: Gift,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-500/10",
      href: "/farmer/my-claims",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Farmer Dashboard</h1>
        <p className="text-base text-gray-500 mt-1">
          Welcome back! Here&apos;s an overview of your farm and claims.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link href={card.href} key={card.title}>
              <div className="glass-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-default">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {card.title}
                    </p>
                    <p className="text-4xl font-bold mt-2 text-slate-800 dark:text-slate-100">
                      {loading ? "..." : card.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${card.iconBg}`}>
                    <Icon className={`${card.iconColor} w-6 h-6`} />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/farmer/add-land">
              <Button className="gradient-btn cursor-pointer w-full text-base font-medium py-3">
                + Register New Land
              </Button>
            </Link>
            <Link href="/farmer/report-loss">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-base font-medium">
                Report Crop Loss
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg">
              {currentRisk === "EMERGENCY" || currentRisk === "HIGH" ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                  <div>
                    <p className="text-base font-semibold text-red-800">High Flood Risk</p>
                    <p className="text-sm text-red-600">One or more of your land plots fall inside a high-risk zone</p>
                  </div>
                </div>
              ) : currentRisk === "MODERATE" ? (
                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                  <div>
                    <p className="text-base font-semibold text-yellow-800">Moderate Risk</p>
                    <p className="text-sm text-yellow-600">Check the flood map for your area</p>
                  </div>
                </div>
              ) : currentRisk === "LOW" ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-3 h-3 rounded-full bg-green-600" />
                  <div>
                    <p className="text-base font-semibold text-green-800">Low Risk</p>
                    <p className="text-sm text-green-600">No high or moderate risk detected for your lands</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <div>
                    <p className="text-base font-semibold text-gray-700">No Risk Data</p>
                    <p className="text-sm text-gray-600">Risk data not available for your registered lands</p>
                  </div>
                </div>
              )}
              </div>
            <Link href="/map/flood-risk" className="mt-3 block">
              <Button variant="outline" className="w-full text-sm">
                View Flood Risk Map
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const reliefId = params.id
    const body = await req.json()
    const { farmerFeedback, farmerRating } = body

    if (farmerFeedback === undefined && farmerRating === undefined) {
      return new NextResponse("No feedback provided", { status: 400 })
    }

    // FIX: Accessing through standard uppercase/lowercase object property fallback check
    // If your schema uses lowercase, NextJS Turbopack cache sometimes needs Pascal dynamic check
    const prismaModel = (prisma as any).reliefAssignment || (prisma as any).ReliefAssignment;
    
    if (!prismaModel) {
      return new NextResponse("Prisma model ReliefAssignment configuration missing", { status: 500 })
    }

    const existingRelief = await prismaModel.findUnique({
      where: { id: reliefId },
      include: {
        claim: {
          include: {
            farmer: {
              include: {
                user: true,
              },
            },
          },
        },
        assignedVolunteer: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!existingRelief) {
      return new NextResponse("Relief assignment not found", { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (farmerFeedback !== undefined) updateData.farmerFeedback = farmerFeedback
    if (farmerRating !== undefined) updateData.farmerRating = farmerRating

    const updatedRelief = await prismaModel.update({
      where: { id: reliefId },
      data: updateData,
    })

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    })

    const notifications: Array<{
      userId: string
      title: string
      message: string
      link?: string
    }> = []

    const farmerName =
      existingRelief.claim?.farmer?.user?.name ??
      "Farmer"

    if (farmerFeedback) {
      admins.forEach((admin) => {
        notifications.push({
          userId: admin.id,
          title: "New farmer feedback",
          message: `${farmerName} submitted delivery feedback for claim ${existingRelief.claimId}.`,
          link: `/admin/claims/${existingRelief.claimId}`,
        })
      })
    }

    if (
      farmerRating !== undefined &&
      existingRelief.assignedVolunteerId
    ) {
      notifications.push({
        userId: existingRelief.assignedVolunteerId,
        title: "You received a volunteer rating",
        message: `${farmerName} rated your distribution ${farmerRating} star(s).`,
        link: `/volunteer/assigned-claims`,
      })
    }

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      })
    }

    return NextResponse.json(updatedRelief)
  } catch (error) {
    console.error("Relief PUT error:", error)
    return new NextResponse(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}