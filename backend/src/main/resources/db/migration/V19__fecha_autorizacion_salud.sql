-- Ley 1581 de 2012: guardar cuando la clienta autorizo el tratamiento de sus datos de salud (25-nov-2026).
ALTER TABLE cliente ADD COLUMN autoriza_salud_fecha DATE;
-- Las autorizaciones que ya existen quedan con la fecha de hoy (no se conoce la original).
UPDATE cliente SET autoriza_salud_fecha = CURRENT_DATE WHERE autoriza_salud;
