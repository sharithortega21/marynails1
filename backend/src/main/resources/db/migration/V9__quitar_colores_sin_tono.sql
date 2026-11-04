-- V9: Tres Oros y Benevolente toman el tono de la carta oficial Masglo.
UPDATE color SET hex = '#bd8e87' WHERE linea = 'Masglo' AND codigo = 'Tres Oros';
UPDATE color SET hex = '#707d83' WHERE linea = 'Masglo' AND codigo = 'Benevolente';

-- Los esmaltes Masglo / Gel Evolution que no tienen tono en la carta original no se manejan en el inventario.
-- Solo se borran si no tienen existencias ni compras pendientes ni movimientos.
DELETE FROM producto p
USING color c
WHERE c.producto_id = p.id
  AND c.hex IS NULL
  AND c.linea IN ('Masglo', 'Gel Evolution')
  AND p.stock_actual = 0
  AND p.por_comprar = 0
  AND NOT EXISTS (SELECT 1 FROM movimiento m WHERE m.producto_id = p.id)
  AND NOT EXISTS (SELECT 1 FROM detalle_compra d WHERE d.producto_id = p.id);
