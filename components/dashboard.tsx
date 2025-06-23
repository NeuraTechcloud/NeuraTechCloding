"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Menu, Settings, LogOut, Plus, Clock, FileText, Bell, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import MapComponent from "@/components/map-component"
import Modal from "@/components/modal"
import UserSettingsModal from "@/components/user-settings-modal"

interface Vehicle {
  id: number
  name: string
  plate: string
  imei: string
  status: "online" | "stopped" | "offline"
  speed: number
  lat: number
  lng: number
  address: string
  lastUpdate: string
}

interface DashboardProps {
  userType: "guest" | "client"
  onLogout: () => void
}

const guestVehicles: Vehicle[] = [
  {
    id: 1,
    name: "SUV de Demonstração",
    plate: "GUEST01",
    imei: "358723000000001",
    status: "online",
    speed: 62,
    lat: -22.9083,
    lng: -43.1964,
    address: "Av. Pres. Vargas, Rio de Janeiro - RJ",
    lastUpdate: "Agora",
  },
  {
    id: 2,
    name: "Caminhão de Carga",
    plate: "GUEST02",
    imei: "358723000000002",
    status: "stopped",
    speed: 0,
    lat: -23.5505,
    lng: -46.6333,
    address: "Av. Paulista, São Paulo - SP",
    lastUpdate: "Há 5 min",
  },
  {
    id: 3,
    name: "Carro Executivo",
    plate: "GUEST03",
    imei: "358723000000003",
    status: "offline",
    speed: 0,
    lat: -15.7942,
    lng: -47.8825,
    address: "Eixo Monumental, Brasília - DF",
    lastUpdate: "Há 2 horas",
  },
]

export default function Dashboard({ userType, onLogout }: DashboardProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [realtimeTracking, setRealtimeTracking] = useState(false)
  const [mapLayer, setMapLayer] = useState("osm_dark")
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null)
  const simulationInterval = useRef<NodeJS.Timeout | null>(null)
  const [showUserSettings, setShowUserSettings] = useState(false)

  useEffect(() => {
    const loadVehicles = async () => {
      if (userType === "guest") {
        setVehicles([...guestVehicles])
        return
      }

      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        if (!user.id) {
          setVehicles([...guestVehicles])
          return
        }

        const response = await fetch(`/api/vehicles?userId=${user.id}`)
        const data = await response.json()

        if (response.ok && data.vehicles) {
          setVehicles(data.vehicles)
        } else {
          setVehicles([...guestVehicles])
        }
      } catch (error) {
        console.error("Erro ao carregar veículos:", error)
        setVehicles([...guestVehicles])
      }
    }

    loadVehicles()
  }, [userType])

  useEffect(() => {
    if (realtimeTracking) {
      simulationInterval.current = setInterval(() => {
        setVehicles((prev) =>
          prev.map((vehicle) => {
            if (vehicle.status === "online") {
              return {
                ...vehicle,
                lat: vehicle.lat + (Math.random() - 0.5) * 0.001,
                lng: vehicle.lng + (Math.random() - 0.5) * 0.001,
                speed: Math.max(0, Math.min(120, vehicle.speed + Math.floor(Math.random() * 21) - 10)),
                lastUpdate: "Agora",
              }
            }
            return vehicle
          }),
        )
      }, 3000)
    } else {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current)
        simulationInterval.current = null
      }
    }

    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current)
      }
    }
  }, [realtimeTracking])

  const handleVehicleClick = (vehicleId: number) => {
    setSelectedVehicle(vehicleId)
    if (window.innerWidth < 1024) {
      setPanelOpen(false)
    }
  }

  const handleAddVehicle = () => {
    if (userType === "guest") return

    const addVehicleForm = (
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          const user = JSON.parse(localStorage.getItem("user") || "{}")

          try {
            const response = await fetch("/api/vehicles", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: formData.get("name"),
                plate: formData.get("plate"),
                imei: formData.get("imei"),
                userId: user.id,
              }),
            })

            if (response.ok) {
              const data = await response.json()
              setVehicles((prev) => [...prev, data.vehicle])
              setModalContent(
                <div className="text-center">
                  <div className="text-green-500 text-4xl mb-4">✓</div>
                  <h3 className="text-xl font-bold text-white mb-2">Sucesso!</h3>
                  <p className="text-gray-300 mb-6">Veículo cadastrado com sucesso!</p>
                  <Button
                    onClick={() => setModalContent(null)}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
                  >
                    OK
                  </Button>
                </div>,
              )
            }
          } catch (error) {
            console.error("Erro:", error)
          }
        }}
      >
        <h3 className="text-xl font-bold text-amber-500 mb-4">Cadastrar Novo GPS</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Veículo</label>
            <Input
              name="name"
              required
              className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Placa</label>
            <Input
              name="plate"
              required
              className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">IMEI do Dispositivo</label>
            <Input
              name="imei"
              required
              className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <Button
            type="button"
            onClick={() => setModalContent(null)}
            variant="ghost"
            className="text-gray-300 hover:text-white"
          >
            Cancelar
          </Button>
          <Button type="submit" className="bg-amber-500 text-black font-bold hover:bg-amber-600">
            Salvar Veículo
          </Button>
        </div>
      </form>
    )

    setModalContent(addVehicleForm)
  }

  const handleToolClick = (tool: string) => {
    const toolNames = {
      history: "Histórico",
      reports: "Relatórios",
      alerts: "Alertas",
      fences: "Cercas",
    }

    setModalContent(
      <div>
        <h3 className="text-xl font-bold text-amber-500 mb-2">{toolNames[tool as keyof typeof toolNames]}</h3>
        <p className="text-gray-300 mb-6">Esta funcionalidade estará disponível em breve.</p>
        <Button onClick={() => setModalContent(null)} className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
          Entendi
        </Button>
      </div>,
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-amber-500"
      case "stopped":
        return "text-orange-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="h-screen w-screen bg-black flex">
      {/* Sidebar */}
      <aside
        className={`absolute lg:static w-full max-w-xs xl:max-w-sm h-full bg-gray-900 border-r border-gray-800 shadow-lg flex flex-col transform ${panelOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out`}
        style={{ zIndex: 500 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white">
              Bem-vindo, {userType === "guest" ? "Convidado" : "Cliente"}!
            </h2>
            <p className="text-xs text-gray-400">Monitoramento em tempo real</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowUserSettings(true)}
              className="p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onLogout}
              className="p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Meus Veículos</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAddVehicle}
              disabled={userType === "guest"}
              className={`text-amber-500 hover:text-amber-400 ${userType === "guest" ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>

          <ul className="space-y-1 px-2 pb-4">
            {vehicles.map((vehicle) => (
              <li
                key={vehicle.id}
                onClick={() => handleVehicleClick(vehicle.id)}
                className={`cursor-pointer p-3 rounded-lg hover:bg-gray-800 transition-colors ${selectedVehicle === vehicle.id ? "bg-amber-900/40" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white">{vehicle.name}</span>
                  <span className="text-xs font-mono px-2 py-0.5 bg-gray-700 text-gray-300 rounded">
                    {vehicle.plate}
                  </span>
                </div>
                <div className={`flex items-center text-xs mt-1.5 ${getStatusColor(vehicle.status)}`}>
                  <span>
                    {vehicle.status === "online"
                      ? `${vehicle.speed} km/h`
                      : vehicle.status === "stopped"
                        ? "Parado"
                        : "Offline"}{" "}
                    - {vehicle.lastUpdate}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 truncate">{vehicle.address}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 border-t border-gray-800 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Ferramentas</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleToolClick("history")}
                variant="outline"
                className="flex items-center justify-center p-3 text-sm text-gray-300 bg-gray-800 hover:bg-amber-700 hover:text-white"
              >
                <Clock className="h-5 w-5 mr-2" />
                Histórico
              </Button>
              <Button
                onClick={() => handleToolClick("reports")}
                variant="outline"
                className="flex items-center justify-center p-3 text-sm text-gray-300 bg-gray-800 hover:bg-amber-700 hover:text-white"
              >
                <FileText className="h-5 w-5 mr-2" />
                Relatórios
              </Button>
              <Button
                onClick={() => handleToolClick("alerts")}
                variant="outline"
                className="flex items-center justify-center p-3 text-sm text-gray-300 bg-gray-800 hover:bg-amber-700 hover:text-white"
              >
                <Bell className="h-5 w-5 mr-2" />
                Alertas
              </Button>
              <Button
                onClick={() => handleToolClick("fences")}
                variant="outline"
                className="flex items-center justify-center p-3 text-sm text-gray-300 bg-gray-800 hover:bg-amber-700 hover:text-white"
              >
                <Shield className="h-5 w-5 mr-2" />
                Cercas
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Opções</h3>
            <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
              <label className="text-sm text-gray-300">Rastreio em Tempo Real</label>
              <Switch checked={realtimeTracking} onCheckedChange={setRealtimeTracking} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative">
        <MapComponent
          vehicles={vehicles}
          selectedVehicle={selectedVehicle}
          mapLayer={mapLayer}
          onVehicleSelect={setSelectedVehicle}
        />

        {/* Mobile Menu Button */}
        <Button
          onClick={() => setPanelOpen(!panelOpen)}
          className="lg:hidden absolute top-4 left-4 p-2 bg-gray-900/70 text-white backdrop-blur-sm"
          style={{ zIndex: 600 }}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 map-controls">
          <select
            value={mapLayer}
            onChange={(e) => setMapLayer(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white focus:ring-amber-500 focus:border-amber-500 text-sm rounded-md p-2 min-w-[200px]"
          >
            <option value="osm_dark">OpenStreetMap (Escuro)</option>
            <option value="osm_light">OpenStreetMap (Claro)</option>
            <option value="google_roadmap">Google Maps</option>
            <option value="google_satellite">Google Satélite</option>
          </select>
        </div>
      </main>

      {/* Mobile Overlay */}
      {panelOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setPanelOpen(false)}
          style={{ zIndex: 400 }}
        />
      )}

      {/* User Settings Modal */}
      {showUserSettings && (
        <div className="modal-overlay">
          <Modal onClose={() => setShowUserSettings(false)}>
            <UserSettingsModal onClose={() => setShowUserSettings(false)} />
          </Modal>
        </div>
      )}

      {/* Modal */}
      {modalContent && (
        <div className="modal-overlay">
          <Modal onClose={() => setModalContent(null)}>{modalContent}</Modal>
        </div>
      )}
    </div>
  )
}
