-- Tecnicas de servicio abiertas (25-nov-2026): Mary puede agregar tecnicas nuevas (por ejemplo, "Acrilico")
-- ademas de las cinco de siempre. Antes un CHECK solo dejaba esas cinco.
ALTER TABLE servicio DROP CONSTRAINT IF EXISTS servicio_familia_check;
ALTER TABLE servicio ALTER COLUMN familia TYPE VARCHAR(40);
ALTER TABLE servicio ADD CONSTRAINT servicio_familia_no_vacia CHECK (length(trim(familia)) > 0);
