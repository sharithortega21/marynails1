package com.marynails.agenda;

import static com.marynails.agenda.Reglas.limpio;
import static com.marynails.agenda.Reglas.malo;
import static com.marynails.agenda.Reglas.noExiste;
import static com.marynails.agenda.Reglas.texto;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Reglas de negocio de las clientas y sus sectores (barrios). */
@Service
public class ClientaService {

    private static final Set<Integer> FRECUENCIAS = Set.of(15, 20, 30, 45, 60);

    public record SectorDto(Long id, String barrio, String municipio) {}

    public record ClienteIn(String nombre, String telefono, String direccion, Long sectorId,
                            Integer frecuenciaDias, String observaciones, String salud, Boolean autorizaSalud,
                            LocalDate recordatorioFecha, String recordatorioTexto, Boolean quitarRecordatorio) {}

    private final SectorRepository sectores;
    private final ClienteRepository clientes;
    private final CitaRepository citas;

    public ClientaService(SectorRepository sectores, ClienteRepository clientes, CitaRepository citas) {
        this.sectores = sectores;
        this.clientes = clientes;
        this.citas = citas;
    }

    // ---------- sectores ----------

    public List<SectorDto> sectores() {
        return sectores.findAllByOrderByMunicipioAscBarrioAsc().stream()
                .map(s -> new SectorDto(s.getId(), s.getBarrio(), s.getMunicipio())).toList();
    }

    /** Crea el barrio; si ya existe (sin importar mayusculas), devuelve el existente. */
    @Transactional
    public SectorDto crearSector(SectorDto in) {
        String barrio = texto(in.barrio(), "El barrio es obligatorio");
        String municipio = texto(in.municipio(), "El municipio es obligatorio");
        Sector existente = sectores.findAllByOrderByMunicipioAscBarrioAsc().stream()
                .filter(s -> s.getBarrio().equalsIgnoreCase(barrio) && s.getMunicipio().equalsIgnoreCase(municipio))
                .findFirst().orElse(null);
        Sector s = existente != null ? existente : sectores.save(new Sector(barrio, municipio));
        return new SectorDto(s.getId(), s.getBarrio(), s.getMunicipio());
    }

    // ---------- clientas ----------

    public List<ClienteDto> todas() {
        return clientes.todas(LocalDate.now());
    }

    @Transactional
    public ClienteDto crear(ClienteIn in) {
        Cliente c = new Cliente(texto(in.nombre(), "El nombre es obligatorio"));
        aplicar(c, in);
        clientes.saveAndFlush(c);
        return clientes.detalle(c.getId(), LocalDate.now());
    }

    @Transactional
    public ClienteDto editar(Long id, ClienteIn in) {
        Cliente c = clientes.findById(id).orElseThrow(() -> noExiste("Clienta"));
        if (in.nombre() != null) c.setNombre(texto(in.nombre(), "El nombre es obligatorio"));
        aplicar(c, in);
        clientes.flush();
        return clientes.detalle(id, LocalDate.now());
    }

    /** Historial de servicios de una clienta, de la cita mas reciente a la mas antigua. */
    public List<CitaDto> historial(Long id) {
        if (!clientes.existsById(id)) throw noExiste("Clienta");
        return citas.deClienta(id);
    }

    /** Aplica solo los campos que llegaron. Salud: solo con autorizacion (Ley 1581 de 2012). */
    private void aplicar(Cliente c, ClienteIn in) {
        if (in.telefono() != null) c.setTelefono(limpio(in.telefono()));
        if (in.direccion() != null) c.setDireccion(limpio(in.direccion()));
        if (in.observaciones() != null) c.setObservaciones(limpio(in.observaciones()));
        if (in.autorizaSalud() != null) c.setAutorizaSalud(in.autorizaSalud());
        if (in.salud() != null) {
            String salud = limpio(in.salud());
            if (salud != null && salud.length() > 300) throw malo("Los datos de salud son muy largos (máximo 300 letras)");
            if (salud != null && !c.isAutorizaSalud()) {
                throw malo("Para guardar datos de salud la clienta debe autorizarlo (Ley 1581 de 2012)");
            }
            c.setSalud(salud);
        }
        if (!c.isAutorizaSalud()) c.setSalud(null); // si retira la autorizacion, se borran
        if (Boolean.TRUE.equals(in.quitarRecordatorio())) {
            c.setRecordatorioFecha(null);
            c.setRecordatorioTexto(null);
        } else if (in.recordatorioFecha() != null || in.recordatorioTexto() != null) {
            String texto = in.recordatorioTexto() == null ? null : limpio(in.recordatorioTexto());
            if (texto != null && texto.length() > 200) throw malo("El recordatorio es muy largo (máximo 200 letras)");
            if (in.recordatorioFecha() == null || texto == null) throw malo("El recordatorio necesita fecha y texto");
            c.setRecordatorioFecha(in.recordatorioFecha());
            c.setRecordatorioTexto(texto);
        }
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
}
