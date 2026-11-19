-- V14: datos de salud o alergias de la clienta (dato sensible, Ley 1581 de 2012: solo con su autorizacion)
-- y un recordatorio opcional ligado a la clienta (fecha + texto).
ALTER TABLE cliente ADD COLUMN salud VARCHAR(300);
ALTER TABLE cliente ADD COLUMN autoriza_salud BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE cliente ADD COLUMN recordatorio_fecha DATE;
ALTER TABLE cliente ADD COLUMN recordatorio_texto VARCHAR(200);
ALTER TABLE cliente ADD CONSTRAINT ck_salud_autorizada CHECK (salud IS NULL OR autoriza_salud);
