-- Criar usuário administrador
-- Senha: admin123 (hash: $2b$12$LQv3c1yqBwlVHpPjrGHPLOFccmhLI.jd0UpudfBR9NirnYinLvZgS)

INSERT INTO users (email, password_hash, name, user_type) 
VALUES (
  'admin@rastreramos.com', 
  '$2b$12$LQv3c1yqBwlVHpPjrGHPLOFccmhLI.jd0UpudfBR9NirnYinLvZgS', 
  'Administrador do Sistema', 
  'admin'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  user_type = EXCLUDED.user_type;

-- Verificar se foi criado
SELECT id, name, email, user_type, created_at FROM users WHERE user_type = 'admin';

-- Mostrar credenciais
SELECT 
  'CREDENCIAIS DE ADMINISTRADOR:' as info,
  'Email: admin@rastreramos.com' as email,
  'Senha: admin123' as senha,
  'Acesso: /admin ou /admin/users' as acesso;
