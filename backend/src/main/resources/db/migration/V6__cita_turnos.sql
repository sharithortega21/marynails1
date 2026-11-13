-- V6: una cita puede ser de una persona, una familia o una direccion: se anota cuantos turnos se hicieron.
ALTER TABLE cita ADD COLUMN turnos SMALLINT NOT NULL DEFAULT 1 CHECK (turnos >= 1);

-- Correccion de V1: 'TRANSFERENCIA' (13 letras) no cabia en VARCHAR(10).
ALTER TABLE cita ALTER COLUMN medio_pago TYPE VARCHAR(15);
