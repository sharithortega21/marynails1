package com.marynails.agenda;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record CitaDto(Long id, Long clienteId, String cliente, String telefono, String barrio, String municipio,
                      String direccion, Long servicioId, String servicio, Short duracionMin, LocalDate fecha,
                      LocalTime hora, Short turnos, String lugar, String estado, BigDecimal precioCobrado, BigDecimal extraDiseno,
                      BigDecimal valorPagado, String medioPago, String observaciones) {}
