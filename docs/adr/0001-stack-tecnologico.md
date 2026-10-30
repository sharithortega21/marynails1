# ADR 0001: Stack tecnológico

Fecha: 30-oct-2026. Estado: aceptada.

## Decisión
- Frontend: React con Vite en JavaScript, publicado en Cloudflare Pages.
- Backend: Spring Boot 4.1 (Java 21, LTS) con Hibernate/JPA, API REST documentada con OpenAPI (springdoc).
- Base de datos: PostgreSQL en Supabase, con migraciones Flyway.
- Seguridad: Spring Security, claves con BCrypt, sesión con token JWT (HS256), HTTPS.
- Despliegue del backend: Render (Docker, plan gratis).
- Integración continua: GitHub Actions.

## Alternativas descartadas
- Django (stack anterior de la documentación): se cambió porque la materia de plataformas y la autora trabajan con Java y Spring Boot.
- GraphQL: no aporta para un sistema con pocos clientes y consultas simples; REST es suficiente.
- TypeScript: se mantiene JavaScript por el tiempo disponible y la experiencia de la autora.
- Mensajería (capa 5): no aplica. WhatsApp se usa con enlace `wa.me`; las alertas se calculan al abrir el panel.

## Consecuencias
El plan gratis de Render duerme el servicio tras 15 minutos sin uso y tiene 512 MB; el primer acceso puede tardar. La memoria del JVM se limita en el Dockerfile.
