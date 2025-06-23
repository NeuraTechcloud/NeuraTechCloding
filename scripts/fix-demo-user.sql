-- Corrigir usuário de demonstração com hash correto
UPDATE users 
SET password_hash = '$2b$12$LQv3c1yqBwlVHpPjrGHPLOFccmhLI.jd0UpudfBR9NirnYinLvZgS'
WHERE email = 'cliente@rastreramos.com';

-- Se não existir, criar o usuário
INSERT INTO users (email, password_hash, name, user_type) 
VALUES (
  'cliente@rastreramos.com', 
  '$2b$12$LQv3c1yqBwlVHpPjrGHPLOFccmhLI.jd0UpudfBR9NirnYinLvZgS', 
  'Cliente Demonstração', 
  'client'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash;
