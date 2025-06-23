-- Remover qualquer admin existente
DELETE FROM users WHERE user_type = 'admin';

-- Criar apenas o admin único
INSERT INTO users (email, password_hash, name, user_type) 
VALUES (
  'admin@rastreramos.com', 
  '$2b$12$LQv3c1yqBwlVHpPjrGHPLOFccmhLI.jd0UpudfBR9NirnYinLvZgS', 
  'Administrador do Sistema', 
  'admin'
);

-- Garantir que existe o cliente de teste
INSERT INTO users (email, password_hash, name, user_type) 
VALUES (
  'cliente@rastreramos.com', 
  '$2b$12$LQv3c1yqBwlVHpPjrGHPLOFccmhLI.jd0UpudfBR9NirnYinLvZgS', 
  'Cliente Demonstração', 
  'client'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name;

-- Verificar configuração final
SELECT 
  id, 
  email, 
  name, 
  user_type, 
  created_at,
  CASE 
    WHEN user_type = 'admin' THEN 'Acesso total ao sistema'
    WHEN email = 'cliente@rastreramos.com' THEN 'Senha: senha123'
    ELSE 'Cliente normal'
  END as info
FROM users 
ORDER BY user_type DESC, id;

-- Mostrar resumo de segurança
SELECT 
  '=== CONFIGURAÇÃO DE SEGURANÇA ===' as titulo,
  'Admin único: admin@rastreramos.com' as admin_info,
  'Cliente teste: cliente@rastreramos.com / senha123' as cliente_info,
  'Admin não tem fallback - apenas banco de dados' as seguranca;
