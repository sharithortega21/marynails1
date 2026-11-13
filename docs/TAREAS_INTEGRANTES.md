# Tareas de documentación por integrante

Cada integrante hace su tarea en su propio computador y con su propia cuenta de GitHub, y la sube con un commit
y un Pull Request hacia la rama `prototipo`. El contenido es lo que cada uno vio al probar la aplicación.

| Tarea | Archivo que se completa | Qué se hace |
|---|---|---|
| Manual de usuario (Inicio, Agenda y Clientas) | `docs/manual-de-usuario.md` | Probar las tres pantallas y explicar con sus palabras cómo se usan |
| Plan de pruebas manuales (Catálogo, Compras y Finanzas) | `docs/plan-de-pruebas-manuales.md` | Hacer cada caso de prueba y anotar el resultado real |

## Pasos para subir (cada integrante)
1. Actualizar el repositorio: `git fetch origin` y `git checkout prototipo && git pull origin prototipo`
2. Crear su rama: `git checkout -b docs/<nombre-de-la-tarea>`
3. Agregar el archivo completo en `docs/`, y luego `git add`, `git commit -m "docs: ..."`
4. Subir: `git push origin docs/<nombre-de-la-tarea>`
5. En GitHub, abrir el Pull Request hacia `prototipo` y describir qué hizo.

No se escriben claves ni contraseñas en ningún archivo.
