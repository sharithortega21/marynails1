package com.marynails.catalogo;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);


    String CAMPOS = """
            select new com.marynails.catalogo.ProductoDto(
                p.id, p.nombre, p.categoria, p.modoControl, p.presentacion, p.unidad, p.rendimiento,
                p.stockActual, p.stockMinimo, p.cantidadHabitual, p.porComprar, p.esHabitual, p.esCritico, p.imagenUrl,
                c.linea, c.codigo, c.acabado, c.familiaColor, c.hex, p.activo, p.enUsoDesde, p.respaldo)
            from Producto p left join Color c on c.productoId = p.id
            """;

    /** Filtros con texto vacio = sin filtro (evita parametros nulos en PostgreSQL). */
    @Query(value = CAMPOS + """
            where (:ocultos = true or p.activo = true)
              and (:categoria = '' or p.categoria = :categoria)
              and (:linea = '' or c.linea = :linea)
              and (:soloHabituales = false or p.esHabitual = true)
              and (:soloTengo = false or p.stockActual > 0)
              and (:q = '' or lower(p.nombre) like lower(concat('%', :q, '%')))
            order by p.categoria, c.linea, p.nombre
            """,
            countQuery = """
            select count(p) from Producto p left join Color c on c.productoId = p.id
            where (:ocultos = true or p.activo = true)
              and (:categoria = '' or p.categoria = :categoria)
              and (:linea = '' or c.linea = :linea)
              and (:soloHabituales = false or p.esHabitual = true)
              and (:soloTengo = false or p.stockActual > 0)
              and (:q = '' or lower(p.nombre) like lower(concat('%', :q, '%')))
            """)
    Page<ProductoDto> buscar(@Param("categoria") String categoria, @Param("linea") String linea,
                             @Param("soloHabituales") boolean soloHabituales,
                             @Param("soloTengo") boolean soloTengo,
                             @Param("q") String q, @Param("ocultos") boolean ocultos, Pageable pageable);

    @Query(CAMPOS + " where p.id = :id")
    ProductoDto detalle(@Param("id") Long id);

    @Query(CAMPOS + """
            where p.activo = true and (p.porComprar > 0
               or (p.esHabitual = true and p.stockActual < p.cantidadHabitual)
               or (p.esCritico = true and p.stockActual <= p.stockMinimo))
            order by p.esCritico desc, p.categoria, p.nombre
            """)
    List<ProductoDto> faltantes();

    /** Productos por tiempo que ya cumplieron sus dias de uso (o estan a 3 dias de cumplirlos). */
    @Query(CAMPOS + """
            where p.activo = true and p.modoControl = 'TIEMPO' and p.enUsoDesde is not null and p.rendimiento is not null
            order by p.enUsoDesde
            """)
    List<ProductoDto> enUsoPorTiempo();

    interface Conteo {
        String getNombre();
        long getTotal();
        long getTengo();
    }

    @Query("""
            select p.categoria as nombre, count(p) as total,
                   sum(case when p.stockActual > 0 then 1 else 0 end) as tengo
            from Producto p where p.activo = true group by p.categoria order by p.categoria
            """)
    List<Conteo> categorias();

    @Query("""
            select c.linea as nombre, count(c) as total,
                   sum(case when p.stockActual > 0 then 1 else 0 end) as tengo
            from Color c join Producto p on p.id = c.productoId where p.activo = true group by c.linea order by c.linea
            """)
    List<Conteo> lineas();
}
