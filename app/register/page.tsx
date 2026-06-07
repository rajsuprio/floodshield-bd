"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["FARMER", "VOLUNTEER"]),
  district: z.string().min(1, "District is required"),
  upazila: z.string().min(1, "Upazila is required"),
  phone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "FARMER" },
  })

  const onSubmit = async (data: FormData) => {
  setLoading(true)
  setError("")
  setSuccess("")
  try {
    const res = await axios.post("/api/auth/register", data)
    setSuccess(res.data.message || "Account created successfully")
    const role = res.data.role.toLowerCase()
    setTimeout(() => {
      window.location.href = `/${role}/dashboard`
    }, 700)
  } catch (err: any) {
    setError(err.response?.data?.error || "Something went wrong")
  } finally {
    setLoading(false)
  }
}

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md glass-card p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl">🌊</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Welcome to FloodShield BD
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Protecting farmers, delivering relief
          </p>
        </div>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-base py-2.5 px-3" id="name" placeholder="Your full name" {...register("name")} />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-base py-2.5 px-3" id="email" type="email" placeholder="your@email.com" {...register("email")} />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-base py-2.5 px-3" id="password" type="password" placeholder="Min 6 characters" {...register("password")} />
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                defaultValue="FARMER"
                className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-2.5 text-base transition-colors outline-none text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50"
                {...register("role")}
              >
                <option value="FARMER">Farmer / Citizen</option>
                <option value="VOLUNTEER">Volunteer / Field Officer</option>
              </select>
              {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="district">District</Label>
              <Input className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-base py-2.5 px-3" id="district" placeholder="e.g. Sylhet" {...register("district")} />
              {errors.district && <p className="text-red-500 text-xs">{errors.district.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="upazila">Upazila</Label>
              <Input className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-base py-2.5 px-3" id="upazila" placeholder="e.g. Companiganj" {...register("upazila")} />
              {errors.upazila && <p className="text-red-500 text-xs">{errors.upazila.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-base py-2.5 px-3" id="phone" placeholder="01XXXXXXXXX" {...register("phone")} />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 rounded-xl p-4 text-sm mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl p-4 text-sm mb-4">
                {success}
              </div>
            )}

            <Button
              type="submit"
              className="gradient-btn cursor-pointer w-full text-base py-3"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}