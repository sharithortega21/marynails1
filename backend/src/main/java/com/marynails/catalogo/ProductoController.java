package com.marynails.catalogo;

import org.springframework.http.HttpStatus;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ProductoController {

    private final ProductoRepository repo;
    private final ProductoService servicio;
    private final InventarioService inventario;

    public ProductoController(ProductoRepository repo, ProductoService servicio, InventarioService inventario) {
        this.repo = repo;
        this.servicio = servicio;
        this.inventario = inventario;
    }

    /** "La renové hoy" para productos que se gastan por tiempo (limas, alcohol, algodón...). */
    @PostMapping("/productos/{id}/renovar")
    public ProductoDto renovar(@PathVariable Long id) {
        return inventario.renovar(id);
    }

    /** Productos por tiempo que ya toca renovar (o les faltan 3 días o menos). */
    @GetMapping("/por-renovar")
    public List<InventarioService.PorRenovar> porRenovar() {
        return inventario.porRenovar();
    }

    /** Compra de respaldo: productos estándar que toca reponer cada mes y medio. */
    @GetMapping("/prediccion")
    public List<InventarioService.Prediccion> prediccion() {
        return inventario.prediccion();
    }

    @GetMapping("/compra-respaldo")
    public List<InventarioService.Respaldo> compraRespaldo() {
        return inventario.compraRespaldo();
    }

    /** Lista del maletín para un día (por defecto mañana). */
    @GetMapping("/maletin")
    public List<InventarioService.ItemMaletin> maletin(@RequestParam(required = false) java.time.LocalDate fecha) {
        return inventario.maletin(fecha != null ? fecha : java.time.LocalDate.now().plusDays(1));
    }

    /** Catalogo con filtros: categoria, linea de color, solo habituales, solo los que tengo, busqueda por nombre. */
    @GetMapping("/productos")
    public Page<ProductoDto> listar(
            @RequestParam(defaultValue = "") String categoria,
            @RequestParam(defaultValue = "") String linea,
            @RequestParam(defaultValue = "false") boolean soloHabituales,
            @RequestParam(defaultValue = "false") boolean soloTengo,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "false") boolean ocultos,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "100") int tamano) {
        int t = Math.max(1, Math.min(tamano, 500));
        return repo.buscar(categoria.trim(), linea.trim(), soloHabituales, soloTengo, q.trim(), ocultos,
                PageRequest.of(Math.max(0, pagina), t));
    }

    @GetMapping("/productos/{id}")
    public ProductoDto detalle(@PathVariable Long id) {
        return repo.detalle(id);
    }

    /** Agrega un producto o un color nuevo al inventario. */
    @PostMapping("/productos")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductoDto crear(@RequestBody ProductoService.Datos datos) {
        return servicio.crear(datos);
    }

    /** Corrige los datos de un producto (nombre, categoría, modo, rendimiento, color...). */
    @PutMapping("/productos/{id}")
    public ProductoDto editar(@PathVariable Long id, @RequestBody ProductoService.Datos datos) {
        return servicio.editar(id, datos);
    }

    @PatchMapping("/productos/{id}")
    public ProductoDto actualizar(@PathVariable Long id, @RequestBody ProductoService.Cambios cambios) {
        return servicio.actualizar(id, cambios);
    }

    @GetMapping("/categorias")
    public List<ConteoDto> categorias() {
        return repo.categorias().stream().map(c -> new ConteoDto(c.getNombre(), c.getTotal(), c.getTengo())).toList();
    }

    @GetMapping("/lineas-color")
    public List<ConteoDto> lineas() {
        return repo.lineas().stream().map(c -> new ConteoDto(c.getNombre(), c.getTotal(), c.getTengo())).toList();
    }

    public record ConteoDto(String nombre, long total, long tengo) {}
}
