"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  Car,
  Settings,
  Database,
  Shield,
  Activity,
  FileText,
  Download,
  Upload,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import QuickUserCreate from "@/components/quick-user-create"

interface AdminStats {
  totalUsers: number
  totalVehicles: number
  activeVehicles: number
  offlineVehicles: number
  newUsersThisMonth: number
  systemUptime: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    offlineVehicles: 0,
    newUsersThisMonth: 0,
    systemUptime: "0 dias",
  })
  const router = useRouter()

  useEffect(() => {
    // Verificar se é admin
    const userData = JSON.parse(localStorage.getItem("user") || "{}")
    if (userData.user_type === "admin" || userData.email === "admin@rastreramos.com") {
      setIsAuthenticated(true)
      setUser(userData)
      loadStats()
    } else {
      router.push("/")
    }
    setLoading(false)
  }, [router])

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

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleSystemAction = async (action: string) => {
    try {
      const response = await fetch(`/api/admin/system/${action}`, {
        method: "POST",
      })
      const data = await response.json()

      if (response.ok) {
        alert(`${action} executado com sucesso!`)
        loadStats()
      } else {
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      alert("Erro de conexão")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando painel administrativo...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400">Acesso negado - Apenas administradores</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-amber-500">Painel Administrativo</h1>
            <p className="text-gray-400">Controle total do sistema RastreRamos</p>
            <p className="text-sm text-gray-500">
              Logado como: {user?.name} ({user?.email})
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={loadStats} variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-800">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-400 flex items-center text-sm">
                <Users className="w-4 h-4 mr-2" />
                Total de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <p className="text-xs text-gray-400">+{stats.newUsersThisMonth} este mês</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-400 flex items-center text-sm">
                <Car className="w-4 h-4 mr-2" />
                Total de Veículos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalVehicles}</div>
              <p className="text-xs text-gray-400">{stats.activeVehicles} online</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-400 flex items-center text-sm">
                <Activity className="w-4 h-4 mr-2" />
                Veículos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeVehicles}</div>
              <p className="text-xs text-gray-400">{stats.offlineVehicles} offline</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-400 flex items-center text-sm">
                <Database className="w-4 h-4 mr-2" />
                Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-white">Online</div>
              <p className="text-xs text-gray-400">Uptime: {stats.systemUptime}</p>
            </CardContent>
          </Card>
        </div>

        {/* Menu Principal de Gestão */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card
            className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
            onClick={() => router.push("/admin/users")}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-6 h-6 mr-3 text-blue-500" />
                Gerenciar Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">Criar, editar e deletar usuários do sistema</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Total: {stats.totalUsers}</span>
                <span>Novos: +{stats.newUsersThisMonth}</span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
            onClick={() => router.push("/admin/vehicles")}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Car className="w-6 h-6 mr-3 text-green-500" />
                Gerenciar Veículos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">Visualizar e gerenciar todos os veículos</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Total: {stats.totalVehicles}</span>
                <span>Online: {stats.activeVehicles}</span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
            onClick={() => router.push("/admin/reports")}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-6 h-6 mr-3 text-purple-500" />
                Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">Relatórios detalhados e análises</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Disponíveis</span>
                <span>Exportar</span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
            onClick={() => router.push("/admin/database")}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Database className="w-6 h-6 mr-3 text-cyan-500" />
                Banco de Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">Gerenciar banco de dados e backups</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Neon DB</span>
                <span>Conectado</span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
            onClick={() => router.push("/admin/security")}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-6 h-6 mr-3 text-red-500" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">Logs de acesso e configurações de segurança</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Monitorando</span>
                <span>Seguro</span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
            onClick={() => router.push("/admin/settings")}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-6 h-6 mr-3 text-amber-500" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">Configurações gerais do sistema</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Sistema</span>
                <span>Configurar</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas do Sistema */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-amber-500">Ações Rápidas do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleSystemAction("backup")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Backup
                </Button>
                <Button
                  onClick={() => handleSystemAction("cleanup")}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpeza
                </Button>
                <Button
                  onClick={() => handleSystemAction("optimize")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Otimizar
                </Button>
                <Button
                  onClick={() => handleSystemAction("export")}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Criação Rápida de Usuário */}
          <QuickUserCreate onUserCreated={loadStats} />
        </div>

        {/* Informações do Sistema */}
        <Card className="bg-gray-900 border-gray-600">
          <CardHeader>
            <CardTitle className="text-amber-500">Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Banco de Dados</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400">Provedor:</span> <span className="text-white">Neon Database</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Host:</span>{" "}
                    <span className="text-white font-mono text-xs">
                      ep-green-night-ac5n97n0-pooler.sa-east-1.aws.neon.tech
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-400">Database:</span> <span className="text-white">neondb</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Status:</span> <span className="text-green-400">Conectado</span>
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Aplicação</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400">Versão:</span> <span className="text-white">1.0.0</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Framework:</span> <span className="text-white">Next.js 14</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Deploy:</span> <span className="text-white">Vercel</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Ambiente:</span> <span className="text-green-400">Produção</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
