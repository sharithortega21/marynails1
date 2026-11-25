package com.marynails.demo;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/** Modo demostracion (feria): saber si esta activo y reiniciar los datos de ejemplo con fechas desde hoy. */
@RestController
@RequestMapping("/api/demo")
public class DemoController {

    private final DemoService demo;

    public DemoController(DemoService demo) {
        this.demo = demo;
    }

    @GetMapping
    public Map<String, Boolean> estado() {
        return Map.of("activo", demo.activo(), "reiniciable", demo.reiniciable());
    }

    @PostMapping("/reiniciar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reiniciar() {
        demo.reiniciar();
    }
}
