package com.marynails;

import java.util.TimeZone;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MaryNailsApplication {
    public static void main(String[] args) {
        // "Hoy" debe ser el dia de Cucuta aunque el servidor (Render) este en hora UTC
        TimeZone.setDefault(TimeZone.getTimeZone("America/Bogota"));
        SpringApplication.run(MaryNailsApplication.class, args);
    }
}
