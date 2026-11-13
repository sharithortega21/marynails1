package com.marynails.agenda;

import jakarta.persistence.*;

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
}
