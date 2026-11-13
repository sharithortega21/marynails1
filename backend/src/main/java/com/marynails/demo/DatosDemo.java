package com.marynails.demo;

import java.time.LocalDate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** Datos de ejemplo (clientas, citas, gastos) para que el prototipo no se vea vacio. Solo si no hay clientas. */
@Component
public class DatosDemo implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(DatosDemo.class);

    private final JdbcTemplate jdbc;
    private final boolean activo;

    public DatosDemo(JdbcTemplate jdbc, @Value("${app.demo-datos:false}") boolean activo) {
        this.jdbc = jdbc;
        this.activo = activo;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!activo) return;
        Integer n = jdbc.queryForObject("select count(*) from cliente", Integer.class);
        if (n != null && n > 0) return;

        String[][] sectores = {{"Los Patios", "Los Patios"}, {"Atalaya", "Cúcuta"}, {"Caobos", "Cúcuta"}, {"Centro", "Villa del Rosario"}, {"Quinta Oriental", "Cúcuta"}};
        for (String[] s : sectores) jdbc.update("insert into sector (barrio, municipio) values (?,?) on conflict do nothing", s[0], s[1]);

        // nombre, telefono, direccion, barrio, frecuencia, observaciones
        Object[][] clientas = {
            {"Camila Rodríguez", "3001112201", "Calle 5 # 12-30", "Los Patios", 30, "Prefiere tonos nude"},
            {"Laura Martínez", "3001112202", "Av. 4 # 8-15", "Atalaya", 20, null},
            {"Valentina Gómez", "3001112203", "Cra. 7 # 20-11", "Caobos", 30, "Alérgica al acrílico"},
            {"Andrea Suárez", "3001112204", "Calle 12 # 3-45", "Centro", 15, null},
            {"Daniela Pérez", "3001112205", "Mz. C Casa 9", "Quinta Oriental", 45, null},
            {"Hermanas Angarita", "3001112206", "Calle 5 con 12", "Los Patios", 30, "Van varias personas en la misma casa"},
            {"Sofía Vargas", "3001112207", "Cra. 3 # 18-60", "Atalaya", 60, null},
            {"Mariana Ortiz", "3001112208", "Calle 9 # 6-22", "Caobos", 30, "Le gustan los diseños"},
            {"Natalia Cárdenas", "3001112209", "Av. 2 # 14-08", "Centro", 20, null},
            {"Paola Jaimes", "3001112210", "Mz. F Casa 3", "Quinta Oriental", 30, null},
            {"Juliana Rincón", "3001112211", "Cra. 10 # 5-17", "Los Patios", 45, null},
            {"Karen Medina", "3001112212", "Calle 20 # 9-31", "Atalaya", 15, "Siempre semipermanente"},
        };
        for (Object[] c : clientas) {
            jdbc.update("""
                    insert into cliente (nombre, telefono, direccion, sector_id, frecuencia_dias, observaciones)
                    values (?,?,?,(select id from sector where barrio = ? limit 1),?,?)""",
                    c[0], c[1], c[2], c[3], ((Integer) c[4]).shortValue(), c[5]);
        }

        // citas: {indice clienta (1..12), dias respecto a hoy, hora, servicio (1..8), turnos, estado, medio}
        Object[][] citas = {
            {1, -35, "08:00", 5, 1, "ATENDIDA", "EFECTIVO"}, {2, -22, "10:00", 4, 1, "ATENDIDA", "TRANSFERENCIA"},
            {3, -30, "14:00", 2, 1, "ATENDIDA", "EFECTIVO"}, {4, -16, "08:00", 4, 1, "ATENDIDA", "EFECTIVO"},
            {5, -50, "15:00", 7, 1, "ATENDIDA", "TRANSFERENCIA"}, {6, -35, "09:00", 5, 3, "ATENDIDA", "EFECTIVO"},
            {7, -70, "10:30", 6, 1, "ATENDIDA", "EFECTIVO"}, {8, -28, "14:30", 8, 1, "ATENDIDA", "TRANSFERENCIA"},
            {9, -21, "08:30", 4, 1, "ATENDIDA", "EFECTIVO"}, {10, -33, "16:00", 2, 1, "ATENDIDA", "EFECTIVO"},
            {11, -48, "09:30", 5, 1, "ATENDIDA", "EFECTIVO"}, {12, -17, "07:00", 4, 1, "ATENDIDA", "TRANSFERENCIA"},
            {2, -2, "10:00", 4, 1, "ATENDIDA", "EFECTIVO"}, {4, -1, "08:00", 4, 1, "ATENDIDA", "EFECTIVO"},
            {12, -3, "07:00", 4, 1, "NO_ASISTIO", null}, {9, -4, "14:00", 2, 1, "CANCELADA", null},
            {1, 0, "08:00", 5, 1, "ATENDIDA", "EFECTIVO"}, {3, 0, "10:30", 2, 1, "PROGRAMADA", null},
            {8, 0, "14:00", 8, 1, "PROGRAMADA", null}, {10, 0, "16:00", 2, 1, "PROGRAMADA", null},
            {5, 1, "09:00", 7, 1, "PROGRAMADA", null}, {6, 1, "14:00", 5, 2, "PROGRAMADA", null},
            {11, 2, "08:00", 5, 1, "PROGRAMADA", null}, {2, 3, "10:00", 4, 1, "PROGRAMADA", null},
            {7, 4, "15:00", 6, 1, "PROGRAMADA", null}, {9, 5, "09:00", 4, 1, "PROGRAMADA", null},
        };
        LocalDate hoy = LocalDate.now();
        for (Object[] c : citas) {
            LocalDate fecha = hoy.plusDays((Integer) c[1]);
            if (fecha.getDayOfWeek() == java.time.DayOfWeek.SUNDAY) fecha = fecha.plusDays(1);
            boolean atendida = "ATENDIDA".equals(c[5]);
            int turnos = (Integer) c[4];
            jdbc.update("""
                    insert into cita (cliente_id, servicio_id, fecha, hora, lugar, estado, precio_cobrado, extra_diseno, valor_pagado, medio_pago, turnos)
                    select cl.id, s.id, ?, ?::time, ?, ?, s.precio * ?, 0, case when ? then s.precio * ? else 0 end, ?, ?
                    from (select id from cliente order by id offset ? limit 1) cl,
                         (select id, precio from servicio order by id offset ? limit 1) s""",
                    java.sql.Date.valueOf(fecha), c[2], turnos > 1 || (Integer) c[0] % 2 == 0 ? "DOMICILIO" : "CASA_MARY", c[5],
                    turnos, atendida, turnos, c[6], (short) turnos, (Integer) c[0] - 1, (Integer) c[3] - 1);
        }

        // gastos y una compra de ejemplo
        Object[][] gastos = {{-2, "GASOLINA", 13000, "Tanqueo"}, {-9, "GASOLINA", 12000, "Tanqueo"}, {-14, "ACEITE_MOTO", 40000, "Cambio de aceite"}, {-6, "OTRO", 8000, "Bolsas y toallas"}};
        for (Object[] g : gastos) {
            jdbc.update("insert into gasto (fecha, categoria, monto, descripcion) values (?,?,?,?)", java.sql.Date.valueOf(hoy.plusDays((Integer) g[0])), g[1], g[2], g[3]);
        }
        log.info("Datos de ejemplo cargados (clientas, citas y gastos)");
    }
}
