package com.marynails.agenda;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "cita")
public class Cita {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long clienteId;
    private Long servicioId;
    private LocalDate fecha;
    private LocalTime hora;
    private Short turnos = 1;
    private String lugar = "DOMICILIO";
    private String estado = "PROGRAMADA";
    private BigDecimal precioCobrado = BigDecimal.ZERO;
    private BigDecimal extraDiseno = BigDecimal.ZERO;
    private BigDecimal valorPagado = BigDecimal.ZERO;
    private String medioPago;
    private String observaciones;

    protected Cita() {}

    public Cita(Long clienteId, Long servicioId, LocalDate fecha, LocalTime hora, BigDecimal precio) {
        this.clienteId = clienteId;
        this.servicioId = servicioId;
        this.fecha = fecha;
        this.hora = hora;
        this.precioCobrado = precio;
    }

    public Long getId() { return id; }
    public Long getClienteId() { return clienteId; }
    public Long getServicioId() { return servicioId; }
    public void setServicioId(Long v) { this.servicioId = v; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate v) { this.fecha = v; }
    public LocalTime getHora() { return hora; }
    public void setHora(LocalTime v) { this.hora = v; }
    public Short getTurnos() { return turnos; }
    public void setTurnos(Short v) { this.turnos = v; }
    public String getLugar() { return lugar; }
    public void setLugar(String v) { this.lugar = v; }
    public String getEstado() { return estado; }
    public void setEstado(String v) { this.estado = v; }
    public BigDecimal getPrecioCobrado() { return precioCobrado; }
    public void setPrecioCobrado(BigDecimal v) { this.precioCobrado = v; }
    public BigDecimal getExtraDiseno() { return extraDiseno; }
    public void setExtraDiseno(BigDecimal v) { this.extraDiseno = v; }
    public BigDecimal getValorPagado() { return valorPagado; }
    public void setValorPagado(BigDecimal v) { this.valorPagado = v; }
    public String getMedioPago() { return medioPago; }
    public void setMedioPago(String v) { this.medioPago = v; }
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String v) { this.observaciones = v; }
}
