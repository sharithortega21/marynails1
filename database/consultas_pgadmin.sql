-- =====================================================================
--  MARY NAILS | Consultas para pgAdmin
--  Se ejecuta cada una por separado: seleccionar la consulta y pulsar F5.
-- =====================================================================

-- ---------------------------------------------------------------------
-- A. VER LAS TABLAS COMPLETAS
-- ---------------------------------------------------------------------
SELECT * FROM sector;
SELECT * FROM servicio;
SELECT * FROM cliente;
SELECT * FROM producto  ORDER BY categoria, nombre;
SELECT * FROM color     ORDER BY linea, codigo;
SELECT * FROM receta;
SELECT * FROM cita      ORDER BY fecha, hora;
SELECT * FROM compra;
SELECT * FROM detalle_compra;
SELECT * FROM movimiento;
SELECT * FROM gasto     ORDER BY fecha;

-- Cuantos registros tiene cada tabla
SELECT 'sector' AS tabla, COUNT(*) FROM sector
UNION ALL SELECT 'servicio',       COUNT(*) FROM servicio
UNION ALL SELECT 'cliente',        COUNT(*) FROM cliente
UNION ALL SELECT 'producto',       COUNT(*) FROM producto
UNION ALL SELECT 'color',          COUNT(*) FROM color
UNION ALL SELECT 'cita',           COUNT(*) FROM cita
UNION ALL SELECT 'compra',         COUNT(*) FROM compra
UNION ALL SELECT 'detalle_compra', COUNT(*) FROM detalle_compra
UNION ALL SELECT 'movimiento',     COUNT(*) FROM movimiento
UNION ALL SELECT 'gasto',          COUNT(*) FROM gasto
UNION ALL SELECT 'usuario',        COUNT(*) FROM usuario;

-- ---------------------------------------------------------------------
-- B. CLIENTAS Y AGENDA
-- ---------------------------------------------------------------------

-- Clientas con su barrio y municipio
SELECT c.id, c.nombre, c.telefono, s.barrio, s.municipio, c.frecuencia_dias
FROM cliente c
LEFT JOIN sector s ON s.id = c.sector_id
ORDER BY c.nombre;

-- Todas las citas con clienta y servicio
SELECT ci.id, ci.fecha, ci.hora, c.nombre AS clienta, sv.nombre AS servicio,
       ci.turnos, ci.lugar, ci.estado, ci.precio_cobrado, ci.valor_pagado
FROM cita ci
JOIN cliente  c  ON c.id  = ci.cliente_id
JOIN servicio sv ON sv.id = ci.servicio_id
ORDER BY ci.fecha, ci.hora;

-- Citas de hoy
SELECT ci.hora, c.nombre AS clienta, sv.nombre AS servicio, ci.estado
FROM cita ci
JOIN cliente  c  ON c.id  = ci.cliente_id
JOIN servicio sv ON sv.id = ci.servicio_id
WHERE ci.fecha = CURRENT_DATE
ORDER BY ci.hora;

-- Citas de la semana actual (lunes a sabado)
SELECT ci.fecha, ci.hora, c.nombre AS clienta, sv.nombre AS servicio, ci.estado
FROM cita ci
JOIN cliente  c  ON c.id  = ci.cliente_id
JOIN servicio sv ON sv.id = ci.servicio_id
WHERE ci.fecha BETWEEN date_trunc('week', CURRENT_DATE)::date
                   AND date_trunc('week', CURRENT_DATE)::date + 5
ORDER BY ci.fecha, ci.hora;

-- Cuantas citas hay por estado
SELECT estado, COUNT(*) AS total FROM cita GROUP BY estado ORDER BY total DESC;

-- Clientas por recontactar: ya pasaron los dias de su frecuencia y no tienen cita programada
SELECT c.nombre, c.telefono, c.frecuencia_dias,
       MAX(ci.fecha) FILTER (WHERE ci.estado = 'ATENDIDA') AS ultima_cita,
       CURRENT_DATE - MAX(ci.fecha) FILTER (WHERE ci.estado = 'ATENDIDA') AS dias_sin_venir
FROM cliente c
LEFT JOIN cita ci ON ci.cliente_id = c.id
GROUP BY c.id
HAVING MAX(ci.fecha) FILTER (WHERE ci.estado = 'ATENDIDA') IS NOT NULL
   AND COUNT(*) FILTER (WHERE ci.estado = 'PROGRAMADA' AND ci.fecha >= CURRENT_DATE) = 0
   AND CURRENT_DATE - MAX(ci.fecha) FILTER (WHERE ci.estado = 'ATENDIDA') >= c.frecuencia_dias
ORDER BY dias_sin_venir DESC;

-- Servicios mas pedidos
SELECT sv.nombre, COUNT(*) AS veces, SUM(ci.turnos) AS turnos
FROM cita ci
JOIN servicio sv ON sv.id = ci.servicio_id
WHERE ci.estado = 'ATENDIDA'
GROUP BY sv.nombre
ORDER BY veces DESC;

-- ---------------------------------------------------------------------
-- C. INVENTARIO Y CATALOGO
-- ---------------------------------------------------------------------

-- Productos con su tono (esmaltes)
SELECT p.id, p.nombre, co.linea, co.codigo, co.acabado, co.hex, p.stock_actual
FROM producto p
JOIN color co ON co.producto_id = p.id
ORDER BY co.linea, co.codigo;

-- Cuantos colores hay por linea
SELECT linea, COUNT(*) AS colores FROM color GROUP BY linea ORDER BY linea;

-- Buscar un color por nombre (cambiar 'Rosa')
SELECT p.nombre, co.linea, co.hex
FROM producto p JOIN color co ON co.producto_id = p.id
WHERE p.nombre ILIKE '%Rosa%'
ORDER BY co.linea, p.nombre;

-- Productos habituales ("lo de siempre") con la cantidad que se quiere tener
SELECT nombre, categoria, stock_actual, cantidad_habitual
FROM producto
WHERE es_habitual = TRUE
ORDER BY categoria, nombre;

-- Productos criticos (no pueden faltar)
SELECT nombre, categoria, stock_actual, stock_minimo
FROM producto
WHERE es_critico = TRUE;

-- LISTA DE COMPRAS: lo que hay que comprar ahora
SELECT nombre, categoria, stock_actual, cantidad_habitual, por_comprar
FROM producto
WHERE por_comprar > 0
   OR (es_habitual AND stock_actual < cantidad_habitual)
   OR (es_critico  AND stock_actual <= stock_minimo)
ORDER BY categoria, nombre;

-- Receta: que productos usa cada servicio
SELECT sv.nombre AS servicio, p.nombre AS producto
FROM receta r
JOIN servicio sv ON sv.id = r.servicio_id
JOIN producto p  ON p.id  = r.producto_id
ORDER BY sv.nombre, p.nombre;

-- Historial de movimientos de inventario
SELECT m.fecha, p.nombre, m.tipo, m.cantidad
FROM movimiento m JOIN producto p ON p.id = m.producto_id
ORDER BY m.fecha DESC, m.id DESC;

-- ---------------------------------------------------------------------
-- D. COMPRAS A LA DISTRIBUIDORA
-- ---------------------------------------------------------------------

-- Compras con su detalle y total
SELECT c.id, c.fecha, c.proveedor, p.nombre AS producto,
       d.cantidad, d.costo_unitario, d.cantidad * d.costo_unitario AS subtotal
FROM compra c
JOIN detalle_compra d ON d.compra_id = c.id
JOIN producto p       ON p.id = d.producto_id
ORDER BY c.fecha DESC, c.id;

-- Total por compra
SELECT c.id, c.fecha, c.proveedor, SUM(d.cantidad * d.costo_unitario) AS total
FROM compra c JOIN detalle_compra d ON d.compra_id = c.id
GROUP BY c.id ORDER BY c.fecha DESC;

-- ---------------------------------------------------------------------
-- E. FINANZAS
-- ---------------------------------------------------------------------

-- Ingresos del mes actual (lo realmente pagado en citas atendidas)
SELECT COALESCE(SUM(valor_pagado), 0) AS ingresos_mes
FROM cita
WHERE estado = 'ATENDIDA'
  AND date_trunc('month', fecha) = date_trunc('month', CURRENT_DATE);

-- Por cobrar (atendidas con saldo pendiente)
SELECT c.nombre, ci.fecha, ci.precio_cobrado + ci.extra_diseno - ci.valor_pagado AS saldo
FROM cita ci JOIN cliente c ON c.id = ci.cliente_id
WHERE ci.estado = 'ATENDIDA' AND ci.precio_cobrado + ci.extra_diseno > ci.valor_pagado;

-- Gastos por categoria del mes actual
SELECT categoria, SUM(monto) AS total
FROM gasto
WHERE date_trunc('month', fecha) = date_trunc('month', CURRENT_DATE)
GROUP BY categoria ORDER BY total DESC;

-- Resumen del mes: ingresos, compras, gastos y ganancia
SELECT
  (SELECT COALESCE(SUM(valor_pagado), 0) FROM cita
    WHERE estado = 'ATENDIDA' AND date_trunc('month', fecha) = date_trunc('month', CURRENT_DATE)) AS ingresos,
  (SELECT COALESCE(SUM(d.cantidad * d.costo_unitario), 0) FROM detalle_compra d
    JOIN compra c ON c.id = d.compra_id
    WHERE date_trunc('month', c.fecha) = date_trunc('month', CURRENT_DATE)) AS compras,
  (SELECT COALESCE(SUM(monto), 0) FROM gasto
    WHERE date_trunc('month', fecha) = date_trunc('month', CURRENT_DATE)) AS gastos;

-- Ingresos por mes
SELECT to_char(fecha, 'YYYY-MM') AS mes, SUM(valor_pagado) AS ingresos, COUNT(*) AS citas
FROM cita WHERE estado = 'ATENDIDA'
GROUP BY 1 ORDER BY 1;

-- Cuanto aporta cada clienta
SELECT c.nombre, COUNT(*) AS citas, SUM(ci.valor_pagado) AS pagado
FROM cita ci JOIN cliente c ON c.id = ci.cliente_id
WHERE ci.estado = 'ATENDIDA'
GROUP BY c.nombre ORDER BY pagado DESC;

-- ---------------------------------------------------------------------
-- F. VER LA ESTRUCTURA (columnas de cada tabla)
-- ---------------------------------------------------------------------
SELECT table_name, ordinal_position AS n, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name <> 'flyway_schema_history'
ORDER BY table_name, ordinal_position;
