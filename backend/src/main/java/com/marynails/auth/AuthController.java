package com.marynails.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public record LoginRequest(@NotBlank String correo, @NotBlank String clave) {}
    public record LoginResponse(String token, String nombre, String rol) {}
    public record CambioClave(@NotBlank String actual, @NotBlank String nueva) {}

    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final JwtEncoder jwt;
    private final long horas;

    private final IntentosLogin intentos;

    public AuthController(UsuarioRepository usuarios, PasswordEncoder encoder, JwtEncoder jwt,
                          @Value("${app.jwt.horas}") long horas, IntentosLogin intentos) {
        this.intentos = intentos;
        this.usuarios = usuarios;
        this.encoder = encoder;
        this.jwt = jwt;
        this.horas = horas;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        long espera = intentos.minutosBloqueado(req.correo());
        if (espera > 0) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Demasiados intentos con clave incorrecta. Espera " + espera + (espera == 1 ? " minuto" : " minutos") + " e inténtalo de nuevo.");
        }
        Usuario u = usuarios.findByCorreoIgnoreCase(req.correo().trim())
                .filter(x -> encoder.matches(req.clave(), x.getClaveHash()))
                .orElse(null);
        if (u == null) {
            intentos.fallo(req.correo());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Correo o clave incorrectos");
        }
        intentos.exito(req.correo());
        Instant ahora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(u.getCorreo())
                .issuedAt(ahora)
                .expiresAt(ahora.plus(horas, ChronoUnit.HOURS))
                .claim("rol", u.getRol())
                .claim("nombre", u.getNombre())
                .build();
        String token = jwt.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
        return new LoginResponse(token, u.getNombre(), u.getRol());
    }

    /**
     * Cambiar la propia clave (Mary o Sharith, ya con sesion). Se usa al pasar a produccion para
     * reemplazar las claves iniciales. Pide la clave actual y una nueva de al menos 10 caracteres.
     */
    @PostMapping("/clave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void cambiarClave(@Valid @RequestBody CambioClave req, Authentication auth) {
        Usuario u = usuarios.findByCorreoIgnoreCase(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vuelve a iniciar sesión"));
        if (!encoder.matches(req.actual(), u.getClaveHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La clave actual no es correcta");
        }
        String nueva = req.nueva();
        if (nueva.length() < 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La clave nueva debe tener al menos 10 caracteres");
        }
        if (nueva.equals(req.actual())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La clave nueva debe ser distinta de la actual");
        }
        u.setClaveHash(encoder.encode(nueva));
        usuarios.save(u);
    }
}
