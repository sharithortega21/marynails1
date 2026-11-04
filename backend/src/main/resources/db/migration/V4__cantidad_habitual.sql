-- V4: cantidad que Mary quiere tener de cada producto habitual (sin limite; la define ella).
ALTER TABLE producto
    ADD COLUMN cantidad_habitual NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (cantidad_habitual >= 0);

-- Los habituales que ya existian quieren al menos 1 (igual que antes: entran a compras cuando hay 0).
UPDATE producto SET cantidad_habitual = 1 WHERE es_habitual = TRUE;
