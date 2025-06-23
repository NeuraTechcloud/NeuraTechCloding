const bcrypt = require("bcryptjs")

async function testAuth() {
  console.log("🧪 Testando autenticação...")

  // Credenciais de teste
  const testCases = [
    { email: "cliente@rastreramos.com", password: "senha123", type: "client" },
    { email: "admin@rastreramos.com", password: "admin123", type: "admin" },
  ]

  for (const testCase of testCases) {
    console.log(`\n🔍 Testando ${testCase.type}:`)
    console.log(`Email: ${testCase.email}`)
    console.log(`Senha: ${testCase.password}`)

    // Gerar hash para comparação
    const hash = await bcrypt.hash(testCase.password, 12)
    console.log(`Hash gerado: ${hash}`)

    // Verificar se o hash funciona
    const isValid = await bcrypt.compare(testCase.password, hash)
    console.log(`Verificação: ${isValid ? "✅ OK" : "❌ FALHOU"}`)

    // Testar API
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testCase.email,
          password: testCase.password,
        }),
      })

      const data = await response.json()
      console.log(`API Response: ${response.status}`)
      console.log(`Success: ${data.success ? "✅" : "❌"}`)
      if (data.user) {
        console.log(`User Type: ${data.user.user_type}`)
      }
      if (data.error) {
        console.log(`Error: ${data.error}`)
      }
    } catch (error) {
      console.log(`API Error: ${error.message}`)
    }
  }
}

testAuth().catch(console.error)
