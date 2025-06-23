-- Garantir que os usuários de teste existam
-- Deletar usuários existentes primeiro
DELETE FROM users WHERE email IN ('cliente@rastreramos.com', 'admin@rastreramos.com');

-- Criar usuário cliente
INSERT INTO users (email, password_hash, name, user_type) 
VALUES (
  'cliente@rastreramos.com', 
  '$2b$12$LQv3c1yqBwlVHpPjrGHPLOFccmhLI.jd0UpudfBR9NirnYinLvZgS', 
  'Cliente Demonstração', 
  'client'
);

-- Criar usuário admin
INSERT INTO users (email, password_hash, name, user_type) 
VALUES (
  'admin@rastreramos.com', 
  '$2b$12$LQv3c1yqBwlVHpPjrGHPLOFccmhLI.jd0UpudfBR9NirnYinLvZgS', 
  'Administrador do Sistema', 
  'admin'
);

-- Verificar se foram criados
SELECT 
  id, 
  email, 
  name, 
  user_type, 
  created_at,
  CASE 
    WHEN email = 'cliente@rastreramos.com' THEN 'Senha: senha123'
    WHEN email = 'admin@rastreramos.com' THEN 'Senha: admin123'
  END as senha_info
FROM users 
WHERE email IN ('cliente@rastreramos.com', 'admin@rastreramos.com')
ORDER BY user_type;

-- Mostrar resumo
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN user_type = 'client' THEN 1 END) as clientes,
  COUNT(CASE WHEN user_type = 'admin' THEN 1 END) as admins
FROM users;
