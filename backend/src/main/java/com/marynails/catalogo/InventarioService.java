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
}
