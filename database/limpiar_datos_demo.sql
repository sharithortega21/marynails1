-- =====================================================================
-- Mary Nails · Borrar los datos de demostracion antes del uso real
-- =====================================================================
-- CUANDO: una sola vez, al pasar a produccion (ver docs/PASO_A_PRODUCCION.md).
-- ANTES:  en Render, poner DEMO_DATOS=false y redesplegar. Si no, al reiniciar
--         el servidor vuelve a crear las clientas y citas de ejemplo.
-- DONDE:  Supabase > SQL Editor (o pgAdmin conectado a Supabase).
--
-- Borra: clientas, citas, gastos, compras y movimientos de ejemplo.
-- Deja:  usuarios, servicios y precios, catalogo (productos y 510 colores),
--        recetas, duraciones, habituales, criticos y barrios.
-- =====================================================================
BEGIN;

DELETE FROM movimiento;
DELETE FROM detalle_compra;
DELETE FROM compra;
DELETE FROM gasto;
DELETE FROM cita;
DELETE FROM cliente;

-- El inventario arranca en cero: Mary o Sharith cargan lo que tienen de verdad
UPDATE producto SET stock_actual = 0, por_comprar = 0, en_uso_desde = NULL;

-- Revision: todo debe salir en 0
SELECT (SELECT count(*) FROM cliente) AS clientas, (SELECT count(*) FROM cita) AS citas,
       (SELECT count(*) FROM gasto) AS gastos, (SELECT count(*) FROM compra) AS compras;

COMMIT;
