-- Gerar hash correto para senha "admin123"
-- Executar o script generate-admin-hash.js primeiro para obter o hash

-- Deletar admin existente se houver
DELETE FROM users WHERE email = 'admin@rastreramos.com';

-- Criar usuário administrador com hash correto
-- Este hash será gerado pelo script Node.js
INSERT INTO users (email, password_hash, name, user_type) 
VALUES (
  'admin@rastreramos.com', 
  '$2b$12$LQv3c1yqBwlVHpPjrGHPLOFccmhLI.jd0UpudfBR9NirnYinLvZgS', 
  'Administrador do Sistema', 
  'admin'
);

-- Verificar se foi criado
SELECT 
  id, 
  name, 
  email, 
  user_type, 
  created_at,
  'Senha: admin123' as info
FROM users 
WHERE email = 'admin@rastreramos.com';

-- Mostrar instruções
SELECT 
  '=== CREDENCIAIS DE ADMINISTRADOR ===' as titulo,
  'Email: admin@rastreramos.com' as email,
  'Senha: admin123' as senha,
  'Acesso: /admin' as url;
