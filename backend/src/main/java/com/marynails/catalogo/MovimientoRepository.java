package com.marynails.catalogo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {

    List<Movimiento> findByCitaIdAndTipo(Long citaId, String tipo);
}
