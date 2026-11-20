package com.marynails.agenda;

import com.marynails.agenda.CitaService.CitaCambios;
import com.marynails.agenda.CitaService.CitaNueva;
import com.marynails.agenda.ClientaService.ClienteIn;
import com.marynails.agenda.ClientaService.SectorDto;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Rutas de la agenda: sectores, clientas y citas. Solo recibe la peticion y responde;
 * las reglas estan en ClientaService y CitaService.
 */
@RestController
@RequestMapping("/api")
public class AgendaController {

    private final ClientaService clientas;
    private final CitaService citas;

    public AgendaController(ClientaService clientas, CitaService citas) {
        this.clientas = clientas;
        this.citas = citas;
    }

    // ---------- sectores ----------

    @GetMapping("/sectores")
    public List<SectorDto> sectores() {
        return clientas.sectores();
    }

    @PostMapping("/sectores")
    public SectorDto crearSector(@RequestBody SectorDto in) {
        return clientas.crearSector(in);
    }

    // ---------- clientas ----------

    @GetMapping("/clientas")
    public List<ClienteDto> clientas() {
        return clientas.todas();
    }

    @PostMapping("/clientas")
    public ClienteDto crearClienta(@RequestBody ClienteIn in) {
        return clientas.crear(in);
    }

    @GetMapping("/clientas/{id}/citas")
    public List<CitaDto> historial(@PathVariable Long id) {
        return clientas.historial(id);
    }

    @PatchMapping("/clientas/{id}")
    public ClienteDto editarClienta(@PathVariable Long id, @RequestBody ClienteIn in) {
        return clientas.editar(id, in);
    }

    // ---------- citas ----------

    /** Citas entre dos fechas; Sharith las recibe sin datos privados. */
    @GetMapping("/citas")
    public List<CitaDto> citas(@RequestParam(required = false) LocalDate desde,
                               @RequestParam(required = false) LocalDate hasta,
                               Authentication quien) {
        boolean esMary = quien != null && quien.getAuthorities().stream()
                .anyMatch(a -> "ROLE_PROPIETARIA".equals(a.getAuthority()));
        return citas.entre(desde, hasta, esMary);
    }

    @PostMapping("/citas")
    public CitaDto crearCita(@RequestBody CitaNueva in) {
        return citas.crear(in);
    }

    @PatchMapping("/citas/{id}")
    public CitaDto cambiarCita(@PathVariable Long id, @RequestBody CitaCambios in) {
        return citas.cambiar(id, in);
    }

    /** A quien ofrecerle el cupo de una cita cancelada. */
    @GetMapping("/citas/{id}/sugerencias")
    public List<CitaService.Sugerencia> sugerencias(@PathVariable Long id) {
        return citas.sugerenciasCupo(id);
    }

    /** Reglas de la agenda que el formulario muestra (por ahora, el maximo de personas por dia). */
    @GetMapping("/agenda/reglas")
    public java.util.Map<String, Integer> reglas() {
        return java.util.Map.of("maximoDia", citas.maximoDia());
    }

    @DeleteMapping("/citas/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrarCita(@PathVariable Long id) {
        citas.borrar(id);
    }
}
