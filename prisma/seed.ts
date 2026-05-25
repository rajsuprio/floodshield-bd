import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  await prisma.floodZone.deleteMany()

  await prisma.floodZone.createMany({
    data: [
      {
        name: "Sylhet Sadar",
        riskLevel: "EMERGENCY",
        latitude: 24.8949,
        longitude: 91.8687,
        radius: 15000,
        description: "Severely flood-prone area near Surma River",
      },
      {
        name: "Sunamganj",
        riskLevel: "EMERGENCY",
        latitude: 24.9917,
        longitude: 91.3976,
        radius: 20000,
        description: "Haor region - extreme flood risk",
      },
      {
        name: "Netrokona",
        riskLevel: "HIGH",
        latitude: 24.8703,
        longitude: 90.7279,
        radius: 12000,
        description: "High flood risk zone near Mogra River",
      },
      {
        name: "Jamalpur",
        riskLevel: "HIGH",
        latitude: 24.9375,
        longitude: 89.9370,
        radius: 18000,
        description: "Brahmaputra flood plain",
      },
      {
        name: "Sirajganj",
        riskLevel: "HIGH",
        latitude: 24.4534,
        longitude: 89.7006,
        radius: 14000,
        description: "Jamuna river flood zone",
      },
      {
        name: "Dhaka Sadar",
        riskLevel: "MODERATE",
        latitude: 23.8103,
        longitude: 90.4125,
        radius: 10000,
        description: "Urban flood risk - drainage issues",
      },
      {
        name: "Manikganj",
        riskLevel: "MODERATE",
        latitude: 23.8624,
        longitude: 89.9718,
        radius: 11000,
        description: "Padma river moderate flood zone",
      },
      {
        name: "Rajshahi",
        riskLevel: "LOW",
        latitude: 24.3745,
        longitude: 88.6042,
        radius: 8000,
        description: "Low flood risk area",
      },
      {
        name: "Rangpur",
        riskLevel: "LOW",
        latitude: 25.7439,
        longitude: 89.2752,
        radius: 9000,
        description: "Minimal flood risk zone",
      },
    ],
  })

  console.log("✅ Flood zones seeded successfully!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())