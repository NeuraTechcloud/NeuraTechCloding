"use client"

import { useEffect, useRef } from "react"

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

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    // Dynamically import Leaflet
    const initMap = async () => {
      try {
        const L = await import("leaflet")

        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        })

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
        }

        // Initialize map
        mapInstanceRef.current = L.map(mapRef.current, { zoomControl: false }).setView([-22.9, -43.2], 5)
        L.control.zoom({ position: "bottomright" }).addTo(mapInstanceRef.current)

        // Initialize layers
        layersRef.current.osm_dark = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: "&copy; OpenStreetMap &copy; CartoDB",
          subdomains: "abcd",
          maxZoom: 19,
        })

        layersRef.current.osm_light = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
        })

        layersRef.current.google_roadmap = L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
          maxZoom: 20,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
          attribution: "&copy; Google Maps",
        })

        layersRef.current.google_satellite = L.tileLayer("https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
          maxZoom: 20,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
          attribution: "&copy; Google Maps",
        })

        // Add default layer
        layersRef.current.osm_dark.addTo(mapInstanceRef.current)

        // Force map resize
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize()
          }
        }, 100)
      } catch (error) {
        console.error("Error initializing map:", error)
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update map layer
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === "undefined") return

    Object.values(layersRef.current).forEach((layer: any) => {
      if (mapInstanceRef.current && layer) {
        mapInstanceRef.current.removeLayer(layer)
      }
    })

    if (layersRef.current[mapLayer]) {
      layersRef.current[mapLayer].addTo(mapInstanceRef.current)
    }
  }, [mapLayer])

  // Update vehicle markers
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === "undefined") return

    const updateMarkers = async () => {
      try {
        const L = await import("leaflet")

        vehicles.forEach((vehicle) => {
          const color = vehicle.status === "online" ? "#f59e0b" : vehicle.status === "stopped" ? "#f97316" : "#6b7280"

          const iconHtml = `
            <div style="position: relative; width: 28px; height: 28px; transform: translate(-14px, -28px);">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" style="width: 28px; height: 28px; filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.4));">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
              <circle cx="12" cy="9" r="2.5" fill="black"></circle>
            </svg>
            </div>
          `

          const icon = L.divIcon({
            html: iconHtml,
            className: "vehicle-marker-icon",
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -28],
          })

          const popupContent = `
            <div style="font-family: Inter, sans-serif; background: #1f2937; color: white; padding: 8px; border-radius: 6px; min-width: 200px;">
              <h4 style="font-weight: bold; font-size: 16px; margin-bottom: 4px; color: #f59e0b;">${vehicle.name} - ${vehicle.plate}</h4>
              <p style="margin: 2px 0;"><strong>Status:</strong> ${vehicle.status}</p>
              <p style="margin: 2px 0;"><strong>Velocidade:</strong> ${vehicle.speed} km/h</p>
              <p style="margin: 2px 0; max-width: 250px;"><strong>Endereço:</strong> ${vehicle.address}</p>
            </div>
          `

          if (markersRef.current[vehicle.id]) {
            markersRef.current[vehicle.id].setLatLng([vehicle.lat, vehicle.lng])
            if (markersRef.current[vehicle.id].isPopupOpen()) {
              markersRef.current[vehicle.id].setPopupContent(popupContent)
            }
          } else {
            const marker = L.marker([vehicle.lat, vehicle.lng], { icon }).addTo(mapInstanceRef.current)
            marker.bindPopup(popupContent)
            marker.on("click", () => onVehicleSelect(vehicle.id))
            markersRef.current[vehicle.id] = marker
          }
        })

        // Center on selected vehicle
        if (selectedVehicle && markersRef.current[selectedVehicle]) {
          mapInstanceRef.current.setView(markersRef.current[selectedVehicle].getLatLng(), 15, { animate: true })
          markersRef.current[selectedVehicle].openPopup()
        }

        // Fit bounds if no selection and vehicles exist
        if (!selectedVehicle && vehicles.length > 0 && Object.keys(markersRef.current).length > 0) {
          const group = L.featureGroup(Object.values(markersRef.current))
          if (group.getBounds().isValid()) {
            mapInstanceRef.current.fitBounds(group.getBounds().pad(0.3))
          }
        }
      } catch (error) {
        console.error("Error updating markers:", error)
      }
    }

    updateMarkers()
  }, [vehicles, selectedVehicle, onVehicleSelect])

  return <div ref={mapRef} className="h-full w-full bg-gray-800" style={{ minHeight: "400px" }} />
}
