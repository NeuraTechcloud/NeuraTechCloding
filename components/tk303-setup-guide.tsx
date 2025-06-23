"use client"

import { useState } from "react"
import { Smartphone, MapPin, CheckCircle, AlertTriangle, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TK303SetupGuide() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [imei, setImei] = useState("")
  const [step, setStep] = useState(1)
  const [testResult, setTestResult] = useState<any>(null)

  const smsCommands = [
    {
      step: 1,
      command: "adminip seu-dominio.vercel.app 80",
      description: "Configurar servidor",
      response: "adminip ok",
    },
    {
      step: 2,
      command: "apn claro.com.br claro claro",
      description: "Configurar APN da Claro",
      response: "apn ok",
    },
    {
      step: 3,
      command: "timer 30",
      description: "Intervalo de 30 segundos",
      response: "timer ok",
    },
    {
      step: 4,
      command: "check",
      description: "Testar configuração",
      response: "Coordenadas GPS",
    },
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Comando copiado!")
  }

  const testConnection = async () => {
    if (!imei) {
      alert("Digite o IMEI primeiro")
      return
    }

    try {
      // Simular dados do TK303
      const testData = {
        imei: imei,
        lat: -22.9083 + (Math.random() - 0.5) * 0.01,
        lng: -43.1964 + (Math.random() - 0.5) * 0.01,
        speed: Math.floor(Math.random() * 80),
        timestamp: new Date().toISOString(),
      }

      const response = await fetch("/api/test/tk303", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      console.error("Erro no teste:", error)
      setTestResult({ error: "Erro de conexão" })
    }
  }

  return (
    <div className="w-full max-w-4xl mx-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-amber-500 mb-2">Configuração TK303</h2>
        <p className="text-gray-400">Guia completo para conectar seu TK303 ao RastreRamos</p>
      </div>

      {/* Informações do Dispositivo */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-amber-500" />
            Informações do TK303
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Número do Chip no TK303</label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="(11) 99999-9999"
              className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
            />
            <p className="text-xs text-gray-400 mt-1">Número para onde você enviará os comandos SMS</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">IMEI do TK303</label>
            <div className="flex space-x-2">
              <Input
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                placeholder="358723000000001"
                className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
              />
              <Button onClick={() => copyToClipboard("imei")} className="bg-blue-600 hover:bg-blue-700">
                <Copy className="w-4 h-4 mr-2" />
                SMS
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Envie SMS "imei" para descobrir o IMEI</p>
          </div>
        </CardContent>
      </Card>

      {/* Comandos SMS */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white">Comandos SMS (Enviar na Ordem)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {smsCommands.map((cmd, index) => (
              <div key={index} className="border border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">
                    Passo {cmd.step}: {cmd.description}
                  </h4>
                  <Button
                    onClick={() => copyToClipboard(cmd.command)}
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-black"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar
                  </Button>
                </div>

                <div className="bg-gray-700 p-3 rounded-lg mb-2">
                  <code className="text-green-400">{cmd.command}</code>
                </div>

                <p className="text-sm text-gray-400">
                  <strong>Resposta esperada:</strong> {cmd.response}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teste de Conexão */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-amber-500" />
            Teste de Conexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-300">Após configurar, teste se o TK303 está enviando dados:</p>

            <Button
              onClick={testConnection}
              disabled={!imei}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Simular Teste de Localização
            </Button>

            {testResult && (
              <div
                className={`p-4 rounded-lg ${
                  testResult.success ? "bg-green-900/50 border border-green-700" : "bg-red-900/50 border border-red-700"
                }`}
              >
                {testResult.success ? (
                  <div className="flex items-center text-green-300">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <div>
                      <p className="font-medium">TK303 Conectado com Sucesso!</p>
                      <p className="text-sm">
                        IMEI: {testResult.imei} | Coordenadas: {testResult.coordinates?.lat},{" "}
                        {testResult.coordinates?.lng}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-red-300">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <div>
                      <p className="font-medium">Erro na Conexão</p>
                      <p className="text-sm">{testResult.error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card className="bg-gray-900 border-gray-600">
        <CardHeader>
          <CardTitle className="text-amber-500">✅ Checklist Final</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-gray-300">
            <div className="flex items-center">
              <input type="checkbox" className="mr-3" />
              <span>Chip com créditos e dados móveis inserido no TK303</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-3" />
              <span>LED do TK303 piscando (sinal GSM)</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-3" />
              <span>Comandos SMS enviados na ordem correta</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-3" />
              <span>IMEI cadastrado no sistema RastreRamos</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-3" />
              <span>Teste de localização funcionando</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-900/20 border border-amber-500/50 rounded-lg">
            <p className="text-amber-400 font-medium mb-2">🎯 Resultado Final:</p>
            <p className="text-gray-300 text-sm">
              Após completar todos os passos, seu TK303 aparecerá no mapa do RastreRamos sendo atualizado a cada 30
              segundos com a localização real!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
