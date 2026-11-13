package com.marynails.repository;

import com.marynails.model.Servicio;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Habla con la tabla servicio. No escribimos SQL: Spring arma las consultas
 * a partir del nombre de cada metodo.
 */
public interface ServicioRepository extends JpaRepository<Servicio, Long> {

    // Todos los servicios, del primero al ultimo
    List<Servicio> findAllByOrderByIdAsc();

    // Busqueda por nombre sin importar mayusculas
    List<Servicio> findByNombreContainingIgnoreCase(String nombre);

    // Para no repetir nombres al crear
    boolean existsByNombreIgnoreCase(String nombre);

    // Para no repetir nombres al actualizar (se ignora el mismo servicio)
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
}
