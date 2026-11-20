package com.marynails.catalogo;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "movimiento")
public class Movimiento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long productoId;
    private LocalDate fecha = LocalDate.now();
    private String tipo;
    private BigDecimal cantidad;
    private Long citaId;

    protected Movimiento() {}

    public Movimiento(Long productoId, String tipo, BigDecimal cantidad) {
        this.productoId = productoId;
        this.tipo = tipo;
        this.cantidad = cantidad;
    }

    public Movimiento(Long productoId, String tipo, BigDecimal cantidad, Long citaId) {
        this(productoId, tipo, cantidad);
        this.citaId = citaId;
    }

    public Long getProductoId() { return productoId; }
    public BigDecimal getCantidad() { return cantidad; }
}
