# Mary Nails

Sistema web para el control de las citas, el inventario, las compras y las finanzas de los servicios de manicura y pedicura de Mary Nails.

Autora: Sharith Stefany Ortega Robles. Universidad de Pamplona. Ingeniería de Software 2 y Desarrollo Orientado a Plataformas.

## Estructura
- `backend/`  API REST (Spring Boot, Java 21, JPA/Hibernate, Flyway)
- `frontend/` Aplicación web (React con Vite, JavaScript)
- `docs/`     Documentación, modelo de datos y decisiones (`docs/adr/`)
- `.github/workflows/` Integración continua

## Lo que ya funciona (prototipo)
Inicio de sesión, catálogo con 589 productos y 541 colores (Masglo, Gel Evolution y Gelpolish) con filtros, marcar "lo tengo" y "habitual", y lista de compras con envío por WhatsApp.

## Base de datos
PostgreSQL en Supabase. El esquema y los datos iniciales están en `backend/src/main/resources/db/migration`; Flyway los aplica al iniciar el backend.

## Ejecutar en tu computador
1. Crea un proyecto en Supabase y copia los datos de conexión (Project Settings > Database).
2. Backend: define estas variables de entorno (en IntelliJ: Run > Edit Configurations > Environment variables):
   `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` (mínimo 32 caracteres), `ADMIN_CORREO`, `ADMIN_CLAVE`, `MARY_CORREO`, `MARY_CLAVE`.
   Ejecuta la clase `MaryNailsApplication`. La API queda en http://localhost:8080 y su documentación en http://localhost:8080/swagger-ui.html
3. Frontend: en la carpeta `frontend` ejecuta `npm install` y luego `npm run dev`. Abre http://localhost:5173

Nunca subas claves a GitHub: el repositorio es público. Usa variables de entorno (ver `.env.example`).

## Cómo trabajar
Cada requisito (RF-xx) es un issue. Se trabaja en ramas y se une a `main` con pull request.
Prototipo en línea.
