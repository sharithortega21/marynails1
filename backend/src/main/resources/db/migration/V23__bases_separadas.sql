-- V23: la base Rubber y la base 7 en 1 (Tiffany) pasan a ser dos productos (pedido de Sharith, 26-nov-2026).
-- Rendimiento igual al de antes (25 clientas). La 7 en 1 tambien se usa para pegar, por eso va en el soft gel.

-- El producto que ya existia queda como Base Rubber (conserva su stock, historial y recetas)
UPDATE producto
   SET nombre = 'Base Rubber', imagen_url = '/productos/base_rubber.webp'
 WHERE nombre = 'Base semipermanente (Rubber o 7 en 1)';

INSERT INTO producto (nombre, categoria, modo_control, rendimiento, es_critico, imagen_url)
SELECT 'Base 7 en 1 (Tiffany)', categoria, modo_control, rendimiento, es_critico, '/productos/base_7_en_1_tiffany.webp'
  FROM producto WHERE nombre = 'Base Rubber'
   AND NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Base 7 en 1 (Tiffany)');

-- Semipermanente: Base Rubber. Soft gel: Base 7 en 1 (sirve de base y de pega).
UPDATE receta r
   SET producto_id = (SELECT id FROM producto WHERE nombre = 'Base 7 en 1 (Tiffany)')
  FROM servicio s
 WHERE r.servicio_id = s.id AND s.familia = 'SOFT_GEL'
   AND r.producto_id = (SELECT id FROM producto WHERE nombre = 'Base Rubber');
