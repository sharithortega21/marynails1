package com.marynails.catalogo;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "producto")
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String categoria;
    private String modoControl;
    private BigDecimal presentacion;
    private String unidad;
    private BigDecimal rendimiento;
    private BigDecimal stockActual = BigDecimal.ZERO;
    private BigDecimal stockMinimo = BigDecimal.ZERO;
    private BigDecimal cantidadHabitual = BigDecimal.ZERO;
    private boolean esHabitual;
    private boolean esCritico;
    private String imagenUrl;

    protected Producto() {}

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public BigDecimal getStockActual() { return stockActual; }
    public void setStockActual(BigDecimal v) { this.stockActual = v; }
    public BigDecimal getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(BigDecimal v) { this.stockMinimo = v; }
    public BigDecimal getCantidadHabitual() { return cantidadHabitual; }
    public void setCantidadHabitual(BigDecimal v) { this.cantidadHabitual = v; }
    public boolean isEsHabitual() { return esHabitual; }
    public void setEsHabitual(boolean v) { this.esHabitual = v; }
    public boolean isEsCritico() { return esCritico; }
    public void setEsCritico(boolean v) { this.esCritico = v; }
}
