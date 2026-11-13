package com.marynails.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Entidad Servicio: cada objeto es una fila de la tabla "servicio".
 * Son los servicios que ofrece Mary (por ejemplo, un semipermanente).
 */
@Entity
@Table(name = "servicio")
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede pasar de 100 letras")
    private String nombre;

    // Uso BigDecimal (y no double) porque es plata y asi no hay errores de redondeo
    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor que cero")
    private BigDecimal precio;

    @NotBlank(message = "La familia es obligatoria")
    @Pattern(regexp = "TRADICIONAL|SEMIPERMANENTE|MIXTO|SOFT_GEL|RESINA",
            message = "La familia debe ser TRADICIONAL, SEMIPERMANENTE, MIXTO, SOFT_GEL o RESINA")
    private String familia;

    @NotNull(message = "La duración es obligatoria")
    @Positive(message = "La duración debe ser mayor que cero")
    private Short duracionMin;

    // Constructor vacio: JPA lo necesita para crear los objetos
    public Servicio() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }

    public String getFamilia() { return familia; }
    public void setFamilia(String familia) { this.familia = familia; }

    public Short getDuracionMin() { return duracionMin; }
    public void setDuracionMin(Short duracionMin) { this.duracionMin = duracionMin; }
}
