# Entrega: Backend con Spring Boot (CRUD de Servicio)

Proyecto: **Mary Nails**. Entidad principal del CRUD: **Servicio** (nombre, precio, familia, duración).
Base de datos: **PostgreSQL** (la guía usa MySQL como ejemplo; usamos PostgreSQL porque es la que tiene el proyecto).

## Lista de entrega de la guía y dónde está cada punto

| Punto de la guía | Dónde está |
|---|---|
| El proyecto está en `backend/` y el `pom.xml` queda en `backend/pom.xml` | `backend/pom.xml` |
| La entidad tiene `model`, `repository`, `service` y `controller` | `backend/src/main/java/com/marynails/` (carpetas con esos nombres) |
| El CRUD funciona: crear, listar, consultar por id, actualizar, eliminar | `controller/ServicioController.java` · resultados en `docs/PRUEBAS_API.md` |
| Al menos dos validaciones que responden 400 con mensaje claro | `model/Servicio.java` (`@NotBlank`, `@Positive`, `@Pattern`) y `exception/ManejadorErrores.java` |
| Conexión a la BD con la contraseña fuera del repositorio | `application.properties` lee `DB_PASSWORD` de una variable de entorno; ejemplo en `.env.example` |
| Una página del frontend muestra datos reales con `fetch` | `frontend/src/components/Servicios.jsx` y `frontend/src/api.js` |
| Cada integrante tiene al menos un commit y un Pull Request | Ver `docs/TAREAS_INTEGRANTES.md` |
| Las capturas de Postman están en `docs/` | `docs/postman/` (colección) y `docs/capturas/` |

## Los endpoints (API de servicios)

| Verbo | Dirección | Qué hace | Respuesta |
|---|---|---|---|
| GET | `/api/servicios` | Lista todos | 200 |
| GET | `/api/servicios/{id}` | Uno por id | 200 / 404 |
| GET | `/api/servicios/buscar?nombre=spa` | Busca por nombre | 200 |
| POST | `/api/servicios` | Crea uno | 201 / 400 |
| PUT | `/api/servicios/{id}` | Actualiza | 200 / 400 / 404 |
| DELETE | `/api/servicios/{id}` | Elimina | 204 / 400 / 404 |

Todas piden iniciar sesión (token JWT): sin token responden **401**.

## Validaciones y reglas del negocio

| Regla | Dónde | Respuesta |
|---|---|---|
| Nombre obligatorio | `@NotBlank` en `Servicio.java` | 400 con el campo y el mensaje |
| Precio mayor que cero | `@Positive` | 400 |
| Duración mayor que cero | `@Positive` | 400 |
| Familia solo una de 5 permitidas | `@Pattern` | 400 |
| No repetir nombre de servicio | `ServicioService.crear` y `actualizar` | 400 `{"error": "..."}` |
| No borrar un servicio que ya tiene citas | `ServicioService.eliminar` | 400 `{"error": "..."}` |

## Cómo viaja una petición (ejemplo: crear un servicio)

1. En la pantalla **Servicios**, la usuaria llena el formulario y pulsa *Agregar servicio*.
2. `Servicios.jsx` llama a `api.crearServicio(...)`, que hace `fetch` con `POST /api/servicios`.
3. Spring busca el método con `@PostMapping` en `ServicioController` y convierte el JSON en un objeto `Servicio` (`@RequestBody`).
4. `@Valid` revisa las validaciones. Si algo está mal, `ManejadorErrores` responde **400**.
5. `ServicioController` llama a `ServicioService.crear`, que revisa que el nombre no esté repetido.
6. `ServicioRepository.save` hace el `INSERT` en PostgreSQL y la base asigna el id.
7. El controller responde **201** con el servicio creado, y la pantalla recarga la lista.

## Qué cambió respecto al programa anterior

- Antes `Servicio` solo se podía consultar (estaba dentro del módulo de agenda). Ahora tiene su propio CRUD completo con las 4 capas.
- Se agregó la pantalla **Servicios** al menú del frontend.
- `api.js` ahora entiende los mensajes de error del backend (validaciones y reglas del negocio).
- El resto del programa (agenda, clientas, catálogo, compras y finanzas) sigue funcionando igual.

## Cómo ejecutarlo

**Requisitos:** JDK 21, Node 20 o superior, PostgreSQL.

1. Crear una base vacía en PostgreSQL (por ejemplo `marynails`).
2. Variables de entorno del backend (ver `.env.example`): `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `ADMIN_CORREO`, `ADMIN_CLAVE`, `MARY_CORREO`, `MARY_CLAVE`.
3. Backend (desde `backend/`): `mvn spring-boot:run`. Queda en http://localhost:8080. Flyway crea las tablas solo.
4. Frontend (desde `frontend/`): `npm install` y luego `npm run dev`. Queda en http://localhost:5173.
5. Probar la API: importar `docs/postman/MaryNails_Servicios.postman_collection.json` en Postman, poner el correo y la clave en la petición 0 y ejecutar en orden.

## CORS

La guía crea una clase `CorsConfig`. En este proyecto el permiso CORS está en `config/SecurityConfig.java`
(bean `corsConfigurationSource`), porque con Spring Security el permiso debe declararse ahí para que funcione. El origen permitido sale de la variable `FRONTEND_URL`.
