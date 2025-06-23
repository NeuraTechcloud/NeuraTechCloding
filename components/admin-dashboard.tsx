"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Users, Car, Trash2, Edit, Plus, Search, Download, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Modal from "@/components/modal"

interface User {
  id: number
  name: string
  email: string
  user_type: string
  created_at: string
  vehicle_count?: number
}

interface Vehicle {
  id: number
  user_id: number
  name: string
  plate: string
  imei: string
  status: string
  created_at: string
  user_name?: string
}

interface AdminDashboardProps {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"users" | "vehicles" | "stats">("users")
  const [users, setUsers] = useState<User[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    newUsersThisMonth: 0,
  })

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === "users") {
        await loadUsers()
      } else if (activeTab === "vehicles") {
        await loadVehicles()
      } else if (activeTab === "stats") {
        await loadStats()
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()
      if (response.ok) {
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
    }
  }

  const loadVehicles = async () => {
    try {
      const response = await fetch("/api/admin/vehicles")
      const data = await response.json()
      if (response.ok) {
        setVehicles(data.vehicles || [])
      }
    } catch (error) {
      console.error("Erro ao carregar veículos:", error)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const data = await response.json()
      if (response.ok) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userId))
        setModalContent(
          <div className="text-center">
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <h3 className="text-xl font-bold text-white mb-2">Usuário Deletado</h3>
            <p className="text-gray-300 mb-6">O usuário foi removido com sucesso.</p>
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
      console.error("Erro ao deletar usuário:", error)
    }
  }

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (!confirm("Tem certeza que deseja deletar este veículo?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setVehicles(vehicles.filter((vehicle) => vehicle.id !== vehicleId))
      }
    } catch (error) {
      console.error("Erro ao deletar veículo:", error)
    }
  }

  const exportData = async (type: "users" | "vehicles") => {
    try {
      const response = await fetch(`/api/admin/export/${type}`)
      const data = await response.json()

      if (response.ok) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${type}_${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Erro ao exportar dados:", error)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.user_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-500">Painel Administrativo</h1>
            <p className="text-gray-400">RastreRamos - Gestão Completa</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => exportData(activeTab as "users" | "vehicles")}
              variant="outline"
              className="text-gray-300 border-gray-600 hover:bg-gray-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={onLogout} className="bg-red-600 hover:bg-red-700">
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 min-h-screen p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "users" ? "bg-amber-500 text-black" : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Usuários</span>
            </button>
            <button
              onClick={() => setActiveTab("vehicles")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "vehicles" ? "bg-amber-500 text-black" : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <Car className="w-5 h-5" />
              <span>Veículos</span>
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "stats" ? "bg-amber-500 text-black" : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Estatísticas</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Search Bar */}
          {(activeTab === "users" || activeTab === "vehicles") && (
            <div className="mb-6 flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Buscar ${activeTab === "users" ? "usuários" : "veículos"}...`}
                  className="pl-10 bg-gray-800 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <Button onClick={loadData} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-black">
                {loading ? "Carregando..." : "Atualizar"}
              </Button>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Usuários Cadastrados ({filteredUsers.length})</h2>
              </div>

              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Veículos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Cadastro
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">#{user.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.user_type === "admin" ? "bg-red-900 text-red-300" : "bg-green-900 text-green-300"
                              }`}
                            >
                              {user.user_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {user.vehicle_count || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {new Date(user.created_at).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-400 border-blue-400 hover:bg-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-400 border-red-400 hover:bg-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Vehicles Tab */}
          {activeTab === "vehicles" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Veículos Cadastrados ({filteredVehicles.length})</h2>
              </div>

              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Placa
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          IMEI
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Proprietário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredVehicles.map((vehicle) => (
                        <tr key={vehicle.id} className="hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">#{vehicle.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{vehicle.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{vehicle.plate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                            {vehicle.imei}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {vehicle.user_name || `User #${vehicle.user_id}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                vehicle.status === "online"
                                  ? "bg-green-900 text-green-300"
                                  : vehicle.status === "stopped"
                                    ? "bg-yellow-900 text-yellow-300"
                                    : "bg-gray-700 text-gray-300"
                              }`}
                            >
                              {vehicle.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-400 border-blue-400 hover:bg-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                              className="text-red-400 border-red-400 hover:bg-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && (
            <div>
              <h2 className="text-xl font-bold mb-6">Estatísticas do Sistema</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-900 p-6 rounded-lg">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Total de Usuários</p>
                      <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg">
                  <div className="flex items-center">
                    <Car className="w-8 h-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Total de Veículos</p>
                      <p className="text-2xl font-bold text-white">{stats.totalVehicles}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="w-8 h-8 text-amber-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Veículos Ativos</p>
                      <p className="text-2xl font-bold text-white">{stats.activeVehicles}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg">
                  <div className="flex items-center">
                    <Plus className="w-8 h-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Novos Usuários (Mês)</p>
                      <p className="text-2xl font-bold text-white">{stats.newUsersThisMonth}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-4">Informações do Banco de Dados</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400">Provedor:</span> <span className="text-white">Neon Database</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Host:</span>{" "}
                    <span className="text-white font-mono">ep-green-night-ac5n97n0-pooler.sa-east-1.aws.neon.tech</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Database:</span> <span className="text-white">neondb</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Console:</span>{" "}
                    <a
                      href="https://console.neon.tech"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-500 hover:text-amber-400"
                    >
                      console.neon.tech
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {modalContent && (
        <div className="modal-overlay">
          <Modal onClose={() => setModalContent(null)}>{modalContent}</Modal>
        </div>
      )}
    </div>
  )
}
