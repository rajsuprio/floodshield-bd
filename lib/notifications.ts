import { prisma } from "@/lib/prisma"

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type?: string,
  link?: string
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
        read: false,
      },
    })
  } catch (error) {
    console.error("Error creating notification:", error)
  }
}

export async function notifyAllAdmins(
  title: string,
  message: string,
  type?: string,
  link?: string
) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    })

    for (const admin of admins) {
      await createNotification(admin.id, title, message, type, link)
    }
  } catch (error) {
    console.error("Error notifying admins:", error)
  }
}
