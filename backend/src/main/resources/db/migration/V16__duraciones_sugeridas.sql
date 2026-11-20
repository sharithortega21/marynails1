-- Duraciones de partida para 5 productos que estaban en "Fijo" (20-nov-2026).
-- Son estimados de referencia: Mary los cambia en el catalogo (Editar > ¿Cómo se gasta?).
-- Fuentes: gel de construccion 15 ml ~20 sets completos (Insight Cosmetics, tabla de rendimientos);
-- polvo de resina/acrilico ~20 a 30 sets por frasco (Rossi Nails); pega de tubo pequeño ~3 a 4
-- aplicaciones completas (Glamnetic). Efecto espejo y piedritas: por tiempo, como los stickers (bloque 8).
UPDATE producto SET modo_control = 'CONSUMO', rendimiento = 20 WHERE nombre = 'Gel de construcción';
UPDATE producto SET modo_control = 'CONSUMO', rendimiento = 25 WHERE nombre = 'Resina (polvo y líquido)';
UPDATE producto SET modo_control = 'CONSUMO', rendimiento = 4  WHERE nombre = 'Pega (adhesivo)';
UPDATE producto SET modo_control = 'TIEMPO',  rendimiento = 90 WHERE nombre = 'Efecto espejo (polvos, 8 a 10 tonos)';
UPDATE producto SET modo_control = 'TIEMPO',  rendimiento = 60 WHERE nombre = 'Piedritas (números 0, 1, 2 y 3)';
