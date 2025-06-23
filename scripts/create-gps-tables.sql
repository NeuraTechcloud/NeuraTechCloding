-- Criar tabela para histórico de localizações
CREATE TABLE IF NOT EXISTS vehicle_locations (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  speed INTEGER DEFAULT 0,
  altitude INTEGER DEFAULT 0,
  heading INTEGER DEFAULT 0,
  satellites INTEGER DEFAULT 0,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_vehicle_id ON vehicle_locations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_timestamp ON vehicle_locations(timestamp);

-- Criar tabela para comandos enviados aos dispositivos
CREATE TABLE IF NOT EXISTS vehicle_commands (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  command_type VARCHAR(50) NOT NULL, -- 'locate', 'lock', 'unlock', 'reboot'
  command_data JSONB,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'confirmed', 'failed'
  sent_at TIMESTAMP,
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela para configurações de dispositivos
CREATE TABLE IF NOT EXISTS device_settings (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  setting_name VARCHAR(100) NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vehicle_id, setting_name)
);

-- Inserir configurações padrão
INSERT INTO device_settings (vehicle_id, setting_name, setting_value)
SELECT 
  v.id,
  'server_url',
  'https://seu-dominio.vercel.app/api/gps/receive'
FROM vehicles v
WHERE NOT EXISTS (
  SELECT 1 FROM device_settings ds 
  WHERE ds.vehicle_id = v.id AND ds.setting_name = 'server_url'
);

INSERT INTO device_settings (vehicle_id, setting_name, setting_value)
SELECT 
  v.id,
  'update_interval',
  '30'
FROM vehicles v
WHERE NOT EXISTS (
  SELECT 1 FROM device_settings ds 
  WHERE ds.vehicle_id = v.id AND ds.setting_name = 'update_interval'
);
