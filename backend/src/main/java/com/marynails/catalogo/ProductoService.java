package com.marynails.catalogo;

import java.math.BigDecimal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProductoService {

    /** Cambios parciales: solo se actualizan los campos que vienen. */
    public record Cambios(Boolean esHabitual, Boolean esCritico, BigDecimal stockActual, BigDecimal stockMinimo,
                         BigDecimal cantidadHabitual) {}

    private final ProductoRepository productos;
    private final MovimientoRepository movimientos;

    public ProductoService(ProductoRepository productos, MovimientoRepository movimientos) {
        this.productos = productos;
        this.movimientos = movimientos;
    }

    @Transactional
    public ProductoDto actualizar(Long id, Cambios c) {
        Producto p = productos.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        if (c.esHabitual() != null) p.setEsHabitual(c.esHabitual());
        if (c.esCritico() != null) p.setEsCritico(c.esCritico());
        if (c.stockMinimo() != null) {
            validarNoNegativo(c.stockMinimo());
            p.setStockMinimo(c.stockMinimo());
        }
        if (c.cantidadHabitual() != null) {
            validarNoNegativo(c.cantidadHabitual());
            p.setCantidadHabitual(c.cantidadHabitual());
        }
        if (c.stockActual() != null) {
            validarNoNegativo(c.stockActual());
            BigDecimal diferencia = c.stockActual().subtract(p.getStockActual());
            if (diferencia.signum() != 0) {
                movimientos.save(new Movimiento(p.getId(), "AJUSTE", diferencia));
                p.setStockActual(c.stockActual());
            }
        }
        productos.flush();
        return productos.detalle(id);
    }

    private void validarNoNegativo(BigDecimal v) {
        if (v.signum() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El valor no puede ser negativo");
        }
    }
}
