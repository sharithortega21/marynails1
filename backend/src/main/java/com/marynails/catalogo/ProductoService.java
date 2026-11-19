package com.marynails.catalogo;

import java.math.BigDecimal;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProductoService {

    /** Cambios parciales: solo se actualizan los campos que vienen. */
    public record Cambios(Boolean esHabitual, Boolean esCritico, BigDecimal stockActual, BigDecimal stockMinimo,
                         BigDecimal cantidadHabitual, BigDecimal porComprar, Boolean activo) {}

    /**
     * Datos completos de un producto. Si trae linea y codigo, el producto es un color de esmalte.
     * modoControl: MANUAL (se ajusta a mano), CONSUMO (rendimiento = arreglos que rinde)
     * o TIEMPO (rendimiento = dias que dura antes de renovarlo).
     */
    public record Datos(String nombre, String categoria, String modoControl, BigDecimal presentacion, String unidad,
                        BigDecimal rendimiento, BigDecimal stockActual, BigDecimal stockMinimo, Boolean esCritico,
                        Boolean esHabitual, String imagenUrl, Boolean respaldo,
                        String linea, String codigo, String acabado, String familiaColor, String hex) {}

    private static final Set<String> MODOS = Set.of("MANUAL", "CONSUMO", "TIEMPO");

    private final ProductoRepository productos;
    private final MovimientoRepository movimientos;
    private final ColorRepository colores;

    public ProductoService(ProductoRepository productos, MovimientoRepository movimientos, ColorRepository colores) {
        this.productos = productos;
        this.movimientos = movimientos;
        this.colores = colores;
    }

    @Transactional
    public ProductoDto crear(Datos d) {
        boolean esColor = !vacio(d.linea());
        String nombre = esColor && vacio(d.nombre()) ? d.linea().trim() + " " + texto(d.codigo()) : texto(d.nombre());
        validar(d, nombre, null);
        Producto p = new Producto(nombre, esColor && vacio(d.categoria()) ? "Esmaltes" : d.categoria().trim());
        aplicar(p, d);
        if (d.esHabitual() != null) p.setEsHabitual(d.esHabitual());
        BigDecimal stock = d.stockActual() == null ? BigDecimal.ZERO : d.stockActual();
        validarNoNegativo(stock);
        p.setStockActual(stock);
        p = productos.saveAndFlush(p);
        if (stock.signum() > 0) movimientos.save(new Movimiento(p.getId(), "AJUSTE", stock));
        if (esColor) {
            Color c = new Color(p.getId());
            aplicarColor(c, d);
            colores.save(c);
        }
        productos.flush();
        return productos.detalle(p.getId());
    }

    @Transactional
    public ProductoDto editar(Long id, Datos d) {
        Producto p = productos.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        Color c = colores.findById(id).orElse(null);
        String nombre = texto(d.nombre());
        if (c != null && vacio(d.linea())) throw malo("Un color debe tener su línea (Gelpolish, Masglo...)");
        validar(d, nombre, id);
        p.setNombre(nombre);
        p.setCategoria(d.categoria().trim());
        aplicar(p, d);
        if (c != null) aplicarColor(c, d);
        productos.flush();
        return productos.detalle(id);
    }

    private void validar(Datos d, String nombre, Long id) {
        if (!vacio(d.linea())) {
            if (vacio(d.codigo())) throw malo("Escribe el número o nombre del color");
            boolean colorRepetido = id == null
                    ? colores.existsByLineaIgnoreCaseAndCodigoIgnoreCase(d.linea().trim(), d.codigo().trim())
                    : colores.existsByLineaIgnoreCaseAndCodigoIgnoreCaseAndProductoIdNot(d.linea().trim(), d.codigo().trim(), id);
            if (colorRepetido) throw malo("Ese color ya está en el catálogo");
            if (!vacio(d.hex()) && !d.hex().trim().toLowerCase().matches("^#[0-9a-f]{6}$")) throw malo("El tono no es válido");
        }
        if (nombre.isEmpty()) throw malo("Escribe el nombre del producto");
        if (nombre.length() > 120) throw malo("El nombre es muy largo (máximo 120 letras)");
        boolean repetido = id == null ? productos.existsByNombreIgnoreCase(nombre)
                : productos.existsByNombreIgnoreCaseAndIdNot(nombre, id);
        if (repetido) throw malo("Ya existe un producto con ese nombre");
        if (vacio(d.linea()) && vacio(d.categoria())) throw malo("Elige la categoría");
        String modo = vacio(d.modoControl()) ? "MANUAL" : d.modoControl().trim().toUpperCase();
        if (!MODOS.contains(modo)) throw malo("El modo de control debe ser manual, por arreglos o por tiempo");
        if (!"MANUAL".equals(modo) && (d.rendimiento() == null || d.rendimiento().signum() <= 0)) {
            throw malo("CONSUMO".equals(modo) ? "Escribe cuántos arreglos rinde" : "Escribe cada cuántos días se renueva");
        }
        if (d.presentacion() != null) validarNoNegativo(d.presentacion());
        if (d.stockMinimo() != null) validarNoNegativo(d.stockMinimo());
    }

    private void aplicar(Producto p, Datos d) {
        String modo = vacio(d.modoControl()) ? "MANUAL" : d.modoControl().trim().toUpperCase();
        p.setModoControl(modo);
        p.setRendimiento("MANUAL".equals(modo) ? null : d.rendimiento());
        p.setPresentacion(d.presentacion());
        p.setUnidad(vacio(d.unidad()) ? null : d.unidad().trim());
        if (d.stockMinimo() != null) p.setStockMinimo(d.stockMinimo());
        if (d.esCritico() != null) p.setEsCritico(d.esCritico());
        p.setImagenUrl(vacio(d.imagenUrl()) ? null : d.imagenUrl().trim());
        if (d.respaldo() != null) p.setRespaldo(d.respaldo());
    }

    private static void aplicarColor(Color c, Datos d) {
        c.setLinea(d.linea().trim());
        c.setCodigo(d.codigo().trim());
        c.setAcabado(vacio(d.acabado()) ? null : d.acabado().trim().toUpperCase());
        c.setFamiliaColor(vacio(d.familiaColor()) ? null : d.familiaColor().trim().toLowerCase());
        c.setHex(vacio(d.hex()) ? null : d.hex().trim().toLowerCase());
    }

    private static boolean vacio(String s) { return s == null || s.isBlank(); }

    private static String texto(String s) { return s == null ? "" : s.trim(); }

    private static ResponseStatusException malo(String msg) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
    }

    @Transactional
    public ProductoDto actualizar(Long id, Cambios c) {
        Producto p = productos.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        if (c.esHabitual() != null) p.setEsHabitual(c.esHabitual());
        if (c.esCritico() != null) p.setEsCritico(c.esCritico());
        if (c.activo() != null) p.setActivo(c.activo());
        if (c.stockMinimo() != null) {
            validarNoNegativo(c.stockMinimo());
            p.setStockMinimo(c.stockMinimo());
        }
        if (c.cantidadHabitual() != null) {
            validarNoNegativo(c.cantidadHabitual());
            p.setCantidadHabitual(c.cantidadHabitual());
        }
        if (c.porComprar() != null) {
            validarNoNegativo(c.porComprar());
            p.setPorComprar(c.porComprar());
        }
        if (c.stockActual() != null) {
            validarNoNegativo(c.stockActual());
            BigDecimal diferencia = c.stockActual().subtract(p.getStockActual());
            if (diferencia.signum() != 0) {
                movimientos.save(new Movimiento(p.getId(), "AJUSTE", diferencia));
                p.setStockActual(c.stockActual());
            }
        }
        productos.flush();
        return productos.detalle(id);
    }

    private void validarNoNegativo(BigDecimal v) {
        if (v.signum() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El valor no puede ser negativo");
        }
    }
}
