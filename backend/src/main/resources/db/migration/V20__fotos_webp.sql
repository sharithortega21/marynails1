-- Fotos de los productos (25-nov-2026): se cargan en WebP (512 x 512, mas livianas que PNG).
-- Salen del catalogo que Sharith genero con IA. 45 de 47 productos tienen foto;
-- el iman para ojo de gato y el diluyente quedan sin foto por ahora.
UPDATE producto SET imagen_url = replace(imagen_url, '.png', '.webp')
WHERE imagen_url LIKE '/productos/%.png';

UPDATE producto SET imagen_url = NULL
WHERE nombre IN ('Imán para ojo de gato', 'Diluyente de esmalte (solo tradicional)')
  AND imagen_url LIKE '/productos/%';
