-- Mary Nails | V2: datos iniciales reales (servicios, productos, colores, recetas)

INSERT INTO sector (barrio, municipio) VALUES ('La Libertad','Cúcuta'), ('Prados del Este','Cúcuta');

INSERT INTO servicio (nombre, precio, familia, duracion_min) VALUES
 ('Uñas tradicional caballero (manos y pies)', 30000, 'TRADICIONAL', 75),
 ('Uñas tradicional dama (manos y pies)', 35000, 'TRADICIONAL', 75),
 ('Semipermanente caballero (manos y pies)', 40000, 'SEMIPERMANENTE', 105),
 ('Semipermanente dama (solo manos)', 40000, 'SEMIPERMANENTE', 60),
 ('Semipermanente dama (manos y pies)', 65000, 'SEMIPERMANENTE', 105),
 ('Manos semipermanente + pies tradicional', 50000, 'MIXTO', 55),
 ('Soft gel (solo mano)', 60000, 'SOFT_GEL', 90),
 ('Uñas en resina (solo mano)', 80000, 'RESINA', 90);

-- Base semipermanente: Mary usa Rubber o 7 en 1 indistintamente; se controla como un solo producto.
INSERT INTO producto (nombre, categoria, modo_control, presentacion, unidad, rendimiento, es_critico) VALUES
 ('Base semipermanente (Rubber o 7 en 1)', 'Semipermanente', 'CONSUMO', NULL, NULL, 25, TRUE);

INSERT INTO producto (nombre, categoria, modo_control, presentacion, unidad, rendimiento, es_critico) VALUES
 ('Primer', 'Semipermanente', 'TIEMPO', NULL, NULL, 45, FALSE),
 ('Super bond', 'Semipermanente', 'TIEMPO', NULL, NULL, 45, FALSE),
 ('Top coat (brillo semipermanente)', 'Semipermanente', 'CONSUMO', NULL, NULL, 25, FALSE),
 ('Base tradicional (normal, fortalecedora o rosada)', 'Tradicional', 'MANUAL', NULL, NULL, NULL, FALSE),
 ('Brillo tradicional (sellador)', 'Tradicional', 'MANUAL', NULL, NULL, NULL, FALSE),
 ('Lima metálica', 'Herramientas', 'TIEMPO', 1, 'unidad', 45, TRUE),
 ('Lima normal', 'Herramientas', 'TIEMPO', 1, 'unidad', NULL, TRUE),
 ('Lima esponja', 'Herramientas', 'TIEMPO', 1, 'unidad', NULL, TRUE),
 ('Lima 100', 'Herramientas', 'TIEMPO', 1, 'unidad', NULL, TRUE),
 ('Lima 180', 'Herramientas', 'TIEMPO', 1, 'unidad', NULL, TRUE),
 ('Cortauñas', 'Herramientas', 'TIEMPO', 1, 'unidad', 45, FALSE),
 ('Cortacutícula', 'Herramientas', 'TIEMPO', 1, 'unidad', 45, FALSE),
 ('Pincel número 0 (Tiffany, azul)', 'Herramientas', 'TIEMPO', 1, 'unidad', NULL, FALSE),
 ('Pincel para resina', 'Herramientas', 'TIEMPO', 1, 'unidad', NULL, FALSE),
 ('Imán para ojo de gato', 'Herramientas', 'MANUAL', 1, 'unidad', NULL, FALSE),
 ('Drill (Tiffany)', 'Equipos', 'TIEMPO', 1, 'unidad', 365, FALSE),
 ('Lámpara de secado', 'Equipos', 'TIEMPO', 1, 'unidad', 120, FALSE),
 ('Taza de manos', 'Equipos', 'MANUAL', 1, 'unidad', NULL, FALSE),
 ('Taza de pies', 'Equipos', 'MANUAL', 1, 'unidad', NULL, FALSE),
 ('Silla plegable (Rimax)', 'Equipos', 'MANUAL', 1, 'unidad', NULL, FALSE),
 ('Morral grande', 'Equipos', 'TIEMPO', 1, 'unidad', 365, FALSE),
 ('Maleta', 'Equipos', 'TIEMPO', 1, 'unidad', 365, FALSE),
 ('Toallas de secar', 'Textiles', 'TIEMPO', 5, 'unidad', 180, FALSE),
 ('Toallas de tapete', 'Textiles', 'TIEMPO', 3, 'unidad', 180, FALSE),
 ('Algodón (paquete mediano)', 'Aseo', 'TIEMPO', 1, 'paquete', 30, FALSE),
 ('Alcohol 75 % (pimpina)', 'Aseo', 'TIEMPO', 3.8, 'L', 120, TRUE),
 ('Exfoliante (litro)', 'Aseo', 'TIEMPO', 1, 'L', 30, FALSE),
 ('Vinagre (litro)', 'Aseo', 'TIEMPO', 1, 'L', 120, FALSE),
 ('Removedor de esmalte (acetona)', 'Aseo', 'CONSUMO', 250, 'ml', 35, FALSE),
 ('Removedor de cutícula (litro)', 'Aseo', 'TIEMPO', 1, 'L', 730, FALSE),
 ('Removedor de callos (litro)', 'Aseo', 'TIEMPO', 1, 'L', 365, FALSE),
 ('Diluyente de esmalte (solo tradicional)', 'Aseo', 'TIEMPO', 1, 'unidad', 120, FALSE),
 ('Aceite de cutícula', 'Aseo', 'TIEMPO', 1, 'unidad', 60, FALSE),
 ('Toallitas limpiadoras de uñas', 'Aseo', 'TIEMPO', 1, 'paquete', 60, FALSE),
 ('Stickers (paquete)', 'Decoración', 'TIEMPO', 1, 'paquete', 60, FALSE),
 ('Piedritas (números 0, 1, 2 y 3)', 'Decoración', 'MANUAL', NULL, NULL, NULL, FALSE),
 ('Papelillo dorado', 'Decoración', 'MANUAL', NULL, NULL, NULL, FALSE),
 ('Papelillo plateado', 'Decoración', 'MANUAL', NULL, NULL, NULL, FALSE),
 ('Efecto espejo (polvos, 8 a 10 tonos)', 'Decoración', 'MANUAL', NULL, NULL, NULL, FALSE),
 ('Hilos tipo spider (tendencia)', 'Decoración', 'MANUAL', NULL, NULL, NULL, FALSE),
 ('Caja de uñas postizas (Tiffany)', 'Consumibles', 'CONSUMO', 1, 'caja', 10, FALSE),
 ('Pega (adhesivo)', 'Consumibles', 'MANUAL', NULL, NULL, NULL, FALSE),
 ('Gel de construcción', 'Gel y resina', 'MANUAL', NULL, NULL, NULL, FALSE),
 ('Gel para figuras 3D (alto relieve)', 'Gel y resina', 'MANUAL', NULL, NULL, NULL, FALSE),
 ('Resina (polvo y líquido)', 'Gel y resina', 'MANUAL', NULL, NULL, NULL, FALSE);

-- Colores gelpolish 001-264 (numero como texto con ceros; carta fisica de Mary)
INSERT INTO producto (nombre, categoria, modo_control, presentacion, unidad)
SELECT 'Gelpolish ' || lpad(n::text, 3, '0'), 'Esmaltes', 'MANUAL', 7, 'ml' FROM generate_series(1, 264) AS n;
INSERT INTO color (producto_id, linea, codigo)
SELECT id, 'Gelpolish', substr(nombre, 11) FROM producto WHERE nombre LIKE 'Gelpolish %';

-- Recetas: solo productos en modo CONSUMO (descuentan stock por cita atendida)
INSERT INTO receta (servicio_id, producto_id)
SELECT s.id, p.id FROM servicio s, producto p
WHERE p.nombre LIKE 'Removedor de esmalte%' AND s.familia IN ('TRADICIONAL','SEMIPERMANENTE','MIXTO');
INSERT INTO receta (servicio_id, producto_id)
SELECT s.id, p.id FROM servicio s, producto p
WHERE p.nombre IN ('Base semipermanente (Rubber o 7 en 1)','Top coat (brillo semipermanente)')
  AND s.familia IN ('SEMIPERMANENTE','MIXTO');
