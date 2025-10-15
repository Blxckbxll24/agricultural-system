-- Script para poblar datos iniciales en MySQL
USE agricultural_system;

-- Insertar usuario administrador por defecto
-- Password: admin123 (debe ser cambiado en producción)
INSERT INTO users (username, email, password_hash, role, full_name) VALUES
('admin', 'admin@agricultural.com', '$2b$10$rKvVLZ8xqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'admin', 'Administrador del Sistema'),
('operator1', 'operator@agricultural.com', '$2b$10$rKvVLZ8xqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'operator', 'Operador Principal'),
('viewer1', 'viewer@agricultural.com', '$2b$10$rKvVLZ8xqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'viewer', 'Visualizador');

-- Insertar parcelas de ejemplo
INSERT INTO parcels (name, location, latitude, longitude, area_hectares, crop_type, planting_date, status) VALUES
('Parcela Norte A1', 'Sector Norte', 19.432608, -99.133209, 5.5, 'Maíz', '2024-03-15', 'active'),
('Parcela Sur B2', 'Sector Sur', 19.428608, -99.138209, 3.2, 'Trigo', '2024-04-01', 'active'),
('Parcela Este C3', 'Sector Este', 19.435608, -99.128209, 7.8, 'Soja', '2024-02-20', 'active'),
('Parcela Oeste D4', 'Sector Oeste', 19.430608, -99.143209, 4.1, 'Tomate', '2024-05-10', 'active'),
('Parcela Central E5', 'Sector Central', 19.432108, -99.135209, 6.3, 'Maíz', '2024-03-25', 'active'),
('Parcela Norte A2', 'Sector Norte', 19.434608, -99.131209, 4.9, 'Frijol', '2024-04-15', 'maintenance'),
('Parcela Sur B3', 'Sector Sur', 19.426608, -99.140209, 5.7, 'Calabaza', '2024-03-05', 'active'),
('Parcela Este C4', 'Sector Este', 19.437608, -99.126209, 8.2, 'Trigo', '2024-02-28', 'active');

-- Insertar algunas parcelas eliminadas de ejemplo
INSERT INTO deleted_parcels (parcel_id, name, location, latitude, longitude, area_hectares, crop_type, planting_date, status, created_at, deleted_by, deletion_reason) VALUES
(100, 'Parcela Antigua X1', 'Sector Abandonado', 19.440608, -99.145209, 3.5, 'Maíz', '2023-01-15', 'inactive', '2023-01-15 10:00:00', 'admin', 'Suelo agotado, requiere descanso'),
(101, 'Parcela Vieja Y2', 'Sector Retirado', 19.425608, -99.150209, 2.8, 'Trigo', '2023-06-20', 'inactive', '2023-06-20 14:30:00', 'admin', 'Problemas de drenaje persistentes');
