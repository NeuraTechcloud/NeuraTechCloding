"use client"

import type React from "react"

import { useState } from "react"
import { UserPlus, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuickUserCreateProps {
  onUserCreated?: () => void
}

export default function QuickUserCreate({ onUserCreated }: QuickUserCreateProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    user_type: "client" as "client" | "admin",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Usuário criado com sucesso!" })
        setFormData({ name: "", email: "", password: "", user_type: "client" })
        onUserCreated?.()
      } else {
        setMessage({ type: "error", text: data.error || "Erro ao criar usuário" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro de conexão" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-amber-500 flex items-center">
          <UserPlus className="w-5 h-5 mr-2" />
          Criar Usuário Rapidamente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500 pr-10"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
              <select
                value={formData.user_type}
                onChange={(e) => setFormData({ ...formData, user_type: e.target.value as "client" | "admin" })}
                className="w-full bg-gray-700 border border-gray-600 text-white focus:ring-amber-500 focus:border-amber-500 text-sm rounded-md p-2"
              >
                <option value="client">Cliente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-900/50 text-green-300 border border-green-700"
                  : "bg-red-900/50 text-red-300 border border-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {loading ? "Criando..." : "Criar Usuário"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
