# Paso a producción (uso real con Mary)

> Para la feria **no** hace falta: se usa el modo demostración (`DEMO_DATOS=true`) y el botón **Reiniciar demostración** de Inicio. Ver `docs/GUION_FERIA.md`.

Lista para dejar el sistema listo con datos reales. Se hace una sola vez y en este orden.

## 1. Unir los cambios a `main`
En GitHub, unir los Pull Requests en orden: primero el #6 (pie de página) y luego el #7. Después, el de cada rama siguiente:
recetas-completas → roles → salud-recordatorios → compra-respaldo → prediccion-consumo → limpieza → pruebas → fotos-y-salud → capa-servicios → reglas-agenda.
Cada PR debe tener el CI en verde: compila y corre las pruebas automáticas. Render y Cloudflare publican solos al unir.

## 2. Apagar la demostración (Render)
En Render → servicio `marynails-api` → **Environment**:
- `DEMO_DATOS` = `false`. **Hacerlo antes del paso 4**: si queda en `true`, al reiniciar vuelven las clientas de ejemplo.
- `SWAGGER`: dejar sin poner (apagado). Solo `true` si hay que mostrar la documentación de la API.
- `JWT_SECRET` = una frase nueva, larga y aleatoria (más de 40 caracteres).
- Guardar y esperar el redespliegue.

## 3. Cambiar la clave de la base de datos (Supabase)
Supabase → **Project Settings → Database → Reset database password**. Copiar la nueva y ponerla en Render como `DB_PASSWORD`.

## 4. Borrar los datos de ejemplo
Supabase → **SQL Editor** → pegar y ejecutar `database/limpiar_datos_demo.sql`.
La última consulta debe mostrar 0 clientas, 0 citas, 0 gastos y 0 compras. Se conservan usuarios, servicios, catálogo, recetas, duraciones y barrios.

## 5. Claves nuevas para Mary y Sharith
Cada una entra al sistema y toca el ícono de **llave** (arriba a la derecha, junto a su nombre). Pide la clave actual y una nueva de al menos 10 caracteres.

## 6. Cargar los datos reales
Llenar `docs/Plantilla_datos_reales_MaryNails.xlsx` (celdas amarillas):
- **Clientas**: nombre, teléfono, dirección, barrio, frecuencia; salud solo con autorización.
- **Productos**: cuántos hay, cómo se gasta (fijo, por clientas o por tiempo), cuánto dura, mínimo y crítico.
- **Colores**: cuántos frascos de cada color tiene Mary.

Se le entrega a Claude, que genera el SQL de carga y lo revisa antes de ejecutarlo.

## 7. Fotos de los productos
Poner las imágenes de Gemini en `frontend/public/productos/` con el nombre exacto de la lista (ver `LEEME.txt` de esa carpeta). Cada producto ya apunta a su archivo.

## 8. Revisión final con Mary
- [ ] Mary entra desde su celular y agenda una cita real.
- [ ] Marca una cita como atendida: el stock de la base y del top coat baja.
- [ ] Sharith entra: no ve clientas ni finanzas, y en la agenda no ve teléfonos ni valores.
- [ ] La lista de compras se envía por WhatsApp.
- [ ] «¿Cuándo se acaba?» muestra fechas que tienen sentido para Mary.

## 9. En el PC de Sharith
Devolver `pg_hba.conf` de PostgreSQL local a `scram-sha-256` (solo afecta la base de pruebas del computador).
