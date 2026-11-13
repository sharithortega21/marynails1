-- V7: tonos para colores cuyo nombre en el catalogo HTML tenia una errata evidente (ej. "Glamurosa" = Glamorosa).
UPDATE color c SET hex = v.hex
FROM (VALUES
 ('Masglo','Benevolente','#8f8f99'),
 ('Masglo','Campeona','#c74b5c'),
 ('Masglo','Glamorosa','#6b8075'),
 ('Masglo','Intimidante','#5c3e4c'),
 ('Masglo','Intrigante','#8f7a6b'),
 ('Masglo','Metódica','#a38fa8'),
 ('Masglo','Nativa','#c2c2c7'),
 ('Masglo','Negro (decoración)','#121214'),
 ('Masglo','Tiza (decoración)','#fafafa'),
 ('Gel Evolution','Glamorosa','#6b8075'),
 ('Gel Evolution','Tiza','#ffffff'),
 ('Gel Evolution','Trascendental','#7a6ba8')
) AS v(linea, codigo, hex)
WHERE c.linea = v.linea AND c.codigo = v.codigo AND c.hex IS NULL;
