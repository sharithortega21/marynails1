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

    public Color(Long productoId) { this.productoId = productoId; }

    public String getLinea() { return linea; }
    public void setLinea(String v) { this.linea = v; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String v) { this.codigo = v; }
    public void setAcabado(String v) { this.acabado = v; }
    public void setFamiliaColor(String v) { this.familiaColor = v; }
    public void setHex(String v) { this.hex = v; }
}
