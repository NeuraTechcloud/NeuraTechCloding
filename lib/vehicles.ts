import { prisma } from "./prisma"
import { VehicleStatus } from "@prisma/client"

export interface CreateVehicleData {
  name: string
  plate: string
  imei: string
  userId: string
}

export interface UpdateVehicleLocationData {
  vehicleId: string
  lat: number
  lng: number
  speed: number
  address?: string
}

export async function getUserVehicles(userId: string) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
      include: {
        locations: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
        _count: {
          select: { locations: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return vehicles.map((vehicle) => ({
      id: vehicle.id,
      name: vehicle.name,
      plate: vehicle.plate,
      imei: vehicle.imei,
      status: vehicle.status.toLowerCase() as "online" | "stopped" | "offline",
      speed: vehicle.speed,
      lat: vehicle.lat,
      lng: vehicle.lng,
      address: vehicle.address,
      lastUpdate: vehicle.lastUpdate,
      locationCount: vehicle._count.locations,
    }))
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return []
  }
}

export async function createVehicle(data: CreateVehicleData) {
  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        name: data.name,
        plate: data.plate.toUpperCase(),
        imei: data.imei,
        userId: data.userId,
        status: VehicleStatus.OFFLINE,
      },
    })

    return vehicle
  } catch (error) {
    console.error("Error creating vehicle:", error)
    throw error
  }
}

export async function updateVehicleLocation(data: UpdateVehicleLocationData) {
  try {
    // Atualizar posição do veículo
    const vehicle = await prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: {
        lat: data.lat,
        lng: data.lng,
        speed: data.speed,
        address: data.address,
        status: VehicleStatus.ONLINE,
        lastUpdate: new Date(),
      },
    })

    // Salvar histórico de localização
    await prisma.location.create({
      data: {
        vehicleId: data.vehicleId,
        lat: data.lat,
        lng: data.lng,
        speed: data.speed,
        address: data.address,
      },
    })

    return vehicle
  } catch (error) {
    console.error("Error updating vehicle location:", error)
    throw error
  }
}

export async function getVehicleHistory(vehicleId: string, days = 7) {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const locations = await prisma.location.findMany({
      where: {
        vehicleId,
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: { timestamp: "asc" },
    })

    return locations.map((location) => ({
      lat: location.lat,
      lng: location.lng,
      speed: location.speed,
      timestamp: location.timestamp,
      address: location.address,
    }))
  } catch (error) {
    console.error("Error fetching vehicle history:", error)
    return []
  }
}
