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
 * Las fechas se calculan desde el dia en que se cargan (sin domingos) y se renuevan solas cada dia
 * (al arrancar y a las 4:00 a. m.), asi la agenda siempre gira alrededor de "hoy".
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

    /** Al arrancar: si no hay datos los carga; si la demostracion no es de hoy, la renueva. */
    @Override
    public void run(ApplicationArguments args) {
        renovarSiHaceFalta();
    }

    /** Cada dia a las 4:00 a. m. (hora de Colombia) la demostracion vuelve a quedar alrededor de hoy. */
    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 4 * * *", zone = "America/Bogota")
    public void renovarCadaDia() {
        renovarSiHaceFalta();
    }

    synchronized void renovarSiHaceFalta() {
        if (!activo) return;
        Integer clientas = jdbc.queryForObject("select count(*) from cliente", Integer.class);
        if (clientas == null || clientas == 0) {
            cargar();
            return;
        }
        String cargada = jdbc.query("select valor from app_estado where clave = 'demo_cargada'",
                rs -> rs.next() ? rs.getString(1) : null);
        if (!LocalDate.now().toString().equals(cargada) && reiniciable()) {
            log.info("La demostracion era del {}: se renueva con fechas desde hoy", cargada);
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

    // Servicios (nombre en la base) y duracion por turno en minutos
    private static final String TD = "Uñas tradicional dama (manos y pies)", TC = "Uñas tradicional caballero (manos y pies)",
            SC = "Semipermanente caballero (manos y pies)", SM = "Semipermanente dama (solo manos)",
            SMP = "Semipermanente dama (manos y pies)", MX = "Manos semipermanente + pies tradicional",
            SG = "Soft gel (solo mano)", RS = "Uñas en resina (solo mano)";
    /** Franjas del dia: 2 horas cada una (la de 6:30 p. m. es en casa de Mary). */
    private static final String[] FRANJAS = {"06:30", "08:30", "10:30", "14:30", "16:30", "18:30"};
    private static final int MAX_DIA = 6;

    /** Agenda en memoria para repartir las citas sin cruces ni pasar de 6 personas por dia. */
    private final java.util.Map<Integer, boolean[]> ocupado = new java.util.HashMap<>();
    private final java.util.Map<Integer, Integer> personas = new java.util.HashMap<>();
    private final java.util.List<Object[]> plan = new java.util.ArrayList<>();

    private static int franjas(String servicio, int turnos) {
        int min = switch (servicio) {
            case SMP, SC -> 105; case SG, RS -> 90; case TD, TC -> 75; case SM -> 60; default -> 55;
        };
        return Math.max(1, (int) Math.ceil(min * turnos / 120.0));
    }

    private boolean libre(int dia, int franja, int k, int turnos) {
        boolean[] o = ocupado.computeIfAbsent(dia, x -> new boolean[FRANJAS.length]);
        if (franja + k > FRANJAS.length || personas.getOrDefault(dia, 0) + turnos > MAX_DIA) return false;
        for (int f = franja; f < franja + k; f++) if (o[f]) return false;
        return true;
    }

    /** Cita en un dia y franja fijos (agenda alrededor de hoy). Las canceladas no ocupan cupo. */
    private void fija(String clienta, int dia, int franja, String servicio, int turnos, String estado, String medio, int extra) {
        boolean activa = !"CANCELADA".equals(estado) && !"NO_ASISTIO".equals(estado);
        if (activa) {
            int k = franjas(servicio, turnos);
            if (!libre(dia, franja, k, turnos)) throw new IllegalStateException("Demo: choque en " + dia + " " + FRANJAS[franja]);
            for (int f = franja; f < franja + k; f++) ocupado.get(dia)[f] = true;
            personas.merge(dia, turnos, Integer::sum);
        }
        plan.add(new Object[] {clienta, dia, FRANJAS[franja], servicio, turnos, estado, medio, extra});
    }

    /** Cita del historial: busca el dia mas cercano a "objetivo" (hacia atras) con una franja libre. */
    private void historial(String clienta, int objetivo, String servicio, int turnos, String medio, int extra) {
        int k = franjas(servicio, turnos);
        for (int d = 0; d < 40; d++) {
            for (int dia : new int[] {objetivo - d, objetivo + d}) {
                if (dia > -3 || dia < -70) continue;
                for (int f = 0; f < FRANJAS.length - 1; f++) {
                    if (libre(dia, f, k, turnos)) {
                        fija(clienta, dia, f, servicio, turnos, "ATENDIDA", medio, extra);
                        return;
                    }
                }
            }
        }
    }

    @Transactional
    void cargar() {
        LocalDate hoy = LocalDate.now();
        ocupado.clear(); personas.clear(); plan.clear();
        String[][] sectores = {{"Los Patios", "Los Patios"}, {"Atalaya", "Cúcuta"}, {"Caobos", "Cúcuta"},
            {"Centro", "Villa del Rosario"}, {"Quinta Oriental", "Cúcuta"}, {"La Libertad", "Cúcuta"},
            {"Prados del Este", "Cúcuta"}, {"Barrio Blanco", "Cúcuta"}, {"Centro", "El Zulia"}};
        for (String[] s : sectores) {
            jdbc.update("insert into sector (barrio, municipio) select ?, ? where not exists "
                    + "(select 1 from sector where barrio = ? and municipio = ?)", s[0], s[1], s[0], s[1]);
        }

        // nombre, barrio, municipio, frecuencia (dias), observaciones
        Object[][] clientas = {
            {"Camila Rodríguez", "Los Patios", "Los Patios", 30, "Prefiere tonos nude"},
            {"Laura Martínez", "Atalaya", "Cúcuta", 20, null},
            {"Valentina Gómez", "Caobos", "Cúcuta", 30, null},
            {"Andrea Suárez", "Centro", "Villa del Rosario", 15, null},
            {"Daniela Pérez", "Quinta Oriental", "Cúcuta", 45, null},
            {"Hermanas Angarita", "Los Patios", "Los Patios", 30, "Van varias personas en la misma casa"},
            {"Sofía Vargas", "Atalaya", "Cúcuta", 60, null},
            {"Mariana Ortiz", "Caobos", "Cúcuta", 30, "Le gustan los diseños"},
            {"Natalia Cárdenas", "Centro", "Villa del Rosario", 20, null},
            {"Paola Jaimes", "Quinta Oriental", "Cúcuta", 30, null},
            {"Juliana Rincón", "Los Patios", "Los Patios", 45, null},
            {"Karen Medina", "Atalaya", "Cúcuta", 15, "Siempre semipermanente"},
            {"Lorena Pabón", "Quinta Oriental", "Cúcuta", 30, null},
            {"Diana Contreras", "Atalaya", "Cúcuta", 20, null},
            {"Alejandra Ramírez", "La Libertad", "Cúcuta", 30, null},
            {"Tatiana Duarte", "Prados del Este", "Cúcuta", 20, "Sale tarde del trabajo"},
            {"Familia Contreras", "Centro", "El Zulia", 30, "Mamá y dos hijas"},
            {"Gabriela Mendoza", "Barrio Blanco", "Cúcuta", 15, null},
            {"Carolina Villamizar", "Caobos", "Cúcuta", 30, null},
            {"Melissa Quintero", "Prados del Este", "Cúcuta", 45, null},
            {"Yesenia Torres", "La Libertad", "Cúcuta", 20, null},
            {"Luisa Fernanda Pinto", "Los Patios", "Los Patios", 30, null},
            {"Marcela Ibarra", "Barrio Blanco", "Cúcuta", 30, null},
            {"Sandra Peñaranda", "Centro", "Villa del Rosario", 20, null},
            {"Isabella Moreno", "Atalaya", "Cúcuta", 30, null},
            {"Ana María Lizcano", "Caobos", "Cúcuta", 45, "Uñas largas"},
            {"Jessica Barrera", "Quinta Oriental", "Cúcuta", 15, null},
            {"Claudia Rojas", "La Libertad", "Cúcuta", 30, null},
            {"Jorge Albarracín", "Prados del Este", "Cúcuta", 30, "Manicure de caballero"},
            {"Verónica Sanabria", "Barrio Blanco", "Cúcuta", 20, null},
            {"Ximena Ortega", "Los Patios", "Los Patios", 30, null},
            {"Paula Andrea Leal", "Centro", "El Zulia", 45, null},
            {"Hermanas Becerra", "Atalaya", "Cúcuta", 30, "Dos hermanas"},
            {"Liliana Gélvez", "Centro", "Villa del Rosario", 30, null},
            {"Daniel Castro", "Caobos", "Cúcuta", 45, "Manicure de caballero"},
            {"Mónica Jaramillo", "La Libertad", "Cúcuta", 20, null},
            {"Natalia Sepúlveda", "Barrio Blanco", "Cúcuta", 30, null},
            {"Rosa Elena Díaz", "La Libertad", "Cúcuta", 45, null},
            {"Kelly Rangel", "Prados del Este", "Cúcuta", 20, null},
            {"Brenda Carrillo", "Atalaya", "Cúcuta", 30, null},
            {"Jenny Gamboa", "Caobos", "Cúcuta", 20, null},
        };
        int tel = 1;
        java.util.Map<String, Integer> frecuencia = new java.util.HashMap<>();
        for (Object[] c : clientas) {
            jdbc.update("""
                    insert into cliente (nombre, telefono, direccion, sector_id, frecuencia_dias, observaciones)
                    values (?,?,?,(select id from sector where barrio = ? and municipio = ? limit 1),?,?)""",
                    c[0], MARCA_TELEFONO + String.format("%04d", 2200 + tel), "Calle " + (tel + 3) + " # " + (tel * 7 % 40 + 2) + "-" + (10 + tel),
                    c[1], c[2], ((Integer) c[3]).shortValue(), c[4]);
            frecuencia.put((String) c[0], (Integer) c[3]);
            tel++;
        }
        // Salud con autorizacion (Ley 1581) y un recordatorio para hoy
        jdbc.update("update cliente set autoriza_salud = true, autoriza_salud_fecha = current_date - 31, "
                + "salud = 'Alergia al acrílico; usar solo semipermanente' where nombre = 'Valentina Gómez'");
        jdbc.update("update cliente set recordatorio_fecha = ?, recordatorio_texto = 'Preguntarle si quiere el diseño de flores para diciembre' "
                + "where nombre = 'Camila Rodríguez'", Date.valueOf(hoy));

        // ----- Agenda alrededor de hoy: 2 dias atendidos, hoy y 8 dias hacia adelante -----
        String E = "EFECTIVO", T = "TRANSFERENCIA", P = "PROGRAMADA", A = "ATENDIDA";
        // hace 2 dias
        fija("Karen Medina", -2, 0, SM, 1, "NO_ASISTIO", null, 0);
        fija("Ana María Lizcano", -2, 1, SG, 1, A, T, 10000);
        fija("Ximena Ortega", -2, 2, TD, 1, A, E, 0);
        fija("Sandra Peñaranda", -2, 3, TD, 1, A, E, 0);
        fija("Claudia Rojas", -2, 4, SM, 1, A, T, 5000);
        // ayer
        fija("Isabella Moreno", -1, 0, SM, 1, A, E, 0);
        fija("Melissa Quintero", -1, 1, SMP, 1, A, T, 5000);
        fija("Mónica Jaramillo", -1, 3, TD, 1, A, E, 0);
        fija("Jorge Albarracín", -1, 4, TC, 1, A, E, 0);
        // hoy
        fija("Camila Rodríguez", 0, 0, SMP, 1, A, E, 5000);
        fija("Valentina Gómez", 0, 2, SM, 1, P, null, 0);
        fija("Gabriela Mendoza", 0, 3, SM, 1, P, null, 0);
        fija("Daniel Castro", 0, 4, TC, 1, P, null, 0);
        fija("Tatiana Duarte", 0, 5, TD, 1, P, null, 0);
        // manana (arma el maletin)
        fija("Daniela Pérez", 1, 0, SG, 1, P, null, 0);
        fija("Hermanas Angarita", 1, 1, SMP, 2, P, null, 0);
        fija("Laura Martínez", 1, 3, SM, 1, P, null, 0);
        fija("Alejandra Ramírez", 1, 4, TD, 1, P, null, 0);
        // pasado manana: dia lleno, 6 de 6
        fija("Andrea Suárez", 2, 0, TD, 1, P, null, 0);
        fija("Karen Medina", 2, 1, SM, 1, P, null, 0);
        fija("Natalia Cárdenas", 2, 2, TD, 1, P, null, 0);
        fija("Sofía Vargas", 2, 3, MX, 1, P, null, 0);
        fija("Juliana Rincón", 2, 4, SM, 1, P, null, 0);
        fija("Diana Contreras", 2, 5, SM, 1, P, null, 0);
        // un cupo que se libero (para "Ofrecer el cupo") y una familia de 3
        fija("Carolina Villamizar", 3, 0, SM, 1, P, null, 0);
        fija("Paola Jaimes", 3, 1, SMP, 1, "CANCELADA", null, 0);
        fija("Familia Contreras", 3, 3, TD, 3, P, null, 0);
        fija("Yesenia Torres", 3, 5, SM, 1, P, null, 0);
        // resto de la semana
        fija("Melissa Quintero", 4, 0, SG, 1, P, null, 0);
        fija("Luisa Fernanda Pinto", 4, 1, SMP, 1, P, null, 0);
        fija("Marcela Ibarra", 4, 2, SM, 1, P, null, 0);
        fija("Isabella Moreno", 4, 3, RS, 1, P, null, 0);
        fija("Mariana Ortiz", 4, 4, RS, 1, P, null, 0);
        fija("Sandra Peñaranda", 5, 0, TD, 1, P, null, 0);
        fija("Ana María Lizcano", 5, 1, SG, 1, P, null, 0);
        fija("Jessica Barrera", 5, 3, SM, 1, P, null, 0);
        fija("Claudia Rojas", 5, 4, SMP, 1, P, null, 0);
        fija("Hermanas Becerra", 6, 0, SM, 2, P, null, 0);
        fija("Verónica Sanabria", 6, 1, TD, 1, P, null, 0);
        fija("Ximena Ortega", 6, 2, SMP, 1, P, null, 0);
        fija("Liliana Gélvez", 6, 3, MX, 1, P, null, 0);
        fija("Daniel Castro", 6, 4, SC, 1, P, null, 0);
        fija("Paula Andrea Leal", 7, 1, SG, 1, P, null, 0);
        fija("Mónica Jaramillo", 7, 2, TD, 1, P, null, 0);
        fija("Natalia Sepúlveda", 7, 3, SM, 1, P, null, 0);
        fija("Jorge Albarracín", 7, 4, TC, 1, P, null, 0);
        fija("Rosa Elena Díaz", 8, 0, TD, 1, P, null, 0);
        fija("Kelly Rangel", 8, 2, SM, 1, P, null, 0);
        fija("Brenda Carrillo", 8, 3, SMP, 1, P, null, 0);
        fija("Gabriela Mendoza", 8, 4, SM, 1, P, null, 0);

        // ----- Historial de los dos meses anteriores (finanzas, historial y recontacto) -----
        String[] servicioHabitual = {SMP, SM, TD, SG, SMP, SM, MX, RS, TD, SMP};
        int n = 0;
        for (Object[] c : clientas) {
            String nombre = (String) c[0];
            int f = (Integer) c[3];
            int habiles = Math.max(3, f * 6 / 7);
            int turnos = nombre.startsWith("Hermanas") ? 2 : nombre.startsWith("Familia") ? 3 : 1;
            String servicio = nombre.equals("Jorge Albarracín") || nombre.equals("Daniel Castro") ? TC
                    : turnos > 1 ? (nombre.startsWith("Familia") ? TD : SMP) : servicioHabitual[n % servicioHabitual.length];
            String medio = nombre.startsWith("Hermanas") ? "MIXTO" : (n % 3 == 0 ? T : E);
            int extra = n % 4 == 0 ? 5000 : (n % 7 == 0 ? 10000 : 0);
            historial(nombre, -habiles - (n % 4), servicio, turnos, medio, extra);
            if (f <= 30) historial(nombre, -2 * habiles - (n % 3), servicio, turnos, medio, 0); // las que vienen seguido
            n++;
        }
        // A Lorena y a Jenny ya les toca y no tienen cita: salen en "por recontactar" y en "Ofrecer el cupo"
        plan.removeIf(c -> "Lorena Pabón".equals(c[0]) || "Jenny Gamboa".equals(c[0]));

        for (Object[] c : plan) {
            LocalDate fecha = habil(hoy, (Integer) c[1]);
            int turnos = (Integer) c[4];
            boolean atendida = "ATENDIDA".equals(c[5]);
            String hora = (String) c[2];
            String lugar = hora.startsWith("18") ? "CASA_MARY" : "DOMICILIO";
            jdbc.update("""
                    insert into cita (cliente_id, servicio_id, fecha, hora, lugar, estado, precio_cobrado, extra_diseno,
                                      valor_pagado, medio_pago, turnos)
                    select cl.id, s.id, ?, ?::time, ?, ?, s.precio * ?, ?, case when ? then s.precio * ? + ? else 0 end, ?, ?
                    from cliente cl, servicio s where cl.nombre = ? and s.nombre = ?""",
                    Date.valueOf(fecha), hora, lugar, c[5], turnos, c[7], atendida, turnos, c[7], c[6], (short) turnos,
                    c[0], c[3]);
        }
        // Dos clientas que dijeron "te pago al rato": salen en "Pagos pendientes"
        jdbc.update("""
                update cita set valor_pagado = 0, medio_pago = null
                where fecha = ? and cliente_id = (select id from cliente where nombre = 'Mónica Jaramillo')""",
                Date.valueOf(habil(hoy, -1)));
        jdbc.update("""
                update cita set valor_pagado = 20000, medio_pago = 'EFECTIVO'
                where fecha = ? and cliente_id = (select id from cliente where nombre = 'Claudia Rojas')""",
                Date.valueOf(habil(hoy, -2)));
        // Lorena y Jenny: ultima cita hace mas de su frecuencia
        jdbc.update("""
                insert into cita (cliente_id, servicio_id, fecha, hora, lugar, estado, precio_cobrado, extra_diseno, valor_pagado, medio_pago, turnos)
                select cl.id, s.id, ?, '10:30'::time, 'DOMICILIO', 'ATENDIDA', s.precio, 0, s.precio, 'EFECTIVO', 1
                from cliente cl, servicio s where cl.nombre = 'Lorena Pabón' and s.nombre = ?""", Date.valueOf(hoy.minusDays(36)), TD);
        jdbc.update("""
                insert into cita (cliente_id, servicio_id, fecha, hora, lugar, estado, precio_cobrado, extra_diseno, valor_pagado, medio_pago, turnos)
                select cl.id, s.id, ?, '16:30'::time, 'DOMICILIO', 'ATENDIDA', s.precio, 0, s.precio, 'TRANSFERENCIA', 1
                from cliente cl, servicio s where cl.nombre = 'Jenny Gamboa' and s.nombre = ?""", Date.valueOf(hoy.minusDays(25)), SM);

        // Inventario: casi todo con existencias y algunos casos para las alertas
        jdbc.update("update producto p set stock_actual = 1 + (p.id % 3) "
                + "where not exists (select 1 from color c where c.producto_id = p.id)");
        jdbc.update("update producto set stock_actual = 0.12 where nombre like 'Top coat%'");          // 3 clientas: no alcanza para mañana
        jdbc.update("update producto set stock_actual = 0.3 where nombre like 'Removedor de esmalte%'");
        jdbc.update("update producto set stock_actual = 1.6 where nombre like 'Base Rubber%' or nombre like 'Base 7 en 1%'");
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
                new Object[][] {{"Top coat (brillo semipermanente)", 1, 18000}, {"Lima 180", 2, 3500}, {"Base Rubber", 1, 22000}});
        compra(hoy.minusDays(24), "Masglo Centro",
                new Object[][] {{"Removedor de esmalte (acetona)", 1, 9000}, {"Lima metálica", 1, 12000}});

        // Gastos de los dos meses: gasolina cada 2 o 3 dias, aceite cada mes y algo de mantenimiento
        for (int d = 1; d <= 60; d += (d % 2 == 0 ? 3 : 2)) {
            jdbc.update("insert into gasto (fecha, categoria, monto, descripcion) values (?, 'GASOLINA', ?, 'Tanqueo')",
                    Date.valueOf(hoy.minusDays(d)), 12000 + (d % 3) * 1000);
        }
        Object[][] gastos = {{-14, "ACEITE_MOTO", 40000, "Cambio de aceite"}, {-44, "ACEITE_MOTO", 40000, "Cambio de aceite"},
            {-20, "MANTENIMIENTO_MOTO", 25000, "Pastillas de freno"}, {-6, "OTRO", 8000, "Bolsas y toallas"},
            {-33, "OTRO", 6000, "Algodón y toallitas"}};
        for (Object[] g : gastos) {
            jdbc.update("insert into gasto (fecha, categoria, monto, descripcion) values (?,?,?,?)",
                    Date.valueOf(hoy.plusDays((Integer) g[0])), g[1], g[2], g[3]);
        }
        jdbc.update("delete from app_estado where clave = 'demo_cargada'");
        jdbc.update("insert into app_estado (clave, valor) values ('demo_cargada', ?)", hoy.toString());
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
