package com.marynails.catalogo;

import java.math.BigDecimal;

/** Un producto del catalogo; si es un esmalte trae ademas los datos de su color. */
public record ProductoDto(
        Long id, String nombre, String categoria, String modoControl,
        BigDecimal presentacion, String unidad, BigDecimal rendimiento,
        BigDecimal stockActual, BigDecimal stockMinimo, BigDecimal cantidadHabitual, boolean esHabitual, boolean esCritico,
        String imagenUrl, String linea, String codigo, String acabado, String familiaColor) {}
