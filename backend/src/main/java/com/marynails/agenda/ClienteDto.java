package com.marynails.agenda;

import java.time.LocalDate;

public record ClienteDto(Long id, String nombre, String telefono, String direccion, Long sectorId, String barrio,
                         String municipio, Short frecuenciaDias, String observaciones,
                         LocalDate ultimaCita, LocalDate proximaCita) {}
