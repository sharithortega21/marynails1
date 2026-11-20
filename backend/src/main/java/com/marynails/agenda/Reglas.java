package com.marynails.agenda;

import java.math.BigDecimal;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Validaciones comunes de la agenda. Cada una lanza 400 con un mensaje que se muestra tal cual. */
final class Reglas {

    private Reglas() {}

    static String texto(String v, String mensaje) {
        if (v == null || v.isBlank()) throw malo(mensaje);
        return v.trim();
    }

    static String limpio(String v) {
        return v.isBlank() ? null : v.trim();
    }

    static String valido(String v, Set<String> permitidos, String mensaje) {
        if (!permitidos.contains(v)) throw malo(mensaje);
        return v;
    }

    static int turnos(Integer v) {
        if (v < 1 || v > 30) throw malo("Los turnos deben ser entre 1 y 30");
        return v;
    }

    static BigDecimal noNegativo(BigDecimal v) {
        if (v.signum() < 0) throw malo("El valor no puede ser negativo");
        return v;
    }

    static ResponseStatusException malo(String m) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, m);
    }

    static ResponseStatusException noExiste(String que) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, que + " no encontrada");
    }
}
