"use client"

import { useState } from "react"
import { Smartphone, Settings, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const gpsModels = [
  {
    brand: "GT06/GT02",
    models: ["GT06N", "GT02A", "GT06E", "GT06F"],
    compatibility: "full",
    protocol: "HTTP/TCP",
    smsCommands: ["SERVER,1,seu-dominio.vercel.app,80,0#", "APN,claro.com.br,claro,claro#", "TIMER,30#", "WHERE#"],
    notes: "Mais popular no Brasil, fácil configuração",
  },
  {
    brand: "TK Series (Coban)",
    models: ["TK103", "TK303", "TK403", "TK104"],
    compatibility: "full",
    protocol: "HTTP/TCP",
    smsCommands: ["adminip seu-dominio.vercel.app 80", "apn claro.com.br claro claro", "timer 30", "check"],
    notes: "Muito confiável, boa cobertura",
  },
  {
    brand: "ST Series",
    models: ["ST-901", "ST-940", "ST-915", "ST-906"],
    compatibility: "full",
    protocol: "HTTP",
    smsCommands: ["url,seu-dominio.vercel.app,80#", "apn,claro.com.br,claro,claro#", "upload,30#"],
    notes: "Interface amigável, app próprio",
  },
  {
    brand: "Concox",
    models: ["AT4", "JM-VL03", "GT06N", "HVT001"],
    compatibility: "full",
    protocol: "HTTP/TCP",
    smsCommands: ["SERVER,1,seu-dominio.vercel.app,80#", "APN,claro.com.br,claro,claro#", "FIX,30S#"],
    notes: "Boa qualidade, preço acessível",
  },
  {
    brand: "Positron",
    models: ["PX 360", "Duoblock", "Cyber EX"],
    compatibility: "partial",
    protocol: "Proprietário/HTTP",
    smsCommands: ["Configuração via central", "Alguns modelos suportam HTTP"],
    notes: "Marca brasileira, pode precisar adaptação",
  },
  {
    brand: "Queclink",
    models: ["GV300", "GV500", "GL300"],
    compatibility: "full",
    protocol: "HTTP",
    smsCommands: [
      "AT+GTCFG=300101,1,seu-dominio.vercel.app,80,,,,,,FFFF$",
      "AT+GTAPN=300101,claro.com.br,claro,claro,,,,FFFF$",
    ],
    notes: "Profissional, muitas funcionalidades",
  },
]

const operadoras = [
  {
    name: "Claro",
    apn: "claro.com.br",
    user: "claro",
    pass: "claro",
  },
  {
    name: "Vivo",
    apn: "zap.vivo.com.br",
    user: "vivo",
    pass: "vivo",
  },
  {
    name: "Tim",
    apn: "timbrasil.br",
    user: "tim",
    pass: "tim",
  },
  {
    name: "Oi",
    apn: "gprs.oi.com.br",
    user: "oi",
    pass: "oi",
  },
]

export default function GPSCompatibilityGuide() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedOperadora, setSelectedOperadora] = useState("Claro")

  const getCompatibilityIcon = (compatibility: string) => {
    switch (compatibility) {
      case "full":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "partial":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getCompatibilityText = (compatibility: string) => {
    switch (compatibility) {
      case "full":
        return "Totalmente Compatível"
      case "partial":
        return "Parcialmente Compatível"
      default:
        return "Não Compatível"
    }
  }

  const generateCommands = (model: any, operadora: any) => {
    return model.smsCommands.map((cmd: string) =>
      cmd.replace("claro.com.br", operadora.apn).replace("claro,claro", `${operadora.user},${operadora.pass}`),
    )
  }

  return (
    <div className="w-full max-w-6xl mx-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-amber-500 mb-2">GPS Compatíveis</h2>
        <p className="text-gray-400">Dispositivos que funcionam com o sistema RastreRamos</p>
      </div>

      {/* Lista de GPS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {gpsModels.map((gps, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>{gps.brand}</span>
                <div className="flex items-center space-x-2">
                  {getCompatibilityIcon(gps.compatibility)}
                  <span className="text-sm text-gray-400">{getCompatibilityText(gps.compatibility)}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Modelos:</p>
                  <p className="text-white">{gps.models.join(", ")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Protocolo:</p>
                  <p className="text-white">{gps.protocol}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Observações:</p>
                  <p className="text-gray-300 text-sm">{gps.notes}</p>
                </div>
                <Button
                  onClick={() => setSelectedModel(selectedModel === gps.brand ? null : gps.brand)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {selectedModel === gps.brand ? "Ocultar" : "Ver"} Configuração
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuração Detalhada */}
      {selectedModel && (
        <Card className="bg-gray-900 border-gray-600 mb-8">
          <CardHeader>
            <CardTitle className="text-amber-500">Configuração: {selectedModel}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Selecionar Operadora:</h4>
                <div className="space-y-2">
                  {operadoras.map((op) => (
                    <button
                      key={op.name}
                      onClick={() => setSelectedOperadora(op.name)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedOperadora === op.name
                          ? "bg-amber-500 text-black"
                          : "bg-gray-700 text-white hover:bg-gray-600"
                      }`}
                    >
                      <div className="font-medium">{op.name}</div>
                      <div className="text-sm opacity-75">APN: {op.apn}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Comandos SMS:</h4>
                <div className="space-y-2">
                  {(() => {
                    const model = gpsModels.find((g) => g.brand === selectedModel)
                    const operadora = operadoras.find((o) => o.name === selectedOperadora)
                    if (!model || !operadora) return null

                    return generateCommands(model, operadora).map((cmd, i) => (
                      <div key={i} className="bg-gray-700 p-3 rounded-lg">
                        <code className="text-green-400 text-sm break-all">{cmd}</code>
                        <Button
                          onClick={() => navigator.clipboard.writeText(cmd)}
                          size="sm"
                          className="ml-2 bg-gray-600 hover:bg-gray-500 text-white"
                        >
                          Copiar
                        </Button>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruções Gerais */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-amber-500" />
            Instruções Gerais de Configuração
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-4">
          <div>
            <h4 className="text-white font-semibold mb-2">1. 📱 Configuração via SMS:</h4>
            <p>Envie os comandos SMS para o número do chip do GPS na ordem mostrada acima.</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">2. 🌐 URL do Servidor:</h4>
            <div className="bg-gray-700 p-3 rounded-lg">
              <code className="text-green-400">https://seu-dominio.vercel.app/api/gps/receive</code>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">3. ⏱️ Intervalo Recomendado:</h4>
            <p>30 segundos para uso normal, 10 segundos para monitoramento intensivo.</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">4. 📡 Teste de Conectividade:</h4>
            <p>Após configurar, envie comando de localização (WHERE# ou check) para testar.</p>
          </div>

          <div className="bg-amber-900/20 border border-amber-500/50 p-4 rounded-lg">
            <h4 className="text-amber-400 font-semibold mb-2">⚠️ Importante:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Certifique-se de que o chip tenha créditos e dados móveis</li>
              <li>• Teste primeiro com poucos dispositivos</li>
              <li>• Mantenha backup das configurações originais</li>
              <li>• Alguns modelos podem precisar de adaptações específicas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
