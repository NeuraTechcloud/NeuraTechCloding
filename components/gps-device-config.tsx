"use client"

import { useState } from "react"
import { Settings, Smartphone, Wifi, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GPSDeviceConfigProps {
  vehicleId: number
  imei: string
  onClose: () => void
}

export default function GPSDeviceConfig({ vehicleId, imei, onClose }: GPSDeviceConfigProps) {
  const [config, setConfig] = useState({
    serverUrl: "https://seu-dominio.vercel.app/api/gps/receive",
    serverPort: "80",
    updateInterval: "30",
    apn: "claro.com.br",
    apnUser: "claro",
    apnPass: "claro",
  })

  const [loading, setLoading] = useState(false)

  const sendCommand = async (command: string, parameters?: any) => {
    setLoading(true)
    try {
      const response = await fetch("/api/gps/command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleId,
          command,
          parameters,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Comando ${command} enviado com sucesso!`)
      } else {
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      alert("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-amber-500">Configuração do Dispositivo GPS</h2>
        <Button onClick={onClose} variant="ghost" className="text-gray-400 hover:text-white">
          ✕
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações do Servidor */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Wifi className="w-5 h-5 mr-2 text-amber-500" />
              Configurações do Servidor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">URL do Servidor</label>
              <Input
                value={config.serverUrl}
                onChange={(e) => setConfig({ ...config, serverUrl: e.target.value })}
                className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                placeholder="https://seu-dominio.vercel.app/api/gps/receive"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Porta</label>
              <Input
                value={config.serverPort}
                onChange={(e) => setConfig({ ...config, serverPort: e.target.value })}
                className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                placeholder="80"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Intervalo de Atualização (segundos)
              </label>
              <Input
                value={config.updateInterval}
                onChange={(e) => setConfig({ ...config, updateInterval: e.target.value })}
                className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                placeholder="30"
              />
            </div>
            <Button
              onClick={() => sendCommand("configure_server", config)}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold"
            >
              <Settings className="w-4 h-4 mr-2" />
              {loading ? "Enviando..." : "Configurar Servidor"}
            </Button>
          </CardContent>
        </Card>

        {/* Configurações APN */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Smartphone className="w-5 h-5 mr-2 text-amber-500" />
              Configurações APN
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">APN</label>
              <Input
                value={config.apn}
                onChange={(e) => setConfig({ ...config, apn: e.target.value })}
                className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                placeholder="claro.com.br"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Usuário APN</label>
              <Input
                value={config.apnUser}
                onChange={(e) => setConfig({ ...config, apnUser: e.target.value })}
                className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                placeholder="claro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Senha APN</label>
              <Input
                value={config.apnPass}
                onChange={(e) => setConfig({ ...config, apnPass: e.target.value })}
                className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                placeholder="claro"
              />
            </div>
            <Button
              onClick={() =>
                sendCommand("configure_apn", {
                  apn: config.apn,
                  user: config.apnUser,
                  pass: config.apnPass,
                })
              }
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              {loading ? "Enviando..." : "Configurar APN"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Comandos Rápidos */}
      <Card className="bg-gray-800 border-gray-700 mt-6">
        <CardHeader>
          <CardTitle className="text-white">Comandos Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => sendCommand("locate")}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Localizar
            </Button>
            <Button
              onClick={() => sendCommand("reboot")}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Reiniciar
            </Button>
            <Button
              onClick={() => sendCommand("lock")}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Bloquear
            </Button>
            <Button
              onClick={() => sendCommand("unlock")}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Desbloquear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card className="bg-gray-800 border-gray-700 mt-6">
        <CardHeader>
          <CardTitle className="text-white">📋 Instruções de Configuração</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-2">
          <p>
            <strong>IMEI do Dispositivo:</strong> <code className="bg-gray-700 px-2 py-1 rounded">{imei}</code>
          </p>
          <p>
            <strong>1.</strong> Configure o APN da sua operadora
          </p>
          <p>
            <strong>2.</strong> Configure a URL do servidor para receber os dados
          </p>
          <p>
            <strong>3.</strong> Defina o intervalo de atualização (recomendado: 30 segundos)
          </p>
          <p>
            <strong>4.</strong> Use os comandos rápidos para testar a comunicação
          </p>
          <p className="text-amber-400">
            <strong>⚠️ Importante:</strong> Certifique-se de que o dispositivo tenha sinal GSM/3G/4G
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
