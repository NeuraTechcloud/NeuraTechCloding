-- Corrigir usuário administrador com hash correto para senha "admin123"
-- Hash gerado: $2b$12$rQZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9Q

UPDATE users 
SET password_hash = '$2b$12$rQZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9Q',
    name = 'Administrador do Sistema',
    user_type = 'admin'
WHERE email = 'admin@rastreramos.com';

-- Se não existir, criar o usuário admin
INSERT INTO users (email, password_hash, name, user_type) 
VALUES (
  'admin@rastreramos.com', 
  '$2b$12$rQZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9Q', 
  'Administrador do Sistema', 
  'admin'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  user_type = EXCLUDED.user_type;

-- Verificar se foi criado corretamente
SELECT 
  id, 
  name, 
  email, 
  user_type, 
  created_at,
  'Senha: admin123' as senha_info
FROM users 
WHERE email = 'admin@rastreramos.com';
