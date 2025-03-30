-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS monitoreo_ambiental;
USE monitoreo_ambiental;

-- Tabla para mediciones de calidad del aire
CREATE TABLE IF NOT EXISTS air_quality_measurements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  aqi FLOAT NOT NULL,
  temperature FLOAT,
  humidity FLOAT,
  timestamp DATETIME NOT NULL,
  source VARCHAR(50) NOT NULL
);

-- Tabla para datos meteorológicos
CREATE TABLE IF NOT EXISTS weather_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  temperature FLOAT NOT NULL,
  humidity FLOAT,
  wind_speed FLOAT,
  wind_direction VARCHAR(10),
  precipitation FLOAT,
  uv_index FLOAT,
  pressure FLOAT,
  timestamp DATETIME NOT NULL,
  source VARCHAR(50) NOT NULL
);

-- Tabla para alertas ambientales
CREATE TABLE IF NOT EXISTS environmental_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alert_type ENUM('AIR_QUALITY', 'WEATHER', 'OTHER') NOT NULL,
  severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
  city VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  expires_at DATETIME,
  is_active BOOLEAN DEFAULT TRUE
);

-- Tabla para configuración de umbrales de alerta
CREATE TABLE IF NOT EXISTS alert_thresholds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parameter VARCHAR(50) NOT NULL,
  low_threshold FLOAT,
  medium_threshold FLOAT,
  high_threshold FLOAT,
  critical_threshold FLOAT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar umbrales predeterminados
INSERT INTO alert_thresholds (parameter, low_threshold, medium_threshold, high_threshold, critical_threshold)
VALUES
  ('aqi', 50, 100, 150, 200),
  ('temperature', 30, 33, 35, 40),
  ('uv_index', 3, 6, 8, 11);