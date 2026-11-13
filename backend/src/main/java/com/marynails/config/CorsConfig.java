package com.marynails.config;

import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * CORS: el permiso que le da el servidor al frontend (que corre en otra direccion)
 * para hacerle peticiones. Las direcciones permitidas salen de la variable FRONTEND_URL.
 */
@Configuration
public class CorsConfig {

    // El nombre del bean debe ser corsConfigurationSource: asi Spring Security lo encuentra solo
    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value("${app.frontend-url}") String origenes) {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowedOrigins(Arrays.stream(origenes.split(",")).map(String::trim).toList());
        c.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        c.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        UrlBasedCorsConfigurationSource fuente = new UrlBasedCorsConfigurationSource();
        fuente.registerCorsConfiguration("/**", c);
        return fuente;
    }
}
