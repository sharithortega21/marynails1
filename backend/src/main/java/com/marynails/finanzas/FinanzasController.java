package com.marynails.finanzas;

import com.marynails.finanzas.FinanzasService.GastoDto;
import com.marynails.finanzas.FinanzasService.GastoIn;
import com.marynails.finanzas.FinanzasService.Resumen;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/** Rutas de gastos y resumen financiero (solo Mary). Las reglas estan en FinanzasService. */
@RestController
@RequestMapping("/api")
public class FinanzasController {

    private final FinanzasService finanzas;

    public FinanzasController(FinanzasService finanzas) {
        this.finanzas = finanzas;
    }

    @GetMapping("/gastos")
    public List<GastoDto> gastos(@RequestParam(required = false) LocalDate desde, @RequestParam(required = false) LocalDate hasta) {
        return finanzas.gastos(desde, hasta);
    }

    @PostMapping("/gastos")
    public GastoDto crearGasto(@RequestBody GastoIn in) {
        return finanzas.crearGasto(in);
    }

    @DeleteMapping("/gastos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrarGasto(@PathVariable Long id) {
        finanzas.borrarGasto(id);
    }

    @GetMapping("/finanzas/resumen")
    public Resumen resumen(@RequestParam(required = false) LocalDate desde, @RequestParam(required = false) LocalDate hasta) {
        return finanzas.resumen(desde, hasta);
    }
}
