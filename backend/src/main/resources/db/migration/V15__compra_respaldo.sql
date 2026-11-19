-- V15: compra de respaldo. Los productos estandar (limas, stickers, decorativos, consumibles) se reponen
-- cada mes y medio aunque no se hayan acabado (levantamiento, bloque 7).
ALTER TABLE producto ADD COLUMN respaldo BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE producto SET respaldo = TRUE
 WHERE categoria IN ('Herramientas', 'Decoración', 'Consumibles', 'Esmaltes decorativos')
   AND nombre NOT IN ('Imán para ojo de gato', 'Cortauñas', 'Cortacutícula');
