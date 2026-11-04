-- V10: Visos Rosa y Visos Plata salen en blanco en la carta oficial, asi que no se manejan en el inventario.
DELETE FROM producto p
USING color c
WHERE c.producto_id = p.id
  AND c.linea = 'Masglo' AND c.codigo IN ('Visos Rosa', 'Visos Plata')
  AND p.stock_actual = 0
  AND p.por_comprar = 0
  AND NOT EXISTS (SELECT 1 FROM movimiento m WHERE m.producto_id = p.id)
  AND NOT EXISTS (SELECT 1 FROM detalle_compra d WHERE d.producto_id = p.id);
