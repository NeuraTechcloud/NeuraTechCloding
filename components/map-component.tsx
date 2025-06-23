"use client"

import { useEffect, useRef, useState } from "react"

interface Vehicle {
  id: number
  name: string
  plate: string
  status: "online" | "stopped" | "offline"
  speed: number
  lat: number
  lng: number
  address: string
  lastUpdate: string
}

interface MapComponentProps {
  vehicles: Vehicle[]
  selectedVehicle: number | null
  mapLayer: string
  onVehicleSelect: (vehicleId: number) => void
}

export default function MapComponent({ vehicles, selectedVehicle, mapLayer, onVehicleSelect }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Record<number, any>>({})
  const layersRef = useRef<Record<string, any>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const timer = setTimeout(async () => {
      try {
        if (!mapRef.current) return

        const L = await import("leaflet")

        // Fix default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        })

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
        }

        mapInstanceRef.current = L.map(mapRef.current).setView([-14.235004, -51.92528], 4)

        // Add layers
        layersRef.current.osm_dark = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: "&copy; OpenStreetMap &copy; CartoDB",
        })

        layersRef.current.osm_light = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
        })

        layersRef.current.google_roadmap = L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
          attribution: "&copy; Google",
        })

        layersRef.current.google_satellite = L.tileLayer("https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
          attribution: "&copy; Google",
        })

        layersRef.current.osm_dark.addTo(mapInstanceRef.current)

        L.control.zoom({ position: "bottomright" }).addTo(mapInstanceRef.current)

        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize()
          }
        }, 100)

        setIsLoaded(true)
      } catch (error) {
        console.error("Map error:", error)
      }
    }, 1000)

    return () => {
      clearTimeout(timer)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update layer
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return

    Object.values(layersRef.current).forEach((layer: any) => {
      mapInstanceRef.current.removeLayer(layer)
    })

    if (layersRef.current[mapLayer]) {
      layersRef.current[mapLayer].addTo(mapInstanceRef.current)
    }
  }, [mapLayer, isLoaded])

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return

    const updateMarkers = async () => {
      const L = await import("leaflet")

      Object.values(markersRef.current).forEach((marker: any) => {
        mapInstanceRef.current.removeLayer(marker)
      })
      markersRef.current = {}

      vehicles.forEach((vehicle) => {
        const color = vehicle.status === "online" ? "#f59e0b" : vehicle.status === "stopped" ? "#f97316" : "#6b7280"

        const iconHtml = `
          <div style="width: 20px; height: 20px; background: ${color}; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
        `

        const icon = L.divIcon({
          html: iconHtml,
          className: "custom-marker",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })

        const marker = L.marker([vehicle.lat, vehicle.lng], { icon }).addTo(mapInstanceRef.current)

        marker.bindPopup(`
          <div style="color: black;">
            <strong>${vehicle.name}</strong><br>
            Placa: ${vehicle.plate}<br>
            Status: ${vehicle.status}<br>
            Velocidade: ${vehicle.speed} km/h<br>
            ${vehicle.address}
          </div>
        `)

        marker.on("click", () => onVehicleSelect(vehicle.id))
        markersRef.current[vehicle.id] = marker
      })

      if (selectedVehicle && markersRef.current[selectedVehicle]) {
        mapInstanceRef.current.setView(markersRef.current[selectedVehicle].getLatLng(), 15)
        markersRef.current[selectedVehicle].openPopup()
      }
    }

    updateMarkers()
  }, [vehicles, selectedVehicle, onVehicleSelect, isLoaded])

  return (
    <div className="h-full w-full relative">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
            <div>Carregando mapa...</div>
          </div>
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" style={{ minHeight: "400px" }} />
    </div>
  )
}
