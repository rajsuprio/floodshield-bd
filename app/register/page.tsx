"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["FARMER", "VOLUNTEER", "NGO", "ADMIN"]),
  district: z.string().min(1, "District is required"),
  upazila: z.string().min(1, "Upazila is required"),
  phone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "FARMER" },
  })

  const onSubmit = async (data: FormData) => {
  setLoading(true)
  setError("")
  try {
    const res = await axios.post("/api/auth/register", data)
    const role = res.data.role.toLowerCase()
    window.location.href = `/${role}/dashboard`
  } catch (err: any) {
    setError(err.response?.data?.error || "Something went wrong")
  } finally {
    setLoading(false)
  }
}

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🌊</div>
          <CardTitle className="text-2xl text-blue-900">Create Account</CardTitle>
          <CardDescription>Join FloodShield BD</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Your full name" {...register("name")} />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" {...register("email")} />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Min 6 characters" {...register("password")} />
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Role</Label>
              <Select defaultValue="FARMER" onValueChange={(val) => setValue("role", val as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FARMER">Farmer / Citizen</SelectItem>
                  <SelectItem value="VOLUNTEER">Volunteer / Field Officer</SelectItem>
                  <SelectItem value="NGO">NGO / Relief Organization</SelectItem>
                  <SelectItem value="ADMIN">Admin / Government Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="district">District</Label>
              <Input id="district" placeholder="e.g. Sylhet" {...register("district")} />
              {errors.district && <p className="text-red-500 text-xs">{errors.district.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="upazila">Upazila</Label>
              <Input id="upazila" placeholder="e.g. Companiganj" {...register("upazila")} />
              {errors.upazila && <p className="text-red-500 text-xs">{errors.upazila.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" placeholder="01XXXXXXXXX" {...register("phone")} />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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