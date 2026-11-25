package com.marynails.auth;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Limite de intentos de inicio de sesion por correo: despues de N claves malas seguidas,
 * ese correo queda bloqueado unos minutos. Evita que alguien pruebe claves sin parar.
 * Se guarda en memoria: si el servidor se reinicia, los contadores empiezan de cero.
 */
@Component
public class IntentosLogin {

    private record Registro(int fallos, Instant bloqueadoHasta) {}

    private final Map<String, Registro> registros = new ConcurrentHashMap<>();
    private final int maximo;
    private final Duration bloqueo;

    public IntentosLogin(@Value("${app.login.intentos:5}") int maximo,
                         @Value("${app.login.bloqueo-minutos:15}") long minutos) {
        this.maximo = maximo;
        this.bloqueo = Duration.ofMinutes(minutos);
    }

    private static String clave(String correo) {
        return correo == null ? "" : correo.trim().toLowerCase(Locale.ROOT);
    }

    /** Minutos que faltan si el correo esta bloqueado; 0 si puede intentar. */
    public long minutosBloqueado(String correo) {
        Registro r = registros.get(clave(correo));
        if (r == null || r.bloqueadoHasta() == null) return 0;
        long seg = Duration.between(Instant.now(), r.bloqueadoHasta()).getSeconds();
        if (seg <= 0) {
            registros.remove(clave(correo));
            return 0;
        }
        return Math.max(1, (seg + 59) / 60);
    }

    public void fallo(String correo) {
        registros.compute(clave(correo), (k, r) -> {
            int n = (r == null ? 0 : r.fallos()) + 1;
            return n >= maximo ? new Registro(0, Instant.now().plus(bloqueo)) : new Registro(n, null);
        });
    }

    public void exito(String correo) {
        registros.remove(clave(correo));
    }
}
