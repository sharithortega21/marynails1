package com.marynails.service;

import com.marynails.agenda.CitaRepository;
import com.marynails.model.Servicio;
import com.marynails.repository.ServicioRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

/** Aqui van las reglas del negocio de los servicios. */
@Service
public class ServicioService {

    private final ServicioRepository repository;
    private final CitaRepository citas;

    // Spring nos entrega el repository y el de citas ya armados (inyeccion de dependencias)
    public ServicioService(ServicioRepository repository, CitaRepository citas) {
        this.repository = repository;
        this.citas = citas;
    }

    public List<Servicio> listar() {
        return repository.findAllByOrderByIdAsc();
    }

    public Optional<Servicio> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public List<Servicio> buscarPorNombre(String texto) {
        return repository.findByNombreContainingIgnoreCase(texto);
    }

    public Servicio crear(Servicio servicio) {
        servicio.setId(null); // asi siempre se crea uno nuevo
        servicio.setNombre(servicio.getNombre().trim());
        // Regla de negocio: no puede haber dos servicios con el mismo nombre
        if (repository.existsByNombreIgnoreCase(servicio.getNombre())) {
            throw new IllegalArgumentException("Ya existe un servicio con ese nombre");
        }
        return repository.save(servicio);
    }

    public Optional<Servicio> actualizar(Long id, Servicio datos) {
        return repository.findById(id).map(existente -> {
            String nombre = datos.getNombre().trim();
            if (repository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
                throw new IllegalArgumentException("Ya existe otro servicio con ese nombre");
            }
            existente.setNombre(nombre);
            existente.setPrecio(datos.getPrecio());
            existente.setFamilia(datos.getFamilia());
            existente.setDuracionMin(datos.getDuracionMin());
            return repository.save(existente);
        });
    }

    public boolean eliminar(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        // Regla de negocio: si ya hay citas con este servicio no se puede borrar
        if (citas.existsByServicioId(id)) {
            throw new IllegalArgumentException("No se puede eliminar: hay citas que usan este servicio");
        }
        repository.deleteById(id);
        return true;
    }
}
