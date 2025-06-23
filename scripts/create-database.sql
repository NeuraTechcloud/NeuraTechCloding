-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  user_type VARCHAR(50) DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de veículos
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  plate VARCHAR(20) NOT NULL,
  imei VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'offline',
  speed INTEGER DEFAULT 0,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  address TEXT,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_imei ON vehicles(imei);

-- Inserir usuário de demonstração (senha: senha123)
INSERT INTO users (email, password_hash, name, user_type) 
VALUES (
  'cliente@rastreramos.com', 
  '$2b$12$rQZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9Q', 
  'Cliente Demonstração', 
  'client'
)
ON CONFLICT (email) DO NOTHING;

-- Inserir alguns veículos de demonstração
INSERT INTO vehicles (user_id, name, plate, imei, status, speed, lat, lng, address) 
VALUES 
  (1, 'Fiat Strada', 'RIO2A18', '358723000000010', 'online', 88, -22.4841, -42.9645, 'BR-101, Itaboraí - RJ'),
  (1, 'Honda Civic', 'SAO4B22', '358723000000011', 'stopped', 0, -22.9774, -43.2039, 'R. Jardim Botânico, Rio de Janeiro - RJ'),
  (1, 'VW Nivus', 'BHZ7C33', '358723000000012', 'offline', 0, -19.9167, -43.9345, 'Praça da Liberdade, Belo Horizonte - MG')
ON CONFLICT (imei) DO NOTHING;
