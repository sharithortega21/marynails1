package com.marynails.agenda;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Servicios, sectores, clientas y citas: lo necesario para llevar la agenda. */
@RestController
@RequestMapping("/api")
public class AgendaController {

    private static final Set<String> ESTADOS = Set.of("PROGRAMADA", "ATENDIDA", "CANCELADA", "NO_ASISTIO");
    private static final Set<String> LUGARES = Set.of("DOMICILIO", "CASA_MARY");
    private static final Set<String> MEDIOS = Set.of("EFECTIVO", "TRANSFERENCIA");
    private static final Set<Integer> FRECUENCIAS = Set.of(15, 20, 30, 45, 60);

    private final SectorRepository sectores;
    private final ServicioRepository servicios;
    private final ClienteRepository clientes;
    private final CitaRepository citas;

    public AgendaController(SectorRepository sectores, ServicioRepository servicios,
                            ClienteRepository clientes, CitaRepository citas) {
        this.sectores = sectores;
        this.servicios = servicios;
        this.clientes = clientes;
        this.citas = citas;
    }

    // ---------- servicios y sectores ----------

    public record ServicioDto(Long id, String nombre, BigDecimal precio, String familia, Short duracionMin) {}

    @GetMapping("/servicios")
    public List<ServicioDto> servicios() {
        return servicios.findAllByOrderByIdAsc().stream()
                .map(s -> new ServicioDto(s.getId(), s.getNombre(), s.getPrecio(), s.getFamilia(), s.getDuracionMin()))
                .toList();
    }

    public record SectorDto(Long id, String barrio, String municipio) {}

    @GetMapping("/sectores")
    public List<SectorDto> sectores() {
        return sectores.findAllByOrderByMunicipioAscBarrioAsc().stream()
                .map(s -> new SectorDto(s.getId(), s.getBarrio(), s.getMunicipio())).toList();
    }

    @PostMapping("/sectores")
    @Transactional
    public SectorDto crearSector(@RequestBody SectorDto in) {
        String barrio = texto(in.barrio(), "El barrio es obligatorio");
        String municipio = texto(in.municipio(), "El municipio es obligatorio");
        Sector existente = sectores.findAllByOrderByMunicipioAscBarrioAsc().stream()
                .filter(s -> s.getBarrio().equalsIgnoreCase(barrio) && s.getMunicipio().equalsIgnoreCase(municipio))
                .findFirst().orElse(null);
        Sector s = existente != null ? existente : sectores.save(new Sector(barrio, municipio));
        return new SectorDto(s.getId(), s.getBarrio(), s.getMunicipio());
    }

    // ---------- clientas ----------

    public record ClienteIn(String nombre, String telefono, String direccion, Long sectorId,
                            Integer frecuenciaDias, String observaciones) {}

    @GetMapping("/clientas")
    public List<ClienteDto> clientas() {
        return clientes.todas(LocalDate.now());
    }

    @PostMapping("/clientas")
    @Transactional
    public ClienteDto crearClienta(@RequestBody ClienteIn in) {
        Cliente c = new Cliente(texto(in.nombre(), "El nombre es obligatorio"));
        aplicar(c, in);
        clientes.saveAndFlush(c);
        return clientes.detalle(c.getId(), LocalDate.now());
    }

    @PatchMapping("/clientas/{id}")
    @Transactional
    public ClienteDto editarClienta(@PathVariable Long id, @RequestBody ClienteIn in) {
        Cliente c = clientes.findById(id).orElseThrow(() -> noExiste("Clienta"));
        if (in.nombre() != null) c.setNombre(texto(in.nombre(), "El nombre es obligatorio"));
        aplicar(c, in);
        clientes.flush();
        return clientes.detalle(id, LocalDate.now());
    }

    private void aplicar(Cliente c, ClienteIn in) {
        if (in.telefono() != null) c.setTelefono(limpio(in.telefono()));
        if (in.direccion() != null) c.setDireccion(limpio(in.direccion()));
        if (in.observaciones() != null) c.setObservaciones(limpio(in.observaciones()));
        if (in.sectorId() != null) {
            if (!sectores.existsById(in.sectorId())) throw malo("Ese sector no existe");
            c.setSectorId(in.sectorId());
        }
        if (in.frecuenciaDias() != null) {
            if (in.frecuenciaDias() == 0) c.setFrecuenciaDias(null);
            else if (!FRECUENCIAS.contains(in.frecuenciaDias())) throw malo("La frecuencia debe ser 15, 20, 30, 45 o 60 días");
            else c.setFrecuenciaDias(in.frecuenciaDias().shortValue());
        }
    }

    // ---------- citas ----------

    public record CitaNueva(Long clienteId, Long servicioId, LocalDate fecha, LocalTime hora, Integer turnos, String lugar,
                            String observaciones, BigDecimal precioCobrado) {}

    public record CitaCambios(Long servicioId, LocalDate fecha, LocalTime hora, Integer turnos, String lugar, String estado,
                              BigDecimal precioCobrado, BigDecimal extraDiseno, BigDecimal valorPagado,
                              String medioPago, String observaciones) {}

    /** Citas entre dos fechas (inclusive); por defecto, la semana actual. */
    @GetMapping("/citas")
    public List<CitaDto> citas(@RequestParam(required = false) LocalDate desde,
                               @RequestParam(required = false) LocalDate hasta) {
        LocalDate d = desde != null ? desde : LocalDate.now().with(java.time.DayOfWeek.MONDAY);
        LocalDate h = hasta != null ? hasta : d.plusDays(6);
        if (h.isBefore(d) || d.plusDays(120).isBefore(h)) throw malo("El rango de fechas no es válido");
        return citas.entre(d, h);
    }

    @PostMapping("/citas")
    @Transactional
    public CitaDto crearCita(@RequestBody CitaNueva in) {
        if (in.clienteId() == null || !clientes.existsById(in.clienteId())) throw malo("Elige una clienta");
        Servicio s = in.servicioId() == null ? null : servicios.findById(in.servicioId()).orElse(null);
        if (s == null) throw malo("Elige un servicio");
        if (in.fecha() == null) throw malo("Elige la fecha");
        if (in.hora() == null) throw malo("Elige la hora");
        int turnos = in.turnos() == null ? 1 : turnos(in.turnos());
        BigDecimal precio = in.precioCobrado() != null ? noNegativo(in.precioCobrado())
                : s.getPrecio().multiply(BigDecimal.valueOf(turnos));
        Cita c = new Cita(in.clienteId(), s.getId(), in.fecha(), in.hora(), precio);
        c.setTurnos((short) turnos);
        if (in.lugar() != null) c.setLugar(valido(in.lugar(), LUGARES, "El lugar no es válido"));
        if (in.observaciones() != null) c.setObservaciones(limpio(in.observaciones()));
        citas.saveAndFlush(c);
        return citas.detalle(c.getId());
    }

    @PatchMapping("/citas/{id}")
    @Transactional
    public CitaDto cambiarCita(@PathVariable Long id, @RequestBody CitaCambios in) {
        Cita c = citas.findById(id).orElseThrow(() -> noExiste("Cita"));
        if (in.servicioId() != null || in.turnos() != null) {
            Servicio s = servicios.findById(in.servicioId() != null ? in.servicioId() : c.getServicioId())
                    .orElseThrow(() -> malo("Ese servicio no existe"));
            c.setServicioId(s.getId());
            if (in.turnos() != null) c.setTurnos((short) turnos(in.turnos()));
            if (in.precioCobrado() == null) c.setPrecioCobrado(s.getPrecio().multiply(BigDecimal.valueOf(c.getTurnos())));
        }
        if (in.fecha() != null) c.setFecha(in.fecha());
        if (in.hora() != null) c.setHora(in.hora());
        if (in.lugar() != null) c.setLugar(valido(in.lugar(), LUGARES, "El lugar no es válido"));
        if (in.estado() != null) c.setEstado(valido(in.estado(), ESTADOS, "El estado no es válido"));
        if (in.precioCobrado() != null) c.setPrecioCobrado(noNegativo(in.precioCobrado()));
        if (in.extraDiseno() != null) c.setExtraDiseno(noNegativo(in.extraDiseno()));
        if (in.valorPagado() != null) c.setValorPagado(noNegativo(in.valorPagado()));
        if (in.medioPago() != null) c.setMedioPago(in.medioPago().isBlank() ? null : valido(in.medioPago(), MEDIOS, "El medio de pago no es válido"));
        if (in.observaciones() != null) c.setObservaciones(limpio(in.observaciones()));
        citas.flush();
        return citas.detalle(id);
    }

    @DeleteMapping("/citas/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrarCita(@PathVariable Long id) {
        if (!citas.existsById(id)) throw noExiste("Cita");
        citas.deleteById(id);
    }

    // ---------- ayudas ----------

    private static String texto(String v, String mensaje) {
        if (v == null || v.isBlank()) throw malo(mensaje);
        return v.trim();
    }

    private static String limpio(String v) {
        return v.isBlank() ? null : v.trim();
    }

    private static String valido(String v, Set<String> permitidos, String mensaje) {
        if (!permitidos.contains(v)) throw malo(mensaje);
        return v;
    }

    private static int turnos(Integer v) {
        if (v < 1 || v > 30) throw malo("Los turnos deben ser entre 1 y 30");
        return v;
    }

    private static BigDecimal noNegativo(BigDecimal v) {
        if (v.signum() < 0) throw malo("El valor no puede ser negativo");
        return v;
    }

    private static ResponseStatusException malo(String m) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, m);
    }

    private static ResponseStatusException noExiste(String que) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, que + " no encontrada");
    }
}
