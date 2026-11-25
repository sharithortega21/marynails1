package com.marynails.demo;

import java.sql.Date;
import java.time.DayOfWeek;
import java.time.LocalDate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Datos de demostracion para la feria: cada funcion del sistema tiene algo que mostrar.
 * Las fechas se calculan desde el dia en que se cargan (sin domingos), asi la demostracion nunca envejece.
 *
 * Seguridad: solo trabaja con DEMO_DATOS=true y solo reinicia si TODAS las clientas son de ejemplo
 * (telefono que empieza por 300111). Nunca borra datos reales.
 */
@Service
public class DemoService implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(DemoService.class);
    private static final String MARCA_TELEFONO = "300111";

    private final JdbcTemplate jdbc;
    private final boolean activo;

    public DemoService(JdbcTemplate jdbc, @Value("${app.demo-datos:false}") boolean activo) {
        this.jdbc = jdbc;
        this.activo = activo;
    }

    public boolean activo() {
        return activo;
    }

    /** Se puede reiniciar si esta en modo demostracion y no hay ni una clienta real. */
    public boolean reiniciable() {
        if (!activo) return false;
        Integer reales = jdbc.queryForObject(
                "select count(*) from cliente where telefono is null or telefono not like '" + MARCA_TELEFONO + "%'", Integer.class);
        return reales != null && reales == 0;
    }

    /** Al arrancar: si no hay datos los carga; si la demostracion quedo vieja (sin citas desde hoy), la renueva. */
    @Override
    public void run(ApplicationArguments args) {
        if (!activo) return;
        Integer clientas = jdbc.queryForObject("select count(*) from cliente", Integer.class);
        if (clientas == null || clientas == 0) {
            cargar();
            return;
        }
        Integer futuras = jdbc.queryForObject("select count(*) from cita where fecha >= current_date", Integer.class);
        if ((futuras == null || futuras == 0) && reiniciable()) {
            log.info("La demostracion estaba vieja: se renueva con fechas desde hoy");
            reiniciar();
        }
    }

    /** Borra los datos de ejemplo y los vuelve a crear con fechas desde hoy. */
    @Transactional
    public void reiniciar() {
        if (!activo) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El sistema no está en modo demostración");
        if (!reiniciable()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Hay clientas reales: no se reinicia para no borrar sus datos");
        }
        jdbc.update("delete from movimiento");
        jdbc.update("delete from detalle_compra");
        jdbc.update("delete from compra");
        jdbc.update("delete from gasto");
        jdbc.update("delete from cita");
        jdbc.update("delete from cliente");
        jdbc.update("update producto set stock_actual = 0, por_comprar = 0, en_uso_desde = null");
        cargar();
    }

    /** n-esimo dia habil desde hoy (sin domingos); negativo hacia atras. */
    static LocalDate habil(LocalDate hoy, int n) {
        LocalDate d = hoy;
        if (n == 0) return d.getDayOfWeek() == DayOfWeek.SUNDAY ? d.plusDays(1) : d;
        int paso = n > 0 ? 1 : -1;
        int contados = 0;
        while (contados < Math.abs(n)) {
            d = d.plusDays(paso);
            if (d.getDayOfWeek() != DayOfWeek.SUNDAY) contados++;
        }
        return d;
    }

    @Transactional
    void cargar() {
        LocalDate hoy = LocalDate.now();
        String[][] sectores = {{"Los Patios", "Los Patios"}, {"Atalaya", "Cúcuta"}, {"Caobos", "Cúcuta"},
            {"Centro", "Villa del Rosario"}, {"Quinta Oriental", "Cúcuta"}};
        for (String[] s : sectores) {
            jdbc.update("insert into sector (barrio, municipio) select ?, ? where not exists "
                    + "(select 1 from sector where barrio = ? and municipio = ?)", s[0], s[1], s[0], s[1]);
        }

        // nombre, telefono, direccion, barrio, frecuencia (dias), observaciones
        Object[][] clientas = {
            {"Camila Rodríguez", "3001112201", "Calle 5 # 12-30", "Los Patios", 30, "Prefiere tonos nude"},
            {"Laura Martínez", "3001112202", "Av. 4 # 8-15", "Atalaya", 20, null},
            {"Valentina Gómez", "3001112203", "Cra. 7 # 20-11", "Caobos", 30, null},
            {"Andrea Suárez", "3001112204", "Calle 12 # 3-45", "Centro", 15, null},
            {"Daniela Pérez", "3001112205", "Mz. C Casa 9", "Quinta Oriental", 45, null},
            {"Hermanas Angarita", "3001112206", "Calle 5 con 12", "Los Patios", 30, "Van varias personas en la misma casa"},
            {"Sofía Vargas", "3001112207", "Cra. 3 # 18-60", "Atalaya", 60, null},
            {"Mariana Ortiz", "3001112208", "Calle 9 # 6-22", "Caobos", 30, "Le gustan los diseños"},
            {"Natalia Cárdenas", "3001112209", "Av. 2 # 14-08", "Centro", 20, null},
            {"Paola Jaimes", "3001112210", "Mz. F Casa 3", "Quinta Oriental", 30, null},
            {"Juliana Rincón", "3001112211", "Cra. 10 # 5-17", "Los Patios", 45, null},
            {"Karen Medina", "3001112212", "Calle 20 # 9-31", "Atalaya", 15, "Siempre semipermanente"},
            {"Lorena Pabón", "3001112213", "Mz. B Casa 14", "Quinta Oriental", 30, null},
            {"Diana Contreras", "3001112214", "Calle 18 # 2-40", "Atalaya", 20, null},
        };
        for (Object[] c : clientas) {
            jdbc.update("""
                    insert into cliente (nombre, telefono, direccion, sector_id, frecuencia_dias, observaciones)
                    values (?,?,?,(select id from sector where barrio = ? limit 1),?,?)""",
                    c[0], c[1], c[2], c[3], ((Integer) c[4]).shortValue(), c[5]);
        }
        // Salud con autorizacion (Ley 1581) y un recordatorio para hoy
        jdbc.update("update cliente set autoriza_salud = true, autoriza_salud_fecha = current_date - 31, salud = 'Alergia al acrílico; usar solo semipermanente' where nombre = 'Valentina Gómez'");
        jdbc.update("update cliente set recordatorio_fecha = ?, recordatorio_texto = 'Preguntarle si quiere el diseño de flores para diciembre' "
                + "where nombre = 'Camila Rodríguez'", Date.valueOf(hoy));

        // clienta, dia habil (0 = hoy), hora, servicio, turnos, estado, medio, extra de diseno
        Object[][] citas = {
            // historial y finanzas de las ultimas semanas
            {"Laura Martínez", -40, "10:00", "Semipermanente dama (solo manos)", 1, "ATENDIDA", "TRANSFERENCIA", 0},
            {"Juliana Rincón", -46, "09:30", "Semipermanente dama (manos y pies)", 1, "ATENDIDA", "EFECTIVO", 0},
            {"Daniela Pérez", -45, "15:00", "Soft gel (solo mano)", 1, "ATENDIDA", "TRANSFERENCIA", 5000},
            {"Sofía Vargas", -62, "10:30", "Manos semipermanente + pies tradicional", 1, "ATENDIDA", "EFECTIVO", 0},
            {"Lorena Pabón", -35, "16:00", "Uñas tradicional dama (manos y pies)", 1, "ATENDIDA", "EFECTIVO", 0},
            {"Paola Jaimes", -33, "16:00", "Semipermanente dama (solo manos)", 1, "ATENDIDA", "EFECTIVO", 0},
            {"Hermanas Angarita", -32, "09:00", "Semipermanente dama (manos y pies)", 3, "ATENDIDA", "MIXTO", 10000},
            {"Valentina Gómez", -31, "14:00", "Semipermanente dama (solo manos)", 1, "ATENDIDA", "EFECTIVO", 0},
            {"Camila Rodríguez", -30, "08:00", "Semipermanente dama (manos y pies)", 1, "ATENDIDA", "EFECTIVO", 5000},
            {"Mariana Ortiz", -28, "14:30", "Uñas en resina (solo mano)", 1, "ATENDIDA", "TRANSFERENCIA", 10000},
            {"Natalia Cárdenas", -21, "08:30", "Uñas tradicional dama (manos y pies)", 1, "ATENDIDA", "EFECTIVO", 0},
            {"Laura Martínez", -20, "10:00", "Semipermanente dama (solo manos)", 1, "ATENDIDA", "TRANSFERENCIA", 0},
            {"Andrea Suárez", -16, "08:00", "Uñas tradicional dama (manos y pies)", 1, "ATENDIDA", "EFECTIVO", 0},
            {"Karen Medina", -14, "07:00", "Semipermanente dama (solo manos)", 1, "ATENDIDA", "TRANSFERENCIA", 0},
            {"Diana Contreras", -12, "10:00", "Uñas tradicional dama (manos y pies)", 1, "ATENDIDA", "EFECTIVO", 0},
            {"Andrea Suárez", -3, "08:00", "Uñas tradicional dama (manos y pies)", 1, "ATENDIDA", "EFECTIVO", 0},
            {"Karen Medina", -2, "07:00", "Semipermanente dama (solo manos)", 1, "NO_ASISTIO", null, 0},
            {"Daniela Pérez", -2, "10:00", "Soft gel (solo mano)", 1, "ATENDIDA", "EFECTIVO", 10000},
            {"Sofía Vargas", -1, "08:00", "Semipermanente dama (manos y pies)", 1, "ATENDIDA", "TRANSFERENCIA", 5000},
            {"Juliana Rincón", -1, "14:00", "Semipermanente dama (solo manos)", 1, "ATENDIDA", "EFECTIVO", 0},
            // hoy
            {"Camila Rodríguez", 0, "08:00", "Semipermanente dama (manos y pies)", 1, "ATENDIDA", "EFECTIVO", 5000},
            {"Valentina Gómez", 0, "10:30", "Semipermanente dama (solo manos)", 1, "PROGRAMADA", null, 0},
            {"Mariana Ortiz", 0, "14:30", "Uñas en resina (solo mano)", 1, "PROGRAMADA", null, 0},
            {"Paola Jaimes", 0, "16:30", "Semipermanente dama (solo manos)", 1, "PROGRAMADA", null, 0},
            // manana: lo que arma el maletin
            {"Daniela Pérez", 1, "08:00", "Soft gel (solo mano)", 1, "PROGRAMADA", null, 0},
            {"Hermanas Angarita", 1, "10:00", "Semipermanente dama (manos y pies)", 2, "PROGRAMADA", null, 0},
            {"Laura Martínez", 1, "15:00", "Semipermanente dama (solo manos)", 1, "PROGRAMADA", null, 0},
            // pasado manana: dia lleno, 6 de 6 personas
            {"Andrea Suárez", 2, "06:30", "Uñas tradicional dama (manos y pies)", 1, "PROGRAMADA", null, 0},
            {"Karen Medina", 2, "08:00", "Semipermanente dama (solo manos)", 1, "PROGRAMADA", null, 0},
            {"Natalia Cárdenas", 2, "09:15", "Uñas tradicional dama (manos y pies)", 1, "PROGRAMADA", null, 0},
            {"Sofía Vargas", 2, "14:30", "Manos semipermanente + pies tradicional", 1, "PROGRAMADA", null, 0},
            {"Juliana Rincón", 2, "15:30", "Semipermanente dama (solo manos)", 1, "PROGRAMADA", null, 0},
            {"Diana Contreras", 2, "16:45", "Semipermanente dama (solo manos)", 1, "PROGRAMADA", null, 0},
            // un cupo que se libero: para "Ofrecer el cupo"
            {"Paola Jaimes", 3, "09:00", "Semipermanente dama (manos y pies)", 1, "CANCELADA", null, 0},
            {"Mariana Ortiz", 4, "14:00", "Uñas tradicional dama (manos y pies)", 1, "PROGRAMADA", null, 0},
        };
        for (Object[] c : citas) {
            LocalDate fecha = habil(hoy, (Integer) c[1]);
            int turnos = (Integer) c[4];
            boolean atendida = "ATENDIDA".equals(c[5]);
            String hora = (String) c[2];
            String lugar = Integer.parseInt(hora.substring(0, 2)) >= 18 ? "CASA_MARY" : "DOMICILIO";
            jdbc.update("""
                    insert into cita (cliente_id, servicio_id, fecha, hora, lugar, estado, precio_cobrado, extra_diseno,
                                      valor_pagado, medio_pago, turnos)
                    select cl.id, s.id, ?, ?::time, ?, ?, s.precio * ?, ?, case when ? then s.precio * ? + ? else 0 end, ?, ?
                    from cliente cl, servicio s where cl.nombre = ? and s.nombre = ?""",
                    Date.valueOf(fecha), hora, lugar, c[5], turnos, c[7], atendida, turnos, c[7], c[6], (short) turnos,
                    c[0], c[3]);
        }

        // Inventario: casi todo con existencias y algunos casos para las alertas
        jdbc.update("update producto p set stock_actual = 1 + (p.id % 3) "
                + "where not exists (select 1 from color c where c.producto_id = p.id)");
        jdbc.update("update producto set stock_actual = 0.2 where nombre like 'Top coat%'");           // se acaba esta semana
        jdbc.update("update producto set stock_actual = 0.3 where nombre like 'Removedor de esmalte%'");
        jdbc.update("update producto set stock_actual = 1.6 where nombre like 'Base semipermanente%'");
        jdbc.update("update producto set stock_actual = 0, por_comprar = 1 where nombre like 'Algodón%'"); // en la lista
        jdbc.update("update producto set en_uso_desde = ? where nombre = 'Lima 180'", Date.valueOf(hoy.minusDays(19)));
        jdbc.update("update producto set en_uso_desde = ? where nombre = 'Lima metálica'", Date.valueOf(hoy.minusDays(44)));
        jdbc.update("update producto set en_uso_desde = ? where nombre = 'Lima normal'", Date.valueOf(hoy.minusDays(5)));
        // Colores: unos que Mary tiene, los habituales y dos que quiere comprar
        jdbc.update("update producto p set stock_actual = 1 from color c where c.producto_id = p.id and p.id % 11 = 0");
        jdbc.update("update producto p set es_habitual = true, stock_actual = 1 from color c "
                + "where c.producto_id = p.id and c.linea = 'Gelpolish' and c.codigo in ('001', '012', '050', '101')");
        jdbc.update("update producto p set por_comprar = 1 from color c "
                + "where c.producto_id = p.id and c.linea = 'Gelpolish' and c.codigo in ('182', '184')");

        // Dos compras anteriores (entran al inventario y a finanzas)
        compra(hoy.minusDays(10), "Distribuidora Tiffany Cúcuta",
                new Object[][] {{"Top coat (brillo semipermanente)", 1, 18000}, {"Lima 180", 2, 3500}, {"Base semipermanente (Rubber o 7 en 1)", 1, 22000}});
        compra(hoy.minusDays(24), "Masglo Centro",
                new Object[][] {{"Removedor de esmalte (acetona)", 1, 9000}, {"Lima metálica", 1, 12000}});

        Object[][] gastos = {{-1, "GASOLINA", 13000, "Tanqueo"}, {-3, "OTRO", 6000, "Algodón y toallitas"}, {-5, "GASOLINA", 12000, "Tanqueo"},
            {-9, "GASOLINA", 13000, "Tanqueo"}, {-14, "ACEITE_MOTO", 40000, "Cambio de aceite"},
            {-16, "GASOLINA", 12500, "Tanqueo"}, {-6, "OTRO", 8000, "Bolsas y toallas"}, {-20, "MANTENIMIENTO_MOTO", 25000, "Pastillas de freno"}};
        for (Object[] g : gastos) {
            jdbc.update("insert into gasto (fecha, categoria, monto, descripcion) values (?,?,?,?)",
                    Date.valueOf(hoy.plusDays((Integer) g[0])), g[1], g[2], g[3]);
        }
        log.info("Datos de demostración cargados desde {}", hoy);
    }

    private void compra(LocalDate fecha, String proveedor, Object[][] items) {
        Long id = jdbc.queryForObject("insert into compra (fecha, proveedor) values (?, ?) returning id", Long.class,
                Date.valueOf(fecha), proveedor);
        for (Object[] it : items) {
            Long p = jdbc.queryForObject("select id from producto where nombre = ?", Long.class, it[0]);
            jdbc.update("insert into detalle_compra (compra_id, producto_id, cantidad, costo_unitario) values (?,?,?,?)",
                    id, p, it[1], it[2]);
            jdbc.update("insert into movimiento (producto_id, fecha, tipo, cantidad) values (?,?,'ENTRADA',?)",
                    p, Date.valueOf(fecha), it[1]);
        }
    }
}
