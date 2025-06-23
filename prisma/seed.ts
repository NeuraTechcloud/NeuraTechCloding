import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...")

  // Criar usuário de demonstração
  const hashedPassword = await bcrypt.hash("senha123", 12)

  const demoUser = await prisma.user.upsert({
    where: { email: "cliente@rastreramos.com" },
    update: {},
    create: {
      email: "cliente@rastreramos.com",
      name: "Cliente Demonstração",
      password: hashedPassword,
      userType: "CLIENT",
    },
  })

  console.log("✅ Usuário criado:", demoUser.email)

  // Criar veículos de demonstração
  const vehicles = [
    {
      name: "Fiat Strada",
      plate: "RIO2A18",
      imei: "358723000000010",
      lat: -22.4841,
      lng: -42.9645,
      address: "BR-101, Itaboraí - RJ",
    },
    {
      name: "Honda Civic",
      plate: "SAO4B22",
      imei: "358723000000011",
      lat: -22.9774,
      lng: -43.2039,
      address: "R. Jardim Botânico, Rio de Janeiro - RJ",
    },
    {
      name: "VW Nivus",
      plate: "BHZ7C33",
      imei: "358723000000012",
      lat: -19.9167,
      lng: -43.9345,
      address: "Praça da Liberdade, Belo Horizonte - MG",
    },
  ]

  for (const vehicleData of vehicles) {
    const vehicle = await prisma.vehicle.upsert({
      where: { plate: vehicleData.plate },
      update: {},
      create: {
        name: vehicleData.name,
        plate: vehicleData.plate,
        imei: vehicleData.imei,
        lat: vehicleData.lat,
        lng: vehicleData.lng,
        address: vehicleData.address,
        status: "ONLINE",
        speed: Math.random() * 80,
        userId: demoUser.id,
      },
    })

    // Criar algumas localizações históricas
    for (let i = 0; i < 10; i++) {
      await prisma.location.create({
        data: {
          vehicleId: vehicle.id,
          lat: vehicleData.lat + (Math.random() - 0.5) * 0.01,
          lng: vehicleData.lng + (Math.random() - 0.5) * 0.01,
          speed: Math.random() * 100,
          address: vehicleData.address,
          timestamp: new Date(Date.now() - i * 60 * 60 * 1000), // 1 hora atrás para cada ponto
        },
      })
    }

    console.log("✅ Veículo criado:", vehicle.name)
  }

  console.log("🎉 Seed concluído com sucesso!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Erro no seed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
