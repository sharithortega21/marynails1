package com.marynails.catalogo;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

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
    private BigDecimal porComprar = BigDecimal.ZERO;
    private boolean esHabitual;
    private boolean esCritico;
    private String imagenUrl;
    private boolean activo = true;
    private LocalDate enUsoDesde;

    protected Producto() {}

    public Producto(String nombre, String categoria) {
        this.nombre = nombre;
        this.categoria = categoria;
        this.modoControl = "MANUAL";
    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public BigDecimal getStockActual() { return stockActual; }
    public void setStockActual(BigDecimal v) { this.stockActual = v; }
    public BigDecimal getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(BigDecimal v) { this.stockMinimo = v; }
    public BigDecimal getCantidadHabitual() { return cantidadHabitual; }
    public void setCantidadHabitual(BigDecimal v) { this.cantidadHabitual = v; }
    public BigDecimal getPorComprar() { return porComprar; }
    public void setPorComprar(BigDecimal v) { this.porComprar = v; }
    public boolean isEsHabitual() { return esHabitual; }
    public void setEsHabitual(boolean v) { this.esHabitual = v; }
    public boolean isEsCritico() { return esCritico; }
    public void setEsCritico(boolean v) { this.esCritico = v; }
    public void setNombre(String v) { this.nombre = v; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String v) { this.categoria = v; }
    public String getModoControl() { return modoControl; }
    public void setModoControl(String v) { this.modoControl = v; }
    public BigDecimal getPresentacion() { return presentacion; }
    public void setPresentacion(BigDecimal v) { this.presentacion = v; }
    public String getUnidad() { return unidad; }
    public void setUnidad(String v) { this.unidad = v; }
    public BigDecimal getRendimiento() { return rendimiento; }
    public void setRendimiento(BigDecimal v) { this.rendimiento = v; }
    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String v) { this.imagenUrl = v; }
    public boolean isActivo() { return activo; }
    public void setActivo(boolean v) { this.activo = v; }
    public LocalDate getEnUsoDesde() { return enUsoDesde; }
    public void setEnUsoDesde(LocalDate v) { this.enUsoDesde = v; }
}
