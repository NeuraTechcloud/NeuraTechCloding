"use client"

import type React from "react"
import { useState } from "react"
import { MapPin, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LoginPageProps {
  onLogin: (type: "guest" | "client") => void
  onBackToHome: () => void
}

export default function LoginPage({ onLogin, onBackToHome }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log("🚀 Iniciando login:", { email })

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("📡 Response status:", response.status)
      const data = await response.json()
      console.log("📋 Response data:", data)

      if (response.ok && data.success) {
        console.log("✅ Login successful, user type:", data.user.user_type)
        localStorage.setItem("user", JSON.stringify(data.user))

        // Redirecionar baseado no tipo de usuário
        if (data.user.user_type === "admin") {
          console.log("👨‍💼 Redirecting admin to /admin")
          window.location.href = "/admin"
        } else {
          console.log("👤 Calling onLogin for client")
          onLogin("client")
        }
      } else {
        console.log("❌ Login failed:", data.error)
        setError(data.error || "Credenciais inválidas")
      }
    } catch (error) {
      console.error("❌ Network error:", error)
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = () => {
    console.log("👥 Guest login")
    setError("")
    onLogin("guest")
  }

  const fillClientCredentials = () => {
    setEmail("cliente@rastreramos.com")
    setPassword("senha123")
    setError("")
  }

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-2xl shadow-xl mx-4">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto text-amber-500" />
          <h1 className="mt-4 text-3xl font-bold text-white">RastreRamos</h1>
          <p className="mt-2 text-sm text-gray-400">Faça login para acessar sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              placeholder="Digite seu email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-3 py-3 pr-10 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="Digite sua senha"
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

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm">{error}</div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-sm font-medium rounded-md text-black bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500 transition-colors disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm">OU</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <Button
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full py-3 px-4 border border-gray-500 text-sm font-medium rounded-md text-gray-200 bg-transparent hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500 transition-colors disabled:opacity-50"
        >
          Acessar como Convidado
        </Button>

        <Button
          onClick={onBackToHome}
          variant="outline"
          disabled={loading}
          className="w-full mt-4 p-2 border border-amber-500/50 text-amber-500/80 hover:text-amber-500 hover:border-amber-500 bg-transparent transition-colors disabled:opacity-50"
        >
          Voltar para a página inicial
        </Button>

        {/* Botão de teste apenas para cliente */}
        <div className="space-y-2">
          <p className="text-xs text-gray-400 text-center">Acesso de teste:</p>
          <Button
            type="button"
            onClick={fillClientCredentials}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            Preencher Dados do Cliente Teste
          </Button>
        </div>

        {/* Credenciais para referência */}
        <div className="text-xs text-gray-500 bg-gray-800 p-3 rounded">
          <p className="font-medium text-gray-400 mb-2">Credenciais disponíveis:</p>
          <div className="space-y-1">
            <p>
              <strong>Cliente Teste:</strong> cliente@rastreramos.com / senha123
            </p>
            <p>
              <strong>Administrador:</strong> Acesso restrito via banco de dados
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
