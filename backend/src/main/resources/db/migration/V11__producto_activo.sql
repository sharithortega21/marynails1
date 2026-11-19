-- V11: permite ocultar productos que ya no se usan sin borrarlos (conservan compras y movimientos).
ALTER TABLE producto ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE;
