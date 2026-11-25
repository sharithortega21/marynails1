package com.marynails.agenda;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "cliente")
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String telefono;
    private String direccion;
    private Long sectorId;
    private Short frecuenciaDias;
    private String observaciones;
    private String salud;
    private boolean autorizaSalud;
    private java.time.LocalDate autorizaSaludFecha;
    private LocalDate recordatorioFecha;
    private String recordatorioTexto;

    protected Cliente() {}

    public Cliente(String nombre) { this.nombre = nombre; }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public void setNombre(String v) { this.nombre = v; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String v) { this.telefono = v; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String v) { this.direccion = v; }
    public Long getSectorId() { return sectorId; }
    public void setSectorId(Long v) { this.sectorId = v; }
    public Short getFrecuenciaDias() { return frecuenciaDias; }
    public void setFrecuenciaDias(Short v) { this.frecuenciaDias = v; }
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String v) { this.observaciones = v; }
    public String getSalud() { return salud; }
    public void setSalud(String v) { this.salud = v; }
    public boolean isAutorizaSalud() { return autorizaSalud; }
    /** Al autorizar se guarda la fecha (Ley 1581); al retirar la autorizacion se borra. */
    public void setAutorizaSalud(boolean v) {
        if (v && !this.autorizaSalud) this.autorizaSaludFecha = java.time.LocalDate.now();
        if (!v) this.autorizaSaludFecha = null;
        this.autorizaSalud = v;
    }
    public java.time.LocalDate getAutorizaSaludFecha() { return autorizaSaludFecha; }
    public void setRecordatorioFecha(LocalDate v) { this.recordatorioFecha = v; }
    public void setRecordatorioTexto(String v) { this.recordatorioTexto = v; }
}
