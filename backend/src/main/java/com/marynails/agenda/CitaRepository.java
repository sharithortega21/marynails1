package com.marynails.agenda;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CitaRepository extends JpaRepository<Cita, Long> {

    String CAMPOS = """
            select new com.marynails.agenda.CitaDto(
                c.id, c.clienteId, cl.nombre, cl.telefono, s.barrio, s.municipio, cl.direccion,
                c.servicioId, sv.nombre, sv.duracionMin, c.fecha, c.hora, c.turnos, c.lugar, c.estado,
                c.precioCobrado, c.extraDiseno, c.valorPagado, c.medioPago, c.observaciones)
            from Cita c join Cliente cl on cl.id = c.clienteId join Servicio sv on sv.id = c.servicioId
            left join Sector s on s.id = cl.sectorId
            """;

    @Query(CAMPOS + " where c.fecha between :desde and :hasta order by c.fecha, c.hora, c.id")
    List<CitaDto> entre(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query(CAMPOS + " where c.id = :id")
    CitaDto detalle(@Param("id") Long id);
}
