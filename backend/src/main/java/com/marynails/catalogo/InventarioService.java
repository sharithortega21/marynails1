package com.marynails.catalogo;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Gasto de insumos por promedio.
 * Por arreglos (CONSUMO): cada cita atendida descuenta turnos / rendimiento de cada producto de la receta.
 * Por tiempo (TIEMPO): cada unidad dura "rendimiento" dias desde que se empezo a usar; luego toca renovarla.
 */
@Service
public class InventarioService {

    private final ProductoRepository productos;
    private final MovimientoRepository movimientos;
    private final JdbcTemplate jdbc;

    public InventarioService(ProductoRepository productos, MovimientoRepository movimientos, JdbcTemplate jdbc) {
        this.productos = productos;
        this.movimientos = movimientos;
        this.jdbc = jdbc;
    }

    /**
     * Deja el inventario de acuerdo con el estado de la cita. Es idempotente: primero devuelve lo que la cita
     * ya habia descontado y, si esta atendida, vuelve a descontar segun el servicio y los turnos actuales.
     * Asi, marcar dos veces "atendida", cambiar los turnos o volverla a programada nunca descuadra el stock.
     */
    @Transactional
    public void sincronizarCita(Long citaId, Long servicioId, int turnos, boolean atendida) {
        devolver(citaId);
        if (!atendida) return;
        List<Long> receta = jdbc.queryForList(
                "select producto_id from receta where servicio_id = ?", Long.class, servicioId);
        for (Long productoId : receta) {
            Producto p = productos.findById(productoId).orElse(null);
            if (p == null || !"CONSUMO".equals(p.getModoControl()) || p.getRendimiento() == null
                    || p.getRendimiento().signum() <= 0) {
                continue;
            }
            BigDecimal gasto = BigDecimal.valueOf(Math.max(1, turnos))
                    .divide(p.getRendimiento(), 2, RoundingMode.HALF_UP);
            BigDecimal real = gasto.min(p.getStockActual()); // el stock nunca queda negativo
            if (real.signum() <= 0) continue;
            p.setStockActual(p.getStockActual().subtract(real));
            movimientos.save(new Movimiento(p.getId(), "SALIDA", real.negate(), citaId));
        }
        productos.flush();
    }

    /** Devuelve al stock lo que una cita habia descontado y borra esos movimientos. */
    @Transactional
    public void devolver(Long citaId) {
        List<Movimiento> salidas = movimientos.findByCitaIdAndTipo(citaId, "SALIDA");
        for (Movimiento m : salidas) {
            productos.findById(m.getProductoId())
                    .ifPresent(p -> p.setStockActual(p.getStockActual().subtract(m.getCantidad())));
        }
        movimientos.deleteAll(salidas);
        productos.flush();
    }

    /** "La renové hoy": empieza a contar de nuevo y gasta una unidad del stock si hay. */
    @Transactional
    public ProductoDto renovar(Long productoId) {
        Producto p = productos.findById(productoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        if (!"TIEMPO".equals(p.getModoControl())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se renuevan los productos que se gastan por tiempo");
        }
        boolean yaEnUso = p.getEnUsoDesde() != null;
        p.setEnUsoDesde(LocalDate.now());
        if (yaEnUso && p.getStockActual().compareTo(BigDecimal.ONE) >= 0) {
            p.setStockActual(p.getStockActual().subtract(BigDecimal.ONE));
            movimientos.save(new Movimiento(p.getId(), "SALIDA", BigDecimal.ONE.negate()));
        }
        productos.flush();
        return productos.detalle(productoId);
    }

    public record PorRenovar(ProductoDto producto, long diasDeUso, long diasRestantes) {}

    /** Productos por tiempo a los que les faltan 3 dias o menos (o ya se pasaron). */
    public List<PorRenovar> porRenovar() {
        LocalDate hoy = LocalDate.now();
        return productos.enUsoPorTiempo().stream()
                .map(p -> {
                    long uso = ChronoUnit.DAYS.between(p.enUsoDesde(), hoy);
                    return new PorRenovar(p, uso, p.rendimiento().longValue() - uso);
                })
                .filter(r -> r.diasRestantes() <= 3)
                .toList();
    }

    /** Cada cuantos dias se hace la compra de respaldo (mes y medio). */
    public static final int DIAS_RESPALDO = 45;

    public record Respaldo(Long productoId, String nombre, String categoria, BigDecimal stockActual,
                           LocalDate ultimaCompra, Integer diasDesdeCompra, boolean enLista) {}

    /**
     * Compra de respaldo: productos estandar marcados como respaldo cuya ultima compra fue hace
     * 45 dias o mas (o que nunca se han comprado por el sistema).
     */
    public List<Respaldo> compraRespaldo() {
        LocalDate hoy = LocalDate.now();
        return jdbc.query("""
                select p.id, p.nombre, p.categoria, p.stock_actual, p.por_comprar,
                       (select max(m.fecha) from movimiento m where m.producto_id = p.id and m.tipo = 'ENTRADA') as ultima
                from producto p
                where p.activo = true and p.respaldo = true
                order by p.categoria, p.nombre
                """,
                (rs, i) -> {
                    java.sql.Date u = rs.getDate("ultima");
                    LocalDate ultima = u == null ? null : u.toLocalDate();
                    Integer dias = ultima == null ? null : (int) ChronoUnit.DAYS.between(ultima, hoy);
                    return new Respaldo(rs.getLong("id"), rs.getString("nombre"), rs.getString("categoria"),
                            rs.getBigDecimal("stock_actual"), ultima, dias, rs.getBigDecimal("por_comprar").signum() > 0);
                })
                .stream().filter(r -> r.diasDesdeCompra() == null || r.diasDesdeCompra() >= DIAS_RESPALDO).toList();
    }

    public record ItemMaletin(Long productoId, String nombre, String categoria, BigDecimal stockActual,
                              boolean esCritico, int arreglos, boolean falta) {}

    /**
     * Lista del maletin para un dia: los productos de las recetas de las citas programadas de ese dia
     * mas los criticos (no pueden faltar en la ruta), con aviso si no hay en stock.
     */
    public List<ItemMaletin> maletin(LocalDate fecha) {
        return jdbc.query("""
                select p.id, p.nombre, p.categoria, p.stock_actual, p.es_critico,
                       coalesce(sum(c.turnos), 0) as arreglos
                from producto p
                left join receta r on r.producto_id = p.id
                left join cita c on c.servicio_id = r.servicio_id and c.fecha = ? and c.estado = 'PROGRAMADA'
                where p.activo = true
                group by p.id, p.nombre, p.categoria, p.stock_actual, p.es_critico
                having coalesce(sum(c.turnos), 0) > 0 or p.es_critico
                order by p.es_critico desc, p.categoria, p.nombre
                """,
                (rs, i) -> new ItemMaletin(rs.getLong("id"), rs.getString("nombre"), rs.getString("categoria"),
                        rs.getBigDecimal("stock_actual"), rs.getBoolean("es_critico"), rs.getInt("arreglos"),
                        rs.getBigDecimal("stock_actual").signum() <= 0),
                fecha);
    }

    // ---------- prediccion de consumo ----------

    /** Dias hacia atras para medir el ritmo real y dias hacia adelante para mirar la agenda. */
    public static final int DIAS_HISTORIA = 28, DIAS_AGENDA = 14;

    public record Prediccion(Long productoId, String nombre, String categoria, String modoControl,
                             BigDecimal stockActual, BigDecimal rendimiento, Integer clientasRestantes,
                             BigDecimal clientasSemana, int programadas, Integer diasRestantes, LocalDate seAcaba,
                             String estado, boolean enLista) {}

    /**
     * Cuanto le queda a cada producto y cuando se acaba, con los numeros que Mary puso:
     * - Por clientas (CONSUMO): "me dura N clientas". Cada turno atendido gasta 1/N; quedan stock x N clientas.
     *   El ritmo es el mayor entre los turnos atendidos en las ultimas 4 semanas y los programados en las
     *   proximas 2 (asi el aviso llega antes y no despues).
     * - Por tiempo (TIEMPO): "lo compro cada N dias". Lo que le falta a la unidad en uso mas las de reserva.
     * Los colores no entran: se manejan aparte, con "lo tengo" y "quiero comprar".
     */
    public List<Prediccion> prediccion() {
        LocalDate hoy = LocalDate.now();
        return jdbc.query("""
                select p.id, p.nombre, p.categoria, p.modo_control, p.stock_actual, p.rendimiento, p.en_uso_desde,
                       p.por_comprar,
                       coalesce(sum(c.turnos) filter (where c.estado = 'ATENDIDA' and c.fecha between ? and ?), 0) as hist,
                       coalesce(sum(c.turnos) filter (where c.estado = 'PROGRAMADA' and c.fecha between ? and ?), 0) as plan,
                       coalesce(sum(c.turnos) filter (where c.estado = 'PROGRAMADA' and c.fecha between ? and ?), 0) as semana
                from producto p
                left join receta r on r.producto_id = p.id
                left join cita c on c.servicio_id = r.servicio_id
                where p.activo = true and p.modo_control in ('CONSUMO', 'TIEMPO') and p.rendimiento > 0
                  and not exists (select 1 from color co where co.producto_id = p.id)
                group by p.id, p.nombre, p.categoria, p.modo_control, p.stock_actual, p.rendimiento, p.en_uso_desde, p.por_comprar
                """,
                (rs, i) -> {
                    String modo = rs.getString("modo_control");
                    BigDecimal stock = rs.getBigDecimal("stock_actual");
                    BigDecimal rend = rs.getBigDecimal("rendimiento");
                    java.sql.Date d = rs.getDate("en_uso_desde");
                    int hist = rs.getInt("hist"), plan = rs.getInt("plan"), semana = rs.getInt("semana");
                    Integer clientas = null, dias;
                    boolean pronto;
                    if ("TIEMPO".equals(modo)) {
                        long n = rend.longValue();
                        if (d != null) {
                            long uso = ChronoUnit.DAYS.between(d.toLocalDate(), hoy);
                            dias = (int) Math.max(0, n - uso + Math.max(0, stock.longValue() - 1) * n);
                        } else {
                            dias = (int) (stock.longValue() * n);
                        }
                        pronto = dias <= 7;
                    } else {
                        clientas = (int) Math.floor(stock.doubleValue() * rend.doubleValue() + 0.0001);
                        double ritmo = Math.max(hist / (double) DIAS_HISTORIA, plan / (double) DIAS_AGENDA);
                        dias = clientas <= 0 ? Integer.valueOf(0) : ritmo > 0 ? Integer.valueOf((int) Math.floor(clientas / ritmo)) : null;
                        // tambien avisa si lo agendado esta semana ya no alcanza
                        pronto = (dias != null && dias <= 7) || (clientas < semana);
                    }
                    String estado = dias == null ? "SIN_USO" : dias <= 0 ? "AGOTADO" : pronto ? "PRONTO"
                            : dias <= 14 ? "ATENTO" : "BIEN";
                    BigDecimal porSemana = BigDecimal.valueOf(hist * 7.0 / DIAS_HISTORIA).setScale(1, RoundingMode.HALF_UP);
                    return new Prediccion(rs.getLong("id"), rs.getString("nombre"), rs.getString("categoria"), modo,
                            stock, rend, clientas, porSemana, plan, dias, dias == null ? null : hoy.plusDays(dias), estado,
                            rs.getBigDecimal("por_comprar").signum() > 0);
                },
                hoy.minusDays(DIAS_HISTORIA - 1), hoy, hoy, hoy.plusDays(DIAS_AGENDA - 1), hoy, hoy.plusDays(6))
                .stream()
                .sorted(java.util.Comparator.comparing((Prediccion x) -> x.diasRestantes() == null ? Integer.MAX_VALUE : x.diasRestantes())
                        .thenComparing(Prediccion::nombre))
                .toList();
    }
}
