package com.marynails.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Crea a Sharith (ADMIN) y a Mary (PROPIETARIA) la primera vez, con claves tomadas de variables de entorno. */
@Component
public class UsuariosIniciales implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(UsuariosIniciales.class);

    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;
    private final String adminCorreo, adminClave, maryCorreo, maryClave;

    public UsuariosIniciales(UsuarioRepository repo, PasswordEncoder encoder,
                             @Value("${app.inicial.admin-correo}") String adminCorreo,
                             @Value("${app.inicial.admin-clave}") String adminClave,
                             @Value("${app.inicial.mary-correo}") String maryCorreo,
                             @Value("${app.inicial.mary-clave}") String maryClave) {
        this.repo = repo;
        this.encoder = encoder;
        this.adminCorreo = adminCorreo;
        this.adminClave = adminClave;
        this.maryCorreo = maryCorreo;
        this.maryClave = maryClave;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (repo.count() > 0) return;
        if (!adminCorreo.isBlank() && !adminClave.isBlank()) {
            repo.save(new Usuario("Sharith", adminCorreo, encoder.encode(adminClave), "ADMIN"));
            log.info("Usuario ADMIN creado");
        }
        if (!maryCorreo.isBlank() && !maryClave.isBlank()) {
            repo.save(new Usuario("Mary", maryCorreo, encoder.encode(maryClave), "PROPIETARIA"));
            log.info("Usuario PROPIETARIA creado");
        }
    }
}
