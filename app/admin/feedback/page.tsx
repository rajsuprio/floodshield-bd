"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, User, MessageSquare, Loader2 } from "lucide-react"

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get("/api/admin/relief")
        setFeedbacks(response.data)
      } catch (error) {
        console.error("Failed to fetch feedbacks:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeedbacks()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Farmer Feedback</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View feedback from farmers about relief distributions
        </p>
      </div>

      {feedbacks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600 dark:text-gray-400">
              No feedback received yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {feedback.claim?.farmer?.user?.name?.charAt(0) || "F"}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {feedback.claim?.farmer?.user?.name || "Unknown Farmer"}
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Claim: {feedback.claimId}
                        </p>
                      </div>
                    </div>
                  </div>
                  {feedback.farmerRating && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={
                            i < feedback.farmerRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }
                        />
                      ))}
                      <span className="ml-2 font-semibold">
                        {feedback.farmerRating}/5
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {feedback.farmerFeedback && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={18} className="text-blue-500" />
                      <span className="font-semibold text-sm">Feedback</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {feedback.farmerFeedback}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Assigned Volunteer
                    </p>
                    <p className="font-semibold mt-1">
                      {feedback.volunteer?.name || "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Delivery Status
                    </p>
                    <p className="font-semibold mt-1">
                      <Badge
                        variant="secondary"
                        className={
                          feedback.deliveryStatus === "COMPLETED"
                            ? "bg-green-100 text-green-700 dark:bg-green-500/20"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-500/20"
                        }
                      >
                        {feedback.deliveryStatus}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500">
                    Feedback received on{" "}
                    {feedback.feedbackAt
                      ? new Date(feedback.feedbackAt).toLocaleString()
                      : "Not specified"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
