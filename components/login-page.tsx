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
  const [email, setEmail] = useState("cliente@rastreramos.com")
  const [password, setPassword] = useState("senha123")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Salvar dados do usuário no localStorage ou context
        localStorage.setItem("user", JSON.stringify(data.user))
        onLogin(data.user.userType as "guest" | "client")
      } else {
        setError(data.error || "Erro ao fazer login")
      }
    } catch (error) {
      setError("Erro de conexão. Tente novamente.")
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
          <p className="mt-2 text-sm text-gray-400">Faça login para acessar sua conta.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 rounded-t-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
              placeholder="Email"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 rounded-b-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
              placeholder="Senha"
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500 transition-colors"
            >
              Entrar
            </Button>
          </div>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm">OU</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <div>
          <Button
            onClick={handleGuestLogin}
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-500 text-sm font-medium rounded-md text-gray-200 bg-transparent hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500 transition-colors"
          >
            Acessar como Convidado
          </Button>
        </div>

        <Button
          onClick={onBackToHome}
          variant="outline"
          className="text-center text-sm w-full mt-4 p-2 border border-amber-500/50 text-amber-500/80 hover:text-amber-500 hover:border-amber-500 bg-transparent transition-colors"
        >
          Voltar para a página inicial
        </Button>
      </div>
    </div>
  )
}
