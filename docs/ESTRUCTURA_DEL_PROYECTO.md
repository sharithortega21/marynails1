# Estructura del proyecto Mary Nails

Este documento explica **para qué sirve cada carpeta** y cómo se conectan las partes.

## Vista general

```
marynails-dop/
├── backend/        La API (Java + Spring Boot). Aquí vive la lógica y el acceso a la base de datos
├── frontend/       Lo que ve la usuaria (React). Pide los datos a la API
├── database/       Scripts de la base de datos (PostgreSQL) para crearla, llenarla y consultarla
├── docs/           Documentación, pruebas y evidencias
├── .github/        Automatizaciones de GitHub (revisión automática del código)
├── .env.example    Ejemplo de las variables de entorno (sin claves reales)
└── README.md       Presentación del proyecto y cómo ejecutarlo
```

## Cómo se conectan

```
Navegador (React)  --fetch-->  API REST (Spring Boot)  --JPA-->  PostgreSQL
   frontend/                       backend/                      database/
```

El frontend **nunca** habla directo con la base de datos: siempre le pide al backend.
Es como el restaurante de la guía: el cliente (frontend) le pide al mesero (controller),
el mesero le pasa el pedido al cocinero (service) y este va a la despensa (repository / base de datos).

## backend/

```
backend/
├── pom.xml                          Lista de dependencias del proyecto (Maven)
└── src/main/
    ├── resources/
    │   ├── application.properties   Configuración: conexión a la BD, seguridad, puerto
    │   └── db/migration/            Scripts SQL V1..V10 que crean y llenan la base (Flyway)
    └── java/com/marynails/
        ├── MaryNailsApplication.java   Punto de arranque (método main)
        ├── model/        ENTIDADES: cada clase es una tabla      -> Servicio.java
        ├── repository/   ACCESO A LA BD: consultas sin escribir SQL -> ServicioRepository.java
        ├── service/      LÓGICA DEL NEGOCIO (reglas)             -> ServicioService.java
        ├── controller/   ENDPOINTS REST (puerta de entrada)      -> ServicioController.java
        ├── exception/    Manejo de errores (respuestas 400 claras) -> ManejadorErrores.java
        ├── config/       Seguridad (JWT) y permisos CORS         -> SecurityConfig.java
        ├── auth/         Inicio de sesión y usuarios
        ├── agenda/       Citas, clientas y sectores
        ├── catalogo/     Productos, colores e inventario
        ├── compras/      Lista de compras
        ├── finanzas/     Compras a la distribuidora, gastos y resumen
        └── demo/         Datos de ejemplo para que la app no se vea vacía
```

### Las 4 capas (carpetas `model`, `repository`, `service`, `controller`)

| Carpeta | Qué hace | Ejemplo en el proyecto |
|---|---|---|
| `model` | Cada clase es una tabla. Cada atributo es una columna. Aquí van las validaciones (`@NotBlank`, `@Positive`) | `Servicio.java` |
| `repository` | Guarda y consulta en la base. Es una *interface*: Spring escribe el SQL por nosotros | `ServicioRepository.java` |
| `service` | Reglas del negocio: no repetir nombres, no borrar un servicio que ya tiene citas | `ServicioService.java` |
| `controller` | Recibe las peticiones HTTP (GET, POST, PUT, DELETE) y responde en JSON | `ServicioController.java` |

Las carpetas `agenda`, `catalogo`, `compras` y `finanzas` son los demás módulos del programa
(agrupados por tema). El CRUD de **Servicio** es el que sigue al pie de la letra la estructura de la guía.

### Por qué hay una carpeta `db/migration`

Son los scripts SQL que Flyway ejecuta **en orden** cada vez que arranca el backend:

| Script | Qué hace |
|---|---|
| `V1__esquema.sql` | Crea todas las tablas |
| `V2__datos_iniciales.sql` | Sectores, servicios y productos básicos |
| `V3__colores_masglo.sql` | Catálogo de colores |
| `V4__cantidad_habitual.sql` | Cantidad que se quiere tener de los productos habituales |
| `V5__color_hex.sql` | Tono (color real) de cada esmalte |
| `V6__cita_turnos.sql` | Turnos por cita (varias personas en una visita) |
| `V7`–`V10` | Correcciones del catálogo de colores |

Regla: un script ya aplicado **no se edita**; los cambios van en uno nuevo.

## frontend/

```
frontend/
├── package.json         Dependencias (React, Vite)
├── index.html           Página base
└── src/
    ├── main.jsx         Arranque de React
    ├── App.jsx          Menú de pestañas y control de la sesión
    ├── api.js           TODAS las llamadas al backend (fetch)
    ├── fechas.js        Ayudas para fechas y pesos
    ├── styles.css       Estilos
    └── components/      Una pantalla (o pieza) por archivo
        ├── Login.jsx            Inicio de sesión
        ├── Inicio.jsx           Citas de hoy y alertas
        ├── Agenda.jsx           Agenda semanal (+ NuevaCita.jsx)
        ├── Clientas.jsx         Clientas y recontacto
        ├── Servicios.jsx        CRUD de servicios (el de esta entrega)
        ├── Catalogo.jsx         Catálogo de colores (+ ProductoCard.jsx)
        ├── Compras.jsx          Lista de compras y registro de compras (+ ListaCompras.jsx)
        └── Finanzas.jsx         Ingresos, compras y gastos
```

## database/

| Archivo | Para qué sirve |
|---|---|
| `marynails_bd_clasica.sql` | Crea todas las tablas (`CREATE TABLE`) y las llena (`INSERT`). Para cargar en pgAdmin |
| `consultas_pgadmin.sql` | Consultas para ver y analizar los datos |
| `README.md` | Cómo cargarlos en pgAdmin |

## docs/

| Carpeta o archivo | Contenido |
|---|---|
| `ESTRUCTURA_DEL_PROYECTO.md` | Este documento |
| `GUIA_ENTREGA_SPRING_BOOT.md` | Qué pedía la guía y dónde está cada cosa |
| `PRUEBAS_API.md` | Resultados de las pruebas del CRUD |
| `postman/` | Colección de Postman lista para importar |
| `capturas/` | Capturas de la pantalla de Servicios funcionando |
| `TAREAS_INTEGRANTES.md` | Tareas pequeñas para cada integrante |
| `adr/` | Decisiones de arquitectura |
| `modelo-de-datos/` | Diagrama entidad-relación |
