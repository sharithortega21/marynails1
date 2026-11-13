package com.marynails.agenda;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    String CAMPOS = """
            select new com.marynails.agenda.ClienteDto(
                c.id, c.nombre, c.telefono, c.direccion, c.sectorId, s.barrio, s.municipio,
                c.frecuenciaDias, c.observaciones,
                (select max(ci.fecha) from Cita ci where ci.clienteId = c.id and ci.estado = 'ATENDIDA'),
                (select min(ci.fecha) from Cita ci where ci.clienteId = c.id and ci.estado = 'PROGRAMADA' and ci.fecha >= :hoy))
            from Cliente c left join Sector s on s.id = c.sectorId
            """;

    @Query(CAMPOS + " order by lower(c.nombre)")
    List<ClienteDto> todas(@Param("hoy") LocalDate hoy);

    @Query(CAMPOS + " where c.id = :id")
    ClienteDto detalle(@Param("id") Long id, @Param("hoy") LocalDate hoy);
}
