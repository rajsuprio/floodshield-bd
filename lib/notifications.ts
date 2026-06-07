import { prisma } from "@/lib/prisma"

export async function createNotification(
  userId: string,
  title: string,
  message: string
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        read: false,
      },
    })
  } catch (error) {
    console.error("Error creating notification:", error)
  }
}

  export async function notifyAllAdmins(title: string, message: string) {
    try {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      })

      for (const admin of admins) {
        await createNotification(admin.id, title, message)
      }
    } catch (error) {
      console.error("Error notifying admins:", error)
    }
  }
