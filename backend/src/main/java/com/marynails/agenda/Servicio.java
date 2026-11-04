package com.marynails.agenda;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "servicio")
public class Servicio {
    @Id
    private Long id;
    private String nombre;
    private BigDecimal precio;
    private String familia;
    private Short duracionMin;

    protected Servicio() {}

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public BigDecimal getPrecio() { return precio; }
    public String getFamilia() { return familia; }
    public Short getDuracionMin() { return duracionMin; }
}
