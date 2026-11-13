package com.marynails.finanzas;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Entradas de mercancia de la distribuidora: al registrarlas suben el stock y quedan como gasto de compras. */
@RestController
@RequestMapping("/api/compras")
public class ComprasController {

    private final JdbcTemplate jdbc;

    public ComprasController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public record LineaIn(Long productoId, BigDecimal cantidad, BigDecimal costoUnitario) {}

    public record CompraIn(LocalDate fecha, String proveedor, List<LineaIn> detalles) {}

    public record Linea(Long productoId, String producto, BigDecimal cantidad, BigDecimal costoUnitario) {}

    public record CompraDto(Long id, LocalDate fecha, String proveedor, BigDecimal total, List<Linea> detalles) {}

    @GetMapping
    public List<CompraDto> listar(@RequestParam(required = false) LocalDate desde,
                                  @RequestParam(required = false) LocalDate hasta) {
        LocalDate d = desde != null ? desde : LocalDate.now().withDayOfMonth(1);
        LocalDate h = hasta != null ? hasta : d.plusMonths(1).minusDays(1);
        Map<Long, CompraDto> porId = new LinkedHashMap<>();
        jdbc.query("""
                select c.id, c.fecha, c.proveedor, dc.producto_id, p.nombre, dc.cantidad, dc.costo_unitario
                from compra c
                left join detalle_compra dc on dc.compra_id = c.id
                left join producto p on p.id = dc.producto_id
                where c.fecha between ? and ?
                order by c.fecha desc, c.id desc, p.nombre
                """, rs -> {
            long id = rs.getLong("id");
            CompraDto c = porId.computeIfAbsent(id, k -> {
                try {
                    return new CompraDto(id, rs.getDate("fecha").toLocalDate(), rs.getString("proveedor"),
                            BigDecimal.ZERO, new ArrayList<>());
                } catch (java.sql.SQLException e) {
                    throw new IllegalStateException(e);
                }
            });
            if (rs.getObject("producto_id") != null) {
                c.detalles().add(new Linea(rs.getLong("producto_id"), rs.getString("nombre"),
                        rs.getBigDecimal("cantidad"), rs.getBigDecimal("costo_unitario")));
            }
        }, java.sql.Date.valueOf(d), java.sql.Date.valueOf(h));
        return porId.values().stream().map(c -> new CompraDto(c.id(), c.fecha(), c.proveedor(),
                c.detalles().stream().map(l -> l.cantidad().multiply(l.costoUnitario())).reduce(BigDecimal.ZERO, BigDecimal::add),
                c.detalles())).toList();
    }

    @PostMapping
    @Transactional
    public CompraDto registrar(@RequestBody CompraIn in) {
        if (in.detalles() == null || in.detalles().isEmpty()) throw malo("Agrega al menos un producto");
        // un producto solo una vez por compra (la clave del detalle es compra + producto)
        Map<Long, LineaIn> lineas = new LinkedHashMap<>();
        for (LineaIn l : in.detalles()) {
            if (l.productoId() == null) throw malo("Falta el producto");
            if (l.cantidad() == null || l.cantidad().signum() <= 0) throw malo("La cantidad debe ser mayor que cero");
            if (l.costoUnitario() == null || l.costoUnitario().signum() < 0) throw malo("El costo no puede ser negativo");
            lineas.merge(l.productoId(), l, (a, b) -> new LineaIn(a.productoId(), a.cantidad().add(b.cantidad()), b.costoUnitario()));
        }
        for (Long id : lineas.keySet()) {
            Integer n = jdbc.queryForObject("select count(*) from producto where id = ?", Integer.class, id);
            if (n == null || n == 0) throw malo("Un producto de la compra no existe");
        }
        LocalDate fecha = in.fecha() != null ? in.fecha() : LocalDate.now();
        String proveedor = in.proveedor() == null || in.proveedor().isBlank() ? null : in.proveedor().trim();

        KeyHolder llave = new GeneratedKeyHolder();
        jdbc.update(con -> {
            var ps = con.prepareStatement("insert into compra (fecha, proveedor) values (?, ?)", new String[] {"id"});
            ps.setDate(1, java.sql.Date.valueOf(fecha));
            ps.setString(2, proveedor);
            return ps;
        }, llave);
        long compraId = llave.getKey().longValue();

        for (LineaIn l : lineas.values()) {
            jdbc.update("insert into detalle_compra (compra_id, producto_id, cantidad, costo_unitario) values (?,?,?,?)",
                    compraId, l.productoId(), l.cantidad(), l.costoUnitario());
            jdbc.update("update producto set stock_actual = stock_actual + ?, por_comprar = 0 where id = ?", l.cantidad(), l.productoId());
            jdbc.update("insert into movimiento (producto_id, fecha, tipo, cantidad) values (?,?, 'ENTRADA', ?)", l.productoId(), java.sql.Date.valueOf(fecha), l.cantidad());
        }
        return listar(fecha, fecha).stream().filter(c -> c.id() == compraId).findFirst().orElseThrow();
    }

    private static ResponseStatusException malo(String m) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, m);
    }
}
