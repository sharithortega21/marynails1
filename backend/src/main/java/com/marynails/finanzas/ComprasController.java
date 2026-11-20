package com.marynails.finanzas;

import com.marynails.finanzas.CompraService.CompraDto;
import com.marynails.finanzas.CompraService.CompraIn;
import java.time.LocalDate;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/** Rutas de las compras a la distribuidora. Las reglas estan en CompraService. */
@RestController
@RequestMapping("/api/compras")
public class ComprasController {

    private final CompraService compras;

    public ComprasController(CompraService compras) {
        this.compras = compras;
    }

    @GetMapping
    public List<CompraDto> listar(@RequestParam(required = false) LocalDate desde,
                                  @RequestParam(required = false) LocalDate hasta) {
        return compras.listar(desde, hasta);
    }

    @PostMapping
    public CompraDto registrar(@RequestBody CompraIn in) {
        return compras.registrar(in);
    }
}
