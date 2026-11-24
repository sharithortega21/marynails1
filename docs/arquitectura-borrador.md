#  Mary Nails

24 de noviembre de 2026

## Taller aplicativo 1: Fundamentos de arquitectura

### 1. Descripción general sin nombres de tecnologías

Mary Nails es una aplicación web organizada en tres partes: una interfaz para que la usuaria gestione el negocio, una aplicación central que valida las reglas y expone operaciones remotas, y un almacenamiento persistente para citas, clientas, servicios, productos y finanzas.

### 2. Decisiones arquitectónicas tomadas

| Decisión,  Alternativa descartada, Razón y costo aceptado |

| Separar la interfaz web y el servidor en dos proyectos, tiene una Aplicación monolítica que genera las páginas en el servidor
Alternativa descartada: se descartó una página tradicional para obtener una navegación interactiva sin recargas completas.
Razón y costo aceptado: El costo es manejar un contrato REST, CORS y estados separados de frontend y backend.|

| Construir una API única para las operaciones del negocio
Alternativa descartada: Consultas directas desde el frontend a la base de datos, La API mantiene la autenticación y las reglas de negocio fuera de la interfaz. 
Razón y costo aceptadoSe acepta un nivel adicional de comunicación HTTP y diseño de endpoints. |

| Usar un monolito modular con módulos por dominio 
Alternativa descartada: Microservicios independientes, Es apropiado para un equipo pequeño y permite operar un solo backend con una sola base de datos. 
Razón y costo aceptado: El costo es que todos los módulos comparten proceso y recursos de despliegue. |

| Organizar el backend en controladores, servicios y repositories 
Alternativa descartada: Lógica concentrada en los controladores o acceso directo desde toda la aplicación, Las responsabilidades quedan separadas y se pueden probar las reglas de negocio. 
Razón y costo aceptadoSe aceptan más clases y pasos para cada operación. |

| Usar PostgreSQL con migraciones versionadas 
Alternativa descartada: Base de datos embebida o administración manual del esquema. PostgreSQL ofrece integridad y consultas relacionales apropiadas para citas y movimientos.  
Razón y costo aceptado: Flyway hace reproducible el esquema, pero exige mantener correctamente el orden de las migraciones. |

### 3. Decisión más costosa de cambiar

La decisión más costosa de cambiar sería transformar el monolito con una única base de datos en microservicios independientes.

Esto afectaría la definición de módulos, los repositorios, las transacciones, la comunicación entre servicios, la configuración de despliegue y posiblemente la forma de almacenar datos. Además, rompería los límites actuales de la base compartida y exigiría definir consistencia, reintentos, observabilidad y autenticación entre servicios. Sin una necesidad clara de escala diferenciada o equipos independientes, el costo supera el beneficio actual.

---

## Taller aplicativo 2: Plataformas

### 1. Plataformas utilizadas

#### Plataforma de ejecución

- Navegador web para ejecutar la interfaz de React.
- Máquina virtual de Java 21 para ejecutar Spring Boot.
- Linux administrado por la plataforma de despliegue del backend.
- PostgreSQL para almacenar y consultar datos.

#### Plataforma de desarrollo

- Java y Maven para compilar y ejecutar el backend.
- JavaScript, React y Vite para desarrollar y construir el frontend.
- JPA/Hibernate para traducir entidades a operaciones de persistencia.
- Flyway para versionar el esquema de la base de datos.
- Git y GitHub Actions para control de versiones e integración continua.

#### Plataforma de infraestructura

- Cloudflare Pages para publicar el frontend.
- Render mediante Docker para ejecutar el backend.
- Supabase para PostgreSQL y variables de conexión.
- HTTPS y variables de entorno para seguridad y configuración.

#### Plataforma de ecosistema

Actualmente Mary Nails no ofrece una plataforma pública para terceros. Sí puede aprovechar integraciones externas como enlaces a WhatsApp, herramientas de despliegue y proveedores cloud. El proyecto puede evolucionar hacia un ecosistema mediante una API documentada.

### 2. Aplicación o plataforma

Mary Nails es actualmente una aplicación, porque ofrece funciones terminadas a usuarios que administran el negocio: citas, clientas, servicios, inventario y finanzas.
Podría evolucionar hacia una plataforma si un catálogo y un conjunto de operaciones
estándar fueran reutilizados por varias peluquerías o integradores. En ese escenario se necesitarían separación de datos por negocio, API estable, versionado, roles, límites de uso y observabilidad.

La diferencia principal sería la intención: pasar de atender a una sola operación a ofrecer capacidades reutilizables a terceros.

### 3. Terceros y capacidades ofrecidas

| Tercero | Capacidad ofrecida |

| Sistemas de mensajería | Consultar próximas citas y compartir enlaces o recordatorios |
| Aplicaciones contables | Consultar ingresos, compras y gastos mediante una API |
| Clientes o aplicaciones móviles | Consultar disponibilidad y servicios públicos |

Estas integraciones reducirían trabajo manual y permitirían construir aplicaciones nuevas sobre el núcleo de Mary Nails.

### 4. Propuesta de tres endpoints públicos

Los siguientes endpoints son una propuesta para una etapa posterior con una API pública; no forman parte de la exposición de endpoints privados del prototipo actual.

#### `GET /api/publicos/servicios`

Devuelve los servicios disponibles y sus datos públicos.

Ejemplo de respuesta:

```json
[
  {
    "id": 3,
    "nombre": "Semipermanente",
    "precio": 45000,
    "duracionMin": 90
  }
]
```

#### `GET /api/publicos/servicios/{id}/disponibilidad`

Consulta los horarios disponibles de un servicio en una fecha determinada.

Parámetros propuestos:

- `fecha`: fecha que se desea consultar.

#### `POST /api/publicos/citas`

Permite crear una cita desde un canal externo después de validar disponibilidad y datos.

Ejemplo de solicitud:

```json
{
  "cliente": "Nombre",
  "correo": "cliente@ejemplo.com",
  "telefono": "3000000000",
  "servicioId": 3,
  "fecha": "2026-12-01",
  "hora": "14:00"
}
```

Este diseño exigiría autenticación o una clave de integrador, límites de solicitudes,
protección contra doble reserva y confirmación de que el canal externo no pueda modificar datos internos o citar a otro negocio sin permiso.

---

## Taller aplicativo 3: Atributos de calidad

### 1. Atributos seleccionados

#### Seguridad

Mary Nails administra información de clientas, citas, usuarios y movimientos financieros.
Por esta razón, la seguridad es crítica: el sistema debe impedir el acceso sin autenticación,
proteger las contraseñas y controlar las operaciones que realiza cada usuario.

Actualmente se utilizan autenticación con usuario y contraseña, contraseñas cifradas con
BCrypt y tokens JWT para las solicitudes posteriores al inicio de sesión.

#### Disponibilidad

La agenda debe poder consultarse durante el horario de atención, especialmente al recibir
clientas o gestionar una cita. Una caída prolongada impediría trabajar y podría producir
pérdida de turnos o sobrecitas.

Se prioriza mantener el backend disponible y mostrar mensajes claros cuando exista un fallo
de conexión. La base de datos debe contener la información persistida para recuperarla después
de reiniciar la aplicación.

#### Rendimiento

Las usuarias deben encontrar rápidamente servicios, clientas, citas y productos. Las consultas
deben responder con una espera razonable, tanto en el equipo local como en el despliegue
en la nube.

Se priorizan consultas y paginación para evitar cargar todos los registros innecesariamente,
especialmente en el catálogo de productos y en la agenda.

### 2. Escenarios medibles

| Atributo | Estímulo | Entorno | Respuesta | Medida |

| Seguridad | 
Estímulo: Un usuario sin inicio válido intenta consultar `/api/citas` o modificar un registro
Entorno: Operación normal, desde la red con un navegador o cliente HTTP 
Respuesta: El sistema rechaza la solicitud, no modifica datos y indica el estado de autorización correspondiente 
Medida: El 100 % de solicitudes no autenticadas debe recibir `401 Unauthorized`; ninguna debe cambiar datos 

| Disponibilidad | 
Estímulo: La usuaria abre la aplicación y consulta las citas del día durante el horario laboral 
Entorno: Backend activo, PostgreSQL disponible y conexión normal 
Respuesta: El sistema carga el inicio de sesión o agenda y permite consultar los datos 
Medida: El 99 % de las solicitudes durante una jornada debe completarse; recuperación prevista en menos de 5 minutos 

| Rendimiento | 
Estímulo: Una usuaria busca 510 productos aplicando filtros de categoría, línea y disponibilidad
Entorno: Uso normal con hasta 20 usuarios concurrentes y conexión estable 
Respuesta:El frontend recibe una página filtrada y actualiza el catálogo sin recargar la aplicación completa 
Medida:El 95 % de las búsquedas debe responder en menos de 2 segundos y el 100 % sin errores internos 

### 3. Atributo dispuesto a sacrificar

Se está dispuesto a sacrificar inicialmente la máxima escalabilidad horizontal.

El proyecto tiene pocos usuarios concurrentes y funciona como un monolito modular desplegado
como una sola unidad. Implementar balanceadores de carga, varias instancias, réplicas de base
de datos y particionamiento distribuiría recursos innecesariamente en esta etapa.

Se acepta temporalmente que el sistema no esté preparado para crecer inmediatamente a cientos
o miles de usuarios simultáneos. Esta decisión permitirá mantener el desarrollo sencillo y
priorizar seguridad, disponibilidad y rendimiento para la operación actual.
