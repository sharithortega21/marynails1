# Base de datos (PostgreSQL)

| Archivo | Qué hace |
|---|---|
| `marynails_bd_clasica.sql` | Crea las 11 tablas y las llena con los datos de ejemplo (servicios, clientas, productos y colores, citas, gastos) |
| `consultas_pgadmin.sql` | Consultas para ver y analizar los datos (clientas, citas, inventario, compras y finanzas) |

## Cómo cargarla en pgAdmin

1. Crear una base nueva (clic derecho en *Databases* → *Create* → *Database*), por ejemplo `marynails`.
2. Clic derecho sobre la base → *Query Tool* → abrir `marynails_bd_clasica.sql` → pulsar **F5**.
3. Abrir `consultas_pgadmin.sql`, seleccionar **una** consulta y pulsar **F5**.

> La aplicación no necesita este script: al iniciar, el backend crea las tablas con los scripts de
> `backend/src/main/resources/db/migration` (Flyway). Estos archivos sirven para ver, estudiar y entregar la base de datos.

## Tablas

`sector`, `servicio`, `cliente`, `producto`, `color`, `receta`, `cita`, `compra`, `detalle_compra`, `movimiento`, `gasto` y `usuario`.
Diagrama entidad-relación: `docs/modelo-de-datos/`.
