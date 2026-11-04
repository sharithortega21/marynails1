package com.marynails.catalogo;

import jakarta.persistence.*;

@Entity
@Table(name = "color")
public class Color {
    @Id
    private Long productoId;
    private String linea;
    private String codigo;
    private String acabado;
    private String familiaColor;
    private String hex;

    protected Color() {}
}
