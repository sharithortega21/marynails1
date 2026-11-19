package com.marynails.catalogo;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ColorRepository extends JpaRepository<Color, Long> {

    boolean existsByLineaIgnoreCaseAndCodigoIgnoreCase(String linea, String codigo);

    boolean existsByLineaIgnoreCaseAndCodigoIgnoreCaseAndProductoIdNot(String linea, String codigo, Long productoId);
}
