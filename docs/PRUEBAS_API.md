# Pruebas del CRUD de Servicios

Pruebas hechas contra el backend corriendo en local (PostgreSQL 16), con un usuario autenticado.
Se pueden repetir con la colección `docs/postman/MaryNails_Servicios.postman_collection.json`.

| N.º | Petición | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| 1 | `POST /api/servicios` con `{"nombre":"Manos spa","precio":45000,"familia":"TRADICIONAL","duracionMin":60}` | 201 y el servicio con su id | **201** `{"duracionMin":60,"familia":"TRADICIONAL","id":9,"nombre":"Manos spa","precio":45000}` |
| 2 | `GET /api/servicios` | 200 y la lista | **200** (lista con los servicios) |
| 3 | `GET /api/servicios/9` | 200 y solo ese servicio | **200** |
| 4 | `PUT /api/servicios/9` con precio 50000 | 200 y precio actualizado | **200** `"precio":50000` |
| 5 | `GET /api/servicios/buscar?nombre=SPA` | 200 y los que contienen «spa» | **200** (1 resultado) |
| 6 | `POST` con `{"nombre":"","precio":-5,"familia":"X","duracionMin":0}` | 400 con el detalle de cada campo | **400** `{"precio":"El precio debe ser mayor que cero","duracionMin":"La duración debe ser mayor que cero","nombre":"El nombre es obligatorio","familia":"La familia debe ser TRADICIONAL, SEMIPERMANENTE, MIXTO, SOFT_GEL o RESINA"}` |
| 7 | `POST` con un nombre que ya existe («manos SPA») | 400 | **400** `{"error":"Ya existe un servicio con ese nombre"}` |
| 8 | `DELETE` de un servicio que tiene citas | 400 | **400** `{"error":"No se puede eliminar: hay citas que usan este servicio"}` |
| 9 | `DELETE /api/servicios/9` | 204 sin contenido | **204** |
| 10 | `GET /api/servicios/9` (ya borrado) | 404 | **404** |
| 11 | `GET /api/servicios` sin token | 401 | **401** |
| 12 | La agenda sigue funcionando (`GET /api/citas?...`) | 200 | **200** |

## Pruebas en la pantalla (frontend)

| Captura | Qué muestra |
|---|---|
| `capturas/01_servicios_lista.png` | Lista de servicios traída de la API con `fetch` |
| `capturas/02_validacion.png` | Formulario vacío: la API responde 400 y la pantalla muestra el mensaje |
| `capturas/03_creado.png` | Servicio creado (POST 201) |
| `capturas/04_editado.png` | Servicio actualizado (PUT 200) |
| `capturas/05_busqueda.png` | Búsqueda por nombre |
| `capturas/06_confirmar.png` | Confirmación antes de borrar |
| `capturas/07_error_con_citas.png` | Intento de borrar un servicio con citas (400 con mensaje) |

## Capturas de Postman

Las capturas de Postman las toma cada integrante en su computador siguiendo `docs/GUIA_ENTREGA_SPRING_BOOT.md`
(importar la colección y ejecutar las 11 peticiones en orden) y las guarda en `docs/capturas/postman/`.
