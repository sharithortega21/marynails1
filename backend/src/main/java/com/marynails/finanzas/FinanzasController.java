package com.marynails.finanzas;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.TreeMap;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Ingresos (citas atendidas), compras y gastos del negocio. */
@RestController
@RequestMapping("/api")
public class FinanzasController {

    private static final Set<String> CATEGORIAS = Set.of("GASOLINA", "ACEITE_MOTO", "MANTENIMIENTO_MOTO", "OTRO");

    private final JdbcTemplate jdbc;

    public FinanzasController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public record GastoIn(LocalDate fecha, String categoria, BigDecimal monto, String descripcion) {}

    public record GastoDto(Long id, LocalDate fecha, String categoria, BigDecimal monto, String descripcion) {}

    public record Semana(LocalDate desde, BigDecimal ingresos, BigDecimal egresos) {}

    public record Resumen(LocalDate desde, LocalDate hasta, BigDecimal ingresos, BigDecimal porCobrar, BigDecimal compras,
                          BigDecimal gastos, BigDecimal ganancia, long citasAtendidas, List<Semana> semanas) {}

    // ---------- gastos ----------

    @GetMapping("/gastos")
    public List<GastoDto> gastos(@RequestParam(required = false) LocalDate desde, @RequestParam(required = false) LocalDate hasta) {
        LocalDate d = desde != null ? desde : LocalDate.now().withDayOfMonth(1);
        LocalDate h = hasta != null ? hasta : d.plusMonths(1).minusDays(1);
        return jdbc.query("select id, fecha, categoria, monto, descripcion from gasto where fecha between ? and ? order by fecha desc, id desc",
                (rs, n) -> new GastoDto(rs.getLong("id"), rs.getDate("fecha").toLocalDate(), rs.getString("categoria"),
                        rs.getBigDecimal("monto"), rs.getString("descripcion")),
                java.sql.Date.valueOf(d), java.sql.Date.valueOf(h));
    }

    @PostMapping("/gastos")
    public GastoDto crearGasto(@RequestBody GastoIn in) {
        if (in.categoria() == null || !CATEGORIAS.contains(in.categoria())) throw malo("Elige el tipo de gasto");
        if (in.monto() == null || in.monto().signum() <= 0) throw malo("El valor debe ser mayor que cero");
        LocalDate fecha = in.fecha() != null ? in.fecha() : LocalDate.now();
        String desc = in.descripcion() == null || in.descripcion().isBlank() ? null : in.descripcion().trim();
        KeyHolder llave = new GeneratedKeyHolder();
        jdbc.update(con -> {
            var ps = con.prepareStatement("insert into gasto (fecha, categoria, monto, descripcion) values (?,?,?,?)", new String[] {"id"});
            ps.setDate(1, java.sql.Date.valueOf(fecha));
            ps.setString(2, in.categoria());
            ps.setBigDecimal(3, in.monto());
            ps.setString(4, desc);
            return ps;
        }, llave);
        return new GastoDto(llave.getKey().longValue(), fecha, in.categoria(), in.monto(), desc);
    }

    @DeleteMapping("/gastos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrarGasto(@PathVariable Long id) {
        if (jdbc.update("delete from gasto where id = ?", id) == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Gasto no encontrado");
    }

    // ---------- resumen ----------

    @GetMapping("/finanzas/resumen")
    public Resumen resumen(@RequestParam(required = false) LocalDate desde, @RequestParam(required = false) LocalDate hasta) {
        LocalDate d = desde != null ? desde : LocalDate.now().withDayOfMonth(1);
        LocalDate h = hasta != null ? hasta : d.plusMonths(1).minusDays(1);
        if (h.isBefore(d) || d.plusDays(400).isBefore(h)) throw malo("El rango de fechas no es válido");
        var sd = java.sql.Date.valueOf(d);
        var sh = java.sql.Date.valueOf(h);

        BigDecimal ingresos = suma("select coalesce(sum(valor_pagado),0) from cita where estado='ATENDIDA' and fecha between ? and ?", sd, sh);
        BigDecimal porCobrar = suma("select coalesce(sum(greatest(precio_cobrado + extra_diseno - valor_pagado, 0)),0) from cita where estado='ATENDIDA' and fecha between ? and ?", sd, sh);
        BigDecimal compras = suma("select coalesce(sum(dc.cantidad * dc.costo_unitario),0) from detalle_compra dc join compra c on c.id = dc.compra_id where c.fecha between ? and ?", sd, sh);
        BigDecimal gastos = suma("select coalesce(sum(monto),0) from gasto where fecha between ? and ?", sd, sh);
        Long atendidas = jdbc.queryForObject("select count(*) from cita where estado='ATENDIDA' and fecha between ? and ?", Long.class, sd, sh);

        TreeMap<LocalDate, BigDecimal[]> semanas = new TreeMap<>();
        for (LocalDate s = d.with(DayOfWeek.MONDAY); !s.isAfter(h); s = s.plusDays(7)) semanas.put(s, new BigDecimal[] {BigDecimal.ZERO, BigDecimal.ZERO});
        jdbc.query("select fecha, valor_pagado from cita where estado='ATENDIDA' and fecha between ? and ?", rs -> {
            semanas.get(rs.getDate("fecha").toLocalDate().with(DayOfWeek.MONDAY))[0] = semanas.get(rs.getDate("fecha").toLocalDate().with(DayOfWeek.MONDAY))[0].add(rs.getBigDecimal("valor_pagado"));
        }, sd, sh);
        jdbc.query("select fecha, monto from gasto where fecha between ? and ?", rs -> {
            var k = rs.getDate("fecha").toLocalDate().with(DayOfWeek.MONDAY);
            semanas.get(k)[1] = semanas.get(k)[1].add(rs.getBigDecimal("monto"));
        }, sd, sh);
        jdbc.query("select c.fecha, dc.cantidad * dc.costo_unitario as total from detalle_compra dc join compra c on c.id = dc.compra_id where c.fecha between ? and ?", rs -> {
            var k = rs.getDate("fecha").toLocalDate().with(DayOfWeek.MONDAY);
            semanas.get(k)[1] = semanas.get(k)[1].add(rs.getBigDecimal("total"));
        }, sd, sh);

        return new Resumen(d, h, ingresos, porCobrar, compras, gastos, ingresos.subtract(compras).subtract(gastos), atendidas == null ? 0 : atendidas,
                semanas.entrySet().stream().map(e -> new Semana(e.getKey(), e.getValue()[0], e.getValue()[1])).toList());
    }

    private BigDecimal suma(String sql, Object... args) {
        BigDecimal v = jdbc.queryForObject(sql, BigDecimal.class, args);
        return v == null ? BigDecimal.ZERO : v;
    }

    private static ResponseStatusException malo(String m) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, m);
    }
}
