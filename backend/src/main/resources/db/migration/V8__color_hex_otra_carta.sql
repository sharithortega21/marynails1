-- V8: tonos tomados del mismo color en la otra carta Masglo (Tradicional/Evolution), donde el tono coincide.
UPDATE color c SET hex = v.hex FROM (VALUES
 ('Masglo','Visos Plata','#e6f0f5'),
 ('Masglo','Visos Rosa','#ffe6ee')
) AS v(linea, codigo, hex) WHERE c.linea = v.linea AND c.codigo = v.codigo AND c.hex IS NULL;
