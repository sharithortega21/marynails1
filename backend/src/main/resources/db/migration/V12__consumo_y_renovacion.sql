-- V12: gasto de insumos por promedio.
-- Por arreglos: cada cita atendida deja movimientos SALIDA ligados a la cita (para poder devolverlos si se corrige).
-- Por tiempo: fecha desde la que se usa la unidad actual; al cumplir los dias de rendimiento toca renovarla.
ALTER TABLE movimiento ADD COLUMN cita_id BIGINT REFERENCES cita(id) ON DELETE SET NULL;
CREATE INDEX ix_movimiento_cita ON movimiento (cita_id);
ALTER TABLE producto ADD COLUMN en_uso_desde DATE;
