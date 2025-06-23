"use client"

import { useState, useEffect } from "react"
import { User, Lock, Bell, Palette, Shield, Save, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

interface UserSettingsModalProps {
  onClose: () => void
}

interface UserProfile {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  address?: string
}

interface UserPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  realTimeAlerts: boolean
  weeklyReports: boolean
  maintenanceReminders: boolean
  darkMode: boolean
  language: string
  timezone: string
  mapStyle: string
}

export default function UserSettingsModal({ onClose }: UserSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "preferences">("profile")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Estados do perfil
  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
  })

  // Estados de segurança
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  // Estados de preferências
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    realTimeAlerts: true,
    weeklyReports: true,
    maintenanceReminders: true,
    darkMode: true,
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    mapStyle: "osm_dark",
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (user.id) {
        const response = await fetch(`/api/user/profile?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setProfile(data.profile)
          setPreferences(data.preferences || preferences)
        } else {
          // Fallback para dados do localStorage
          setProfile({
            id: user.id,
            name: user.name || "",
            email: user.email || "",
            phone: "",
            company: "",
            address: "",
          })
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error)
    }
  }

  const handleProfileSave = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Perfil atualizado com sucesso!" })
        // Atualizar localStorage
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        localStorage.setItem("user", JSON.stringify({ ...user, ...profile }))
      } else {
        setMessage({ type: "error", text: data.error || "Erro ao atualizar perfil" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro de conexão" })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: "error", text: "As senhas não coincidem" })
      return
    }

    if (passwords.new.length < 6) {
      setMessage({ type: "error", text: "A nova senha deve ter pelo menos 6 caracteres" })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: profile.id,
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Senha alterada com sucesso!" })
        setPasswords({ current: "", new: "", confirm: "" })
      } else {
        setMessage({ type: "error", text: data.error || "Erro ao alterar senha" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro de conexão" })
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesSave = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: profile.id,
          preferences,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Preferências salvas com sucesso!" })
      } else {
        setMessage({ type: "error", text: data.error || "Erro ao salvar preferências" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro de conexão" })
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "security", label: "Segurança", icon: Lock },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "preferences", label: "Preferências", icon: Palette },
  ]

  return (
    <div className="w-full max-w-4xl mx-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-amber-500">Configurações da Conta</h2>
        <Button onClick={onClose} variant="ghost" className="text-gray-400 hover:text-white">
          ✕
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-700 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? "bg-amber-500 text-black" : "text-gray-300 hover:text-white hover:bg-gray-600"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-900/50 text-green-300 border border-green-700"
              : "bg-red-900/50 text-red-300 border border-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nome Completo</label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
              <Input
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Empresa</label>
              <Input
                value={profile.company || ""}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Nome da empresa"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Endereço</label>
            <Textarea
              value={profile.address || ""}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Endereço completo"
              rows={3}
            />
          </div>
          <Button
            onClick={handleProfileSave}
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Salvando..." : "Salvar Perfil"}
          </Button>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-amber-500" />
              Alterar Senha
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Senha Atual</label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500 pr-10"
                    placeholder="Digite sua senha atual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nova Senha</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500 pr-10"
                    placeholder="Digite a nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Nova Senha</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500 pr-10"
                    placeholder="Confirme a nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={loading || !passwords.current || !passwords.new || !passwords.confirm}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
              >
                <Lock className="w-4 h-4 mr-2" />
                {loading ? "Alterando..." : "Alterar Senha"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Notificações por Email</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-300">Alertas em Tempo Real</label>
                  <p className="text-xs text-gray-400">Receba alertas imediatos de eventos importantes</p>
                </div>
                <Switch
                  checked={preferences.realTimeAlerts}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, realTimeAlerts: checked })}
                />
              </div>
              <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-300">Relatórios Semanais</label>
                  <p className="text-xs text-gray-400">Resumo semanal das atividades dos veículos</p>
                </div>
                <Switch
                  checked={preferences.weeklyReports}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, weeklyReports: checked })}
                />
              </div>
              <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-300">Lembretes de Manutenção</label>
                  <p className="text-xs text-gray-400">Notificações sobre manutenção preventiva</p>
                </div>
                <Switch
                  checked={preferences.maintenanceReminders}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, maintenanceReminders: checked })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Outros Canais</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-300">Notificações SMS</label>
                  <p className="text-xs text-gray-400">Receba alertas críticos por SMS</p>
                </div>
                <Switch
                  checked={preferences.smsNotifications}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, smsNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-300">Notificações Push</label>
                  <p className="text-xs text-gray-400">Notificações no navegador</p>
                </div>
                <Switch
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, pushNotifications: checked })}
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handlePreferencesSave}
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Salvando..." : "Salvar Notificações"}
          </Button>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Idioma</label>
              <select
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white focus:ring-amber-500 focus:border-amber-500 text-sm rounded-md p-2"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fuso Horário</label>
              <select
                value={preferences.timezone}
                onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white focus:ring-amber-500 focus:border-amber-500 text-sm rounded-md p-2"
              >
                <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                <option value="America/Manaus">Manaus (GMT-4)</option>
                <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Estilo do Mapa Padrão</label>
              <select
                value={preferences.mapStyle}
                onChange={(e) => setPreferences({ ...preferences, mapStyle: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white focus:ring-amber-500 focus:border-amber-500 text-sm rounded-md p-2"
              >
                <option value="osm_dark">OpenStreetMap (Escuro)</option>
                <option value="osm_light">OpenStreetMap (Claro)</option>
                <option value="google_roadmap">Google Maps</option>
                <option value="google_satellite">Google Satélite</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Aparência</h3>
            <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-300">Modo Escuro</label>
                <p className="text-xs text-gray-400">Interface com tema escuro</p>
              </div>
              <Switch
                checked={preferences.darkMode}
                onCheckedChange={(checked) => setPreferences({ ...preferences, darkMode: checked })}
              />
            </div>
          </div>

          <Button
            onClick={handlePreferencesSave}
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Salvando..." : "Salvar Preferências"}
          </Button>
        </div>
      )}
    </div>
  )
}
