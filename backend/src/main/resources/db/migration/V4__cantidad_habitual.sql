-- V4: (1) cantidad que Mary quiere tener de cada habitual; (2) cantidad que pidio comprar de cualquier producto.
ALTER TABLE producto
    ADD COLUMN cantidad_habitual NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (cantidad_habitual >= 0),
    ADD COLUMN por_comprar       NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (por_comprar >= 0);  -- lo que Mary pidio comprar a mano

-- Los habituales que ya existian quieren al menos 1 (igual que antes: entran a compras cuando hay 0).
UPDATE producto SET cantidad_habitual = 1 WHERE es_habitual = TRUE;
