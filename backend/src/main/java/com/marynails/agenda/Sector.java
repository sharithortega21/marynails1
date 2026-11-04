package com.marynails.agenda;

import jakarta.persistence.*;

@Entity
@Table(name = "sector")
public class Sector {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String barrio;
    private String municipio;

    protected Sector() {}

    public Sector(String barrio, String municipio) {
        this.barrio = barrio;
        this.municipio = municipio;
    }

    public Long getId() { return id; }
    public String getBarrio() { return barrio; }
    public String getMunicipio() { return municipio; }
}
