"use client"

import type React from "react"
import { useState } from "react"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LoginPageProps {
  onLogin: (type: "guest" | "client") => void
  onBackToHome: () => void
}

export default function LoginPage({ onLogin, onBackToHome }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("cliente@rastreramos.com")
  const [password, setPassword] = useState("senha123")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"
      const body = isLogin ? { email, password } : { email, password, name }

      console.log("Sending request to:", endpoint)
      console.log("Request body:", body)

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)

      let data
      try {
        const text = await response.text()
        console.log("Raw response:", text)
        data = JSON.parse(text)
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        throw new Error("Resposta inválida do servidor")
      }

      console.log("Parsed data:", data)

      if (response.ok && data.success) {
        if (isLogin) {
          localStorage.setItem("user", JSON.stringify(data.user))
          onLogin(data.user.user_type as "guest" | "client")
        } else {
          setSuccess("Conta criada com sucesso! Faça login para continuar.")
          setIsLogin(true)
          setPassword("")
        }
      } else {
        setError(data.error || "Erro ao processar solicitação")
      }
    } catch (error) {
      console.error("Auth error:", error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Erro de conexão. Tente novamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = () => {
    setError("")
    onLogin("guest")
  }

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-2xl shadow-xl mx-4">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto text-amber-500" />
          <h1 className="mt-4 text-3xl font-bold text-white">RastreRamos Premium</h1>
          <p className="mt-2 text-sm text-gray-400">
            {isLogin ? "Faça login para acessar sua conta." : "Crie sua conta gratuita."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {!isLogin && (
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                disabled={loading}
                className="w-full px-3 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="Nome completo"
              />
            )}
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              placeholder="Email"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              placeholder="Senha"
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-500 text-sm text-center">{success}</div>}

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Processando..." : isLogin ? "Entrar" : "Criar Conta"}
            </Button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError("")
              setSuccess("")
            }}
            disabled={loading}
            className="text-amber-500 hover:text-amber-400 text-sm transition-colors disabled:opacity-50"
          >
            {isLogin ? "Não tem conta? Criar uma nova" : "Já tem conta? Fazer login"}
          </button>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm">OU</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <div>
          <Button
            onClick={handleGuestLogin}
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-500 text-sm font-medium rounded-md text-gray-200 bg-transparent hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500 transition-colors disabled:opacity-50"
          >
            Acessar como Convidado
          </Button>
        </div>

        <Button
          onClick={onBackToHome}
          variant="outline"
          disabled={loading}
          className="text-center text-sm w-full mt-4 p-2 border border-amber-500/50 text-amber-500/80 hover:text-amber-500 hover:border-amber-500 bg-transparent transition-colors disabled:opacity-50"
        >
          Voltar para a página inicial
        </Button>

        {/* Debug Info */}
        <div className="text-xs text-gray-500 text-center mt-4">
          <p>Credenciais de teste:</p>
          <p>Email: cliente@rastreramos.com</p>
          <p>Senha: senha123</p>
        </div>
      </div>
    </div>
  )
}
