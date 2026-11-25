-- Fotos de los productos (25-nov-2026): se cargan en WebP (512 x 512, mas livianas que PNG).
-- Salen del catalogo que Sharith genero con IA; las del iman y el diluyente, de dos imagenes aparte.
UPDATE producto SET imagen_url = replace(imagen_url, '.png', '.webp')
WHERE imagen_url LIKE '/productos/%.png';
