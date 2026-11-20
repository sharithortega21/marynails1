package com.marynails.agenda;

import static com.marynails.agenda.Reglas.limpio;
import static com.marynails.agenda.Reglas.malo;
import static com.marynails.agenda.Reglas.noExiste;
import static com.marynails.agenda.Reglas.noNegativo;
import static com.marynails.agenda.Reglas.turnos;
import static com.marynails.agenda.Reglas.valido;

import com.marynails.catalogo.InventarioService;
import com.marynails.model.Servicio;
import com.marynails.repository.ServicioRepository;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Reglas de negocio de las citas: precio, estados, cruces de horario, cobro y descuento de insumos. */
@Service
public class CitaService {

    private static final Set<String> ESTADOS = Set.of("PROGRAMADA", "ATENDIDA", "CANCELADA", "NO_ASISTIO");
    private static final Set<String> LUGARES = Set.of("DOMICILIO", "CASA_MARY");
    private static final Set<String> MEDIOS = Set.of("EFECTIVO", "TRANSFERENCIA", "MIXTO");

    public record CitaNueva(Long clienteId, Long servicioId, LocalDate fecha, LocalTime hora, Integer turnos, String lugar,
                            String observaciones, BigDecimal precioCobrado) {}

    public record CitaCambios(Long servicioId, LocalDate fecha, LocalTime hora, Integer turnos, String lugar, String estado,
                              BigDecimal precioCobrado, BigDecimal extraDiseno, BigDecimal valorPagado,
                              String medioPago, String observaciones) {}

    private final ServicioRepository servicios;
    private final ClienteRepository clientes;
    private final CitaRepository citas;
    private final InventarioService inventario;
    /** Maximo de personas (turnos) que Mary atiende en un dia: 2 o 3 en la manana y 2 o 3 en la tarde. */
    private final int maximoDia;

    public CitaService(ServicioRepository servicios, ClienteRepository clientes, CitaRepository citas,
                       InventarioService inventario, @Value("${app.agenda.maximo-dia:6}") int maximoDia) {
        this.servicios = servicios;
        this.clientes = clientes;
        this.citas = citas;
        this.inventario = inventario;
        this.maximoDia = maximoDia;
    }

    public int maximoDia() {
        return maximoDia;
    }

    /**
     * Citas entre dos fechas (inclusive); por defecto, la semana actual.
     * Si quien consulta no es Mary, se quitan telefono, direccion, valores, notas y salud.
     */
    public List<CitaDto> entre(LocalDate desde, LocalDate hasta, boolean esMary) {
        LocalDate d = desde != null ? desde : LocalDate.now().with(DayOfWeek.MONDAY);
        LocalDate h = hasta != null ? hasta : d.plusDays(6);
        if (h.isBefore(d) || d.plusDays(120).isBefore(h)) throw malo("El rango de fechas no es válido");
        List<CitaDto> lista = citas.entre(d, h);
        if (esMary) return lista;
        return lista.stream().map(c -> new CitaDto(c.id(), c.clienteId(), c.cliente(), null, c.barrio(), c.municipio(),
                null, c.servicioId(), c.servicio(), c.duracionMin(), c.fecha(), c.hora(), c.turnos(), c.lugar(),
                c.estado(), null, null, null, null, null, null)).toList();
    }

    @Transactional
    public CitaDto crear(CitaNueva in) {
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
        validarCruce(null, c.getFecha(), c.getHora(), duracion(s, turnos));
        validarCupo(null, c.getFecha(), turnos);
        citas.saveAndFlush(c);
        return citas.detalle(c.getId());
    }

    @Transactional
    public CitaDto cambiar(Long id, CitaCambios in) {
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
        if (in.medioPago() != null) {
            c.setMedioPago(in.medioPago().isBlank() ? null : valido(in.medioPago(), MEDIOS, "El medio de pago no es válido"));
        }
        if (in.observaciones() != null) c.setObservaciones(limpio(in.observaciones()));
        boolean mueveHorario = in.fecha() != null || in.hora() != null || in.turnos() != null || in.servicioId() != null
                || "PROGRAMADA".equals(in.estado());
        if (mueveHorario && !"CANCELADA".equals(c.getEstado()) && !"NO_ASISTIO".equals(c.getEstado())) {
            Servicio s = servicios.findById(c.getServicioId()).orElseThrow(() -> malo("Ese servicio no existe"));
            validarCruce(id, c.getFecha(), c.getHora(), duracion(s, c.getTurnos()));
            validarCupo(id, c.getFecha(), c.getTurnos());
        }
        citas.flush();
        // Gasto por clientas: si quedo atendida descuenta la receta; si no, devuelve lo descontado
        inventario.sincronizarCita(id, c.getServicioId(), c.getTurnos(), "ATENDIDA".equals(c.getEstado()));
        return citas.detalle(id);
    }

    @Transactional
    public void borrar(Long id) {
        if (!citas.existsById(id)) throw noExiste("Cita");
        inventario.devolver(id);
        citas.deleteById(id);
    }

    // ---------- cupo liberado ----------

    public record Sugerencia(ClienteDto clienta, boolean mismoBarrio, boolean leToca, Long diasDesdeUltima) {}

    /**
     * Cuando una cita se cancela o la clienta no vino, a quien ofrecerle ese cupo:
     * clientas sin cita programada, primero las del mismo barrio, luego las del mismo municipio,
     * y dentro de cada grupo primero a las que ya les toca segun su frecuencia.
     */
    public List<Sugerencia> sugerenciasCupo(Long id) {
        Cita c = citas.findById(id).orElseThrow(() -> noExiste("Cita"));
        if (!"CANCELADA".equals(c.getEstado()) && !"NO_ASISTIO".equals(c.getEstado())) {
            throw malo("Solo se ofrece el cupo de una cita cancelada o en la que la clienta no vino");
        }
        LocalDate hoy = LocalDate.now();
        List<ClienteDto> todas = clientes.todas(hoy);
        ClienteDto duena = todas.stream().filter(x -> x.id().equals(c.getClienteId())).findFirst().orElse(null);
        Long sector = duena == null ? null : duena.sectorId();
        String municipio = duena == null ? null : duena.municipio();
        return todas.stream()
                .filter(x -> !x.id().equals(c.getClienteId()))
                .filter(x -> x.proximaCita() == null)
                .filter(x -> municipio == null || municipio.equals(x.municipio()))
                .map(x -> {
                    Long dias = x.ultimaCita() == null ? null : java.time.temporal.ChronoUnit.DAYS.between(x.ultimaCita(), c.getFecha());
                    boolean toca = x.frecuenciaDias() != null && dias != null && dias >= x.frecuenciaDias();
                    return new Sugerencia(x, sector != null && sector.equals(x.sectorId()), toca, dias);
                })
                .sorted(java.util.Comparator.comparing((Sugerencia g) -> !g.mismoBarrio())
                        .thenComparing(g -> !g.leToca())
                        .thenComparing(g -> g.diasDesdeUltima() == null ? -1 : -g.diasDesdeUltima()))
                .limit(8)
                .toList();
    }

    private static int duracion(Servicio s, int turnos) {
        int min = s.getDuracionMin() == null ? 60 : s.getDuracionMin();
        return min * Math.max(1, turnos);
    }

    /**
     * Regla: dos citas activas (programadas o atendidas) no pueden cruzarse en el mismo dia.
     * Una cita ocupa desde su hora hasta su hora + duracion del servicio x turnos.
     */
    private void validarCruce(Long idPropio, LocalDate fecha, LocalTime hora, int minutos) {
        int inicio = hora.toSecondOfDay() / 60;
        int fin = inicio + minutos;
        for (CitaDto otra : citas.entre(fecha, fecha)) {
            if (otra.id().equals(idPropio)) continue;
            if (!"PROGRAMADA".equals(otra.estado()) && !"ATENDIDA".equals(otra.estado())) continue;
            int oi = otra.hora().toSecondOfDay() / 60;
            int dur = (otra.duracionMin() == null ? 60 : otra.duracionMin()) * Math.max(1, otra.turnos());
            int of = oi + dur;
            if (inicio < of && oi < fin) {
                throw malo("Se cruza con la cita de " + otra.cliente() + " (" + reloj(oi) + " a " + reloj(of)
                        + "). Elige otra hora.");
            }
        }
    }

    /** Regla: maximo de personas por dia (suma de turnos de las citas programadas o atendidas). */
    private void validarCupo(Long idPropio, LocalDate fecha, int turnos) {
        int ocupados = citas.entre(fecha, fecha).stream()
                .filter(o -> !o.id().equals(idPropio))
                .filter(o -> "PROGRAMADA".equals(o.estado()) || "ATENDIDA".equals(o.estado()))
                .mapToInt(o -> o.turnos() == null ? 1 : o.turnos())
                .sum();
        if (ocupados + turnos > maximoDia) {
            int libres = Math.max(0, maximoDia - ocupados);
            throw malo("Ese día ya tiene " + ocupados + (ocupados == 1 ? " persona" : " personas") + " y el máximo es "
                    + maximoDia + (libres == 0 ? ". Elige otro día." : ": solo queda cupo para " + libres + "."));
        }
    }

    private static String reloj(int minutos) {
        int h = (minutos / 60) % 24;
        int m = minutos % 60;
        String sufijo = h < 12 ? "a. m." : "p. m.";
        int h12 = h % 12 == 0 ? 12 : h % 12;
        return h12 + ":" + (m < 10 ? "0" : "") + m + " " + sufijo;
    }
}
