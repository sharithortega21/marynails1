package com.marynails.auth;

import jakarta.persistence.*;

@Entity
@Table(name = "usuario")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String correo;
    private String claveHash;
    private String rol;

    protected Usuario() {}

    public Usuario(String nombre, String correo, String claveHash, String rol) {
        this.nombre = nombre;
        this.correo = correo;
        this.claveHash = claveHash;
        this.rol = rol;
    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getCorreo() { return correo; }
    public String getClaveHash() { return claveHash; }
    public String getRol() { return rol; }
}
