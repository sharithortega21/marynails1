package com.marynails.compras;

import com.marynails.catalogo.ProductoDto;
import com.marynails.catalogo.ProductoRepository;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lista-compras")
public class ListaComprasController {

    private final ProductoRepository productos;

    public ListaComprasController(ProductoRepository productos) {
        this.productos = productos;
    }

    /** Productos habituales o criticos cuyo stock llego al minimo. */
    @GetMapping
    public List<ProductoDto> faltantes() {
        return productos.faltantes();
    }
}
