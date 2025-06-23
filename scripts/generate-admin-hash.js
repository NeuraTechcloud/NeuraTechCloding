const bcrypt = require("bcryptjs")

async function generateHash() {
  console.log('🔐 Gerando hash para senha "admin123"...')

  const password = "admin123"
  const hash = await bcrypt.hash(password, 12)

  console.log("✅ Hash gerado:")
  console.log(hash)

  // Testar o hash
  const isValid = await bcrypt.compare(password, hash)
  console.log("🧪 Teste do hash:", isValid ? "✅ Válido" : "❌ Inválido")

  // SQL para atualizar
  console.log("\n📝 SQL para atualizar:")
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@rastreramos.com';`)
}

generateHash().catch(console.error)
