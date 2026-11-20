-- V13: recetas completas por servicio (lo que se usa y se lleva en el maletin) y rendimientos estimados.
-- Fuente: levantamiento con Sharith y Mary (bloques 2, 3 y 8) y el procedimiento profesional de cada servicio.
-- Solo los productos en modo CONSUMO se descuentan al atender; el resto sirve para el maletin.
-- Los valores marcados como ESTIMADO se corrigen con el uso real (modulo de prediccion).

-- Rendimientos que faltaban (ESTIMADO)
UPDATE producto SET modo_control = 'CONSUMO', presentacion = 14, unidad = 'ml', rendimiento = 40
 WHERE nombre IN ('Base tradicional (normal, fortalecedora o rosada)', 'Brillo tradicional (sellador)');
UPDATE producto SET rendimiento = 20 WHERE nombre IN ('Lima normal', 'Lima 100', 'Lima 180');
UPDATE producto SET rendimiento = 15 WHERE nombre = 'Lima esponja';
UPDATE producto SET rendimiento = 90 WHERE nombre = 'Pincel número 0 (Tiffany, azul)';
UPDATE producto SET rendimiento = 180 WHERE nombre = 'Pincel para resina';

-- Se reconstruyen todas las recetas
DELETE FROM receta;

CREATE TEMP TABLE kit (grupo TEXT, producto TEXT) ON COMMIT DROP;
INSERT INTO kit VALUES
 -- lo que se usa en cualquier servicio
 ('comun', 'Alcohol 75 % (pimpina)'), ('comun', 'Algodón (paquete mediano)'), ('comun', 'Toallas de secar'),
 ('comun', 'Removedor de cutícula (litro)'), ('comun', 'Cortacutícula'), ('comun', 'Aceite de cutícula'),
 ('comun', 'Lima esponja'),
 -- manos con esmalte tradicional
 ('manos_trad', 'Taza de manos'), ('manos_trad', 'Removedor de esmalte (acetona)'), ('manos_trad', 'Lima normal'),
 ('manos_trad', 'Base tradicional (normal, fortalecedora o rosada)'), ('manos_trad', 'Brillo tradicional (sellador)'),
 ('manos_trad', 'Diluyente de esmalte (solo tradicional)'), ('manos_trad', 'Pincel número 0 (Tiffany, azul)'),
 -- pies (pedicura)
 ('pies', 'Taza de pies'), ('pies', 'Toallas de tapete'), ('pies', 'Exfoliante (litro)'),
 ('pies', 'Removedor de callos (litro)'), ('pies', 'Cortauñas'), ('pies', 'Vinagre (litro)'),
 -- pies con esmalte tradicional
 ('pies_trad', 'Base tradicional (normal, fortalecedora o rosada)'), ('pies_trad', 'Brillo tradicional (sellador)'),
 -- semipermanente (manos o pies)
 ('semi', 'Removedor de esmalte (acetona)'), ('semi', 'Toallitas limpiadoras de uñas'), ('semi', 'Lima 180'),
 ('semi', 'Primer'), ('semi', 'Super bond'), ('semi', 'Base semipermanente (Rubber o 7 en 1)'),
 ('semi', 'Top coat (brillo semipermanente)'), ('semi', 'Lámpara de secado'), ('semi', 'Pincel número 0 (Tiffany, azul)'),
 -- soft gel
 ('softgel', 'Toallitas limpiadoras de uñas'), ('softgel', 'Lima 180'), ('softgel', 'Primer'), ('softgel', 'Super bond'),
 ('softgel', 'Base semipermanente (Rubber o 7 en 1)'), ('softgel', 'Caja de uñas postizas (Tiffany)'),
 ('softgel', 'Top coat (brillo semipermanente)'), ('softgel', 'Lámpara de secado'), ('softgel', 'Drill (Tiffany)'),
 -- resina
 ('resina', 'Toallitas limpiadoras de uñas'), ('resina', 'Lima 100'), ('resina', 'Lima 180'), ('resina', 'Primer'),
 ('resina', 'Resina (polvo y líquido)'), ('resina', 'Pincel para resina'), ('resina', 'Caja de uñas postizas (Tiffany)'),
 ('resina', 'Top coat (brillo semipermanente)'), ('resina', 'Lámpara de secado'), ('resina', 'Drill (Tiffany)');

CREATE TEMP TABLE servicio_kit (servicio TEXT, grupo TEXT) ON COMMIT DROP;
INSERT INTO servicio_kit VALUES
 ('Uñas tradicional caballero (manos y pies)', 'comun'), ('Uñas tradicional caballero (manos y pies)', 'manos_trad'),
 ('Uñas tradicional caballero (manos y pies)', 'pies'), ('Uñas tradicional caballero (manos y pies)', 'pies_trad'),
 ('Uñas tradicional dama (manos y pies)', 'comun'), ('Uñas tradicional dama (manos y pies)', 'manos_trad'),
 ('Uñas tradicional dama (manos y pies)', 'pies'), ('Uñas tradicional dama (manos y pies)', 'pies_trad'),
 ('Semipermanente caballero (manos y pies)', 'comun'), ('Semipermanente caballero (manos y pies)', 'semi'),
 ('Semipermanente caballero (manos y pies)', 'pies'),
 ('Semipermanente dama (solo manos)', 'comun'), ('Semipermanente dama (solo manos)', 'semi'),
 ('Semipermanente dama (manos y pies)', 'comun'), ('Semipermanente dama (manos y pies)', 'semi'),
 ('Semipermanente dama (manos y pies)', 'pies'),
 ('Manos semipermanente + pies tradicional', 'comun'), ('Manos semipermanente + pies tradicional', 'semi'),
 ('Manos semipermanente + pies tradicional', 'pies'), ('Manos semipermanente + pies tradicional', 'pies_trad'),
 ('Soft gel (solo mano)', 'comun'), ('Soft gel (solo mano)', 'softgel'),
 ('Uñas en resina (solo mano)', 'comun'), ('Uñas en resina (solo mano)', 'resina');

INSERT INTO receta (servicio_id, producto_id)
SELECT DISTINCT s.id, p.id
FROM servicio_kit sk
JOIN kit k ON k.grupo = sk.grupo
JOIN servicio s ON s.nombre = sk.servicio
JOIN producto p ON p.nombre = k.producto;
