package com.marynails;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.concurrent.ThreadLocalRandom;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * Pruebas de integracion de la API contra PostgreSQL real (Flyway aplica todas las migraciones).
 * Base: DB_URL (por defecto jdbc:postgresql://localhost:5432/mn_ci). En GitHub Actions corre con un
 * contenedor de PostgreSQL 16. Cada prueba usa nombres y fechas propias para no chocar con las demas.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/mn_ci}",
        "app.demo-datos=false",
        "spring.jpa.show-sql=false",
        "app.inicial.mary-correo=mary@prueba.com", "app.inicial.mary-clave=Prueba12345",
        "app.inicial.admin-correo=sharith@prueba.com", "app.inicial.admin-clave=Prueba12345"})
class MaryNailsApiTest {

    @LocalServerPort
    int puerto;

    @Autowired
    JdbcTemplate jdbc;

    final HttpClient http = HttpClient.newHttpClient();
    final JsonMapper json = JsonMapper.builder().build();
    String mary;
    String sharith;

    record Respuesta(int estado, String cuerpo) {
        JsonNode json() {
            return JsonMapper.builder().build().readTree(cuerpo);
        }
    }

    @BeforeEach
    void entrar() throws Exception {
        mary = login("mary@prueba.com").json().get("token").asString();
        sharith = login("sharith@prueba.com").json().get("token").asString();
    }

    // ---------- ayudas ----------

    Respuesta login(String correo) throws Exception {
        return pedir("POST", "/api/auth/login", null, "{\"correo\":\"" + correo + "\",\"clave\":\"Prueba12345\"}");
    }

    Respuesta pedir(String metodo, String ruta, String token, String cuerpo) throws Exception {
        HttpRequest.Builder b = HttpRequest.newBuilder(URI.create("http://localhost:" + puerto + ruta))
                .header("Content-Type", "application/json")
                .method(metodo, cuerpo == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(cuerpo));
        if (token != null) b.header("Authorization", "Bearer " + token);
        HttpResponse<String> r = http.send(b.build(), HttpResponse.BodyHandlers.ofString());
        return new Respuesta(r.statusCode(), r.body());
    }

    /** Una fecha lejana y distinta para cada prueba, asi las citas nunca se cruzan entre pruebas. */
    static LocalDate diaLibre() {
        return LocalDate.of(2031, 1, 1).plusDays(ThreadLocalRandom.current().nextInt(0, 3000));
    }

    long nuevaClienta(String nombre) throws Exception {
        Respuesta r = pedir("POST", "/api/clientas", mary, "{\"nombre\":\"" + nombre + "\",\"telefono\":\"3001234567\"}");
        assertThat(r.estado()).as(r.cuerpo()).isBetween(200, 201);
        return r.json().get("id").asLong();
    }

    long servicio(String nombre) {
        return jdbc.queryForObject("select id from servicio where nombre = ?", Long.class, nombre);
    }

    long producto(String nombre) {
        return jdbc.queryForObject("select id from producto where nombre = ?", Long.class, nombre);
    }

    BigDecimal stock(long productoId) {
        return jdbc.queryForObject("select stock_actual from producto where id = ?", BigDecimal.class, productoId);
    }

    Respuesta nuevaCita(long clienta, long servicio, LocalDate fecha, String hora) throws Exception {
        return pedir("POST", "/api/citas", mary, "{\"clienteId\":" + clienta + ",\"servicioId\":" + servicio
                + ",\"fecha\":\"" + fecha + "\",\"hora\":\"" + hora + "\"}");
    }

    // ---------- seguridad ----------

    @Test
    @DisplayName("Sin token la API responde 401 y con una clave mala tambien")
    void sinTokenNoEntra() throws Exception {
        assertThat(pedir("GET", "/api/productos", null, null).estado()).isEqualTo(401);
        assertThat(pedir("POST", "/api/auth/login", null, "{\"correo\":\"mary@prueba.com\",\"clave\":\"mala\"}").estado()).isEqualTo(401);
    }

    @Test
    @DisplayName("Sharith no ve clientas ni finanzas, y en la agenda no ve dinero ni telefonos")
    void rolesSeparados() throws Exception {
        assertThat(pedir("GET", "/api/clientas", sharith, null).estado()).isEqualTo(403);
        assertThat(pedir("GET", "/api/finanzas/resumen?desde=2031-01-01&hasta=2031-01-31", sharith, null).estado()).isEqualTo(403);
        assertThat(pedir("GET", "/api/productos", sharith, null).estado()).isEqualTo(200);

        LocalDate dia = diaLibre();
        long c = nuevaClienta("Clienta Roles " + dia);
        assertThat(nuevaCita(c, servicio("Uñas tradicional dama (manos y pies)"), dia, "09:00").estado()).isBetween(200, 201);
        JsonNode cita = pedir("GET", "/api/citas?desde=" + dia + "&hasta=" + dia, sharith, null).json().get(0);
        assertThat(cita.get("telefono").isNull()).isTrue();
        assertThat(cita.get("precioCobrado").isNull()).isTrue();
        assertThat(pedir("PATCH", "/api/citas/" + cita.get("id").asLong(), sharith, "{\"estado\":\"ATENDIDA\"}").estado()).isEqualTo(403);
    }

    // ---------- agenda ----------

    @Test
    @DisplayName("Dos citas que se cruzan no se pueden guardar")
    void citasNoSeCruzan() throws Exception {
        LocalDate dia = diaLibre();
        long c = nuevaClienta("Clienta Cruce " + dia);
        long s = servicio("Uñas tradicional dama (manos y pies)");
        assertThat(nuevaCita(c, s, dia, "10:00").estado()).isBetween(200, 201);
        Respuesta cruce = nuevaCita(c, s, dia, "10:30");
        assertThat(cruce.estado()).isEqualTo(400);
        assertThat(cruce.cuerpo()).contains("Se cruza");
        assertThat(nuevaCita(c, s, dia, "18:00").estado()).isBetween(200, 201);
    }

    @Test
    @DisplayName("Atender descuenta la receta una sola vez y volver a programada lo devuelve")
    void descuentoIdempotente() throws Exception {
        long top = producto("Top coat (brillo semipermanente)");
        pedir("PATCH", "/api/productos/" + top, mary, "{\"stockActual\":5}");
        BigDecimal antes = stock(top);
        LocalDate dia = diaLibre();
        long c = nuevaClienta("Clienta Insumos " + dia);
        long cita = nuevaCita(c, servicio("Semipermanente dama (manos y pies)"), dia, "08:00").json().get("id").asLong();

        pedir("PATCH", "/api/citas/" + cita, mary, "{\"estado\":\"ATENDIDA\"}");
        BigDecimal despues = stock(top);
        assertThat(despues).isLessThan(antes);
        pedir("PATCH", "/api/citas/" + cita, mary, "{\"estado\":\"ATENDIDA\"}"); // marcar dos veces no descuenta dos veces
        assertThat(stock(top)).isEqualByComparingTo(despues);
        pedir("PATCH", "/api/citas/" + cita, mary, "{\"estado\":\"PROGRAMADA\"}");
        assertThat(stock(top)).isEqualByComparingTo(antes);
    }

    // ---------- clientas ----------

    @Test
    @DisplayName("Los datos de salud solo se guardan con la autorizacion de la clienta (Ley 1581)")
    void saludConAutorizacion() throws Exception {
        long c = nuevaClienta("Clienta Salud " + diaLibre());
        assertThat(pedir("PATCH", "/api/clientas/" + c, mary, "{\"salud\":\"Alergia al acrilico\"}").estado()).isEqualTo(400);
        Respuesta ok = pedir("PATCH", "/api/clientas/" + c, mary, "{\"salud\":\"Alergia al acrilico\",\"autorizaSalud\":true}");
        assertThat(ok.estado()).isEqualTo(200);
        assertThat(ok.json().get("salud").asString()).isEqualTo("Alergia al acrilico");
    }

    // ---------- inventario ----------

    @Test
    @DisplayName("No se puede crear un producto con un nombre que ya existe")
    void productoDuplicado() throws Exception {
        String cuerpo = "{\"nombre\":\"Top coat (brillo semipermanente)\",\"categoria\":\"Semipermanente\",\"modoControl\":\"MANUAL\"}";
        Respuesta r = pedir("POST", "/api/productos", sharith, cuerpo);
        assertThat(r.estado()).isEqualTo(400);
        assertThat(r.cuerpo()).contains("Ya existe");
    }

    @Test
    @DisplayName("Por clientas: quedan stock x clientas que dura, y avisa cuando se acaba")
    void prediccionPorClientas() throws Exception {
        long base = producto("Base semipermanente (Rubber o 7 en 1)"); // dura 25 clientas
        pedir("PATCH", "/api/productos/" + base, mary, "{\"stockActual\":2}");
        JsonNode lista = pedir("GET", "/api/prediccion", sharith, null).json();
        JsonNode fila = null;
        for (JsonNode n : lista) if (n.get("productoId").asLong() == base) fila = n;
        assertThat(fila).isNotNull();
        assertThat(fila.get("clientasRestantes").asInt()).isEqualTo(50);

        pedir("PATCH", "/api/productos/" + base, mary, "{\"stockActual\":0}");
        for (JsonNode n : pedir("GET", "/api/prediccion", mary, null).json()) {
            if (n.get("productoId").asLong() == base) assertThat(n.get("estado").asString()).isEqualTo("AGOTADO");
        }
    }
}
