# Guion para la feria (5 minutos)

## Antes de que llegue el público
1. Abrir la página unos 5 minutos antes: Render duerme y el primer ingreso tarda cerca de un minuto.
2. Entrar como **Mary**. La demostración se renueva sola cada día a las 4:00 a. m.: las citas ya quedan con fechas desde hoy.
3. Tener abierta en otra pestaña (o en el celular) la cuenta de **Sharith**.

## Recorrido

**1. El problema (20 s).** Mary atiende a domicilio. Antes manejaba todo de memoria, por WhatsApp y en una agenda de papel: le faltaban insumos en plena ruta y Sharith no sabía qué comprar.

**2. Inicio (40 s).** «Hola, Mary»: citas de hoy, lo que hay que comprar, ingresos del mes.
- **Pagos pendientes**: las clientas que dijeron «te pago al rato», con «Recordarle» por WhatsApp y «Ya pagó».
- Alertas: las **limas que toca renovar**, el **recordatorio de Camila** y una **clienta por recontactar** (Lorena).
- **Maletín para mañana**: solo avisa lo que puede fallar. El algodón **no hay** (rojo) y el top coat **alcanza para 3 clientas y mañana tiene 4** (amarillo), con «Agregar a la lista de compras». Si todo está bien, sale en verde «Tienes todo».

**3. Agenda (1 min).** La semana se ve como una agenda real: 41 clientas, los 2 días anteriores ya atendidos y 8 días hacia adelante con 4 a 6 personas por día.
- Cada día muestra **«4 de 6 personas»**. Pasado mañana está **lleno (6 de 6)**: intentar agendar otra cita → el sistema no deja.
- **Nueva cita** a las 7:00 p. m. → avisa que a esa hora Mary atiende en su casa.
- Cita de **Valentina**: alerta roja **«Salud: alergia al acrílico»** (guardada con su autorización, Ley 1581).
- **Atendida** → cobro con extra de diseño (botones de 5.000 / 10.000 o barra), medio de pago y **Pagó todo / Pagó una parte / Paga después**. Al guardar, **se descuentan los insumos** del servicio.
- La cita **cancelada** (en 3 días) → **Ofrecer el cupo**: sugiere clientas del mismo barrio a las que ya les toca, con el WhatsApp listo.
- Botones de **WhatsApp** y **Google Calendar**.

**4. Clientas (30 s).** Frecuencia de visita y recontacto; **Historial** de Hermanas Angarita: dos personas en una visita, pago mixto. En la agenda, la Familia Contreras va con 3 turnos.

**5. Servicios y catálogo (40 s).** En Servicios, **+ Otra técnica…** para agregar técnicas nuevas.
 510 colores con su tono real; «lo tengo», habitual, «quiero comprar».
**Agregar producto** → elegir cómo se gasta: **fijo, por clientas** («me dura 30 clientas») **o por tiempo** («lo compro cada mes»).

**6. Compras (40 s).**
- **Lista de compras** → enviar por WhatsApp.
- **¿Cuándo se acaba?**: con los turnos agendados calcula qué día se acaba cada insumo.
- **Respaldo**: lo estándar que se repone cada mes y medio.
- **Registrar compra** → suma al inventario.

**7. Finanzas (20 s).** Ingresos, compras, gastos y ganancia del mes, por semana.

**8. Sharith (30 s).** Entrar con su cuenta: ve inicio, catálogo y compras; la agenda **solo para consultar**, sin teléfonos, valores ni datos de salud. No ve clientas ni finanzas.

**9. Cierre (20 s).** Funciona en el celular. Tecnología: React, Spring Boot, PostgreSQL; publicado en Cloudflare, Render y Supabase; 16 pruebas automáticas en cada cambio.

## Si algo falla
- «Algo salió mal» al entrar: esperar un minuto (Render despertando) y volver a intentar.
- Si alguien cambió datos durante la demostración: no pasa nada, al día siguiente a las 4:00 a. m. vuelve a quedar como estaba.
