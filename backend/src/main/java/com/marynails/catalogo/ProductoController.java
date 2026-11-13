package com.marynails.catalogo;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ProductoController {

    private final ProductoRepository repo;
    private final ProductoService servicio;

    public ProductoController(ProductoRepository repo, ProductoService servicio) {
        this.repo = repo;
        this.servicio = servicio;
    }

    /** Catalogo con filtros: categoria, linea de color, solo habituales, solo los que tengo, busqueda por nombre. */
    @GetMapping("/productos")
    public Page<ProductoDto> listar(
            @RequestParam(defaultValue = "") String categoria,
            @RequestParam(defaultValue = "") String linea,
            @RequestParam(defaultValue = "false") boolean soloHabituales,
            @RequestParam(defaultValue = "false") boolean soloTengo,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "100") int tamano) {
        int t = Math.max(1, Math.min(tamano, 500));
        return repo.buscar(categoria.trim(), linea.trim(), soloHabituales, soloTengo, q.trim(),
                PageRequest.of(Math.max(0, pagina), t));
    }

    @GetMapping("/productos/{id}")
    public ProductoDto detalle(@PathVariable Long id) {
        return repo.detalle(id);
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
