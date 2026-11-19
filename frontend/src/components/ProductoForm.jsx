import { useState } from 'react'
import { X } from 'lucide-react'
import { api } from '../api.js'

const MODOS = [
  ['MANUAL', 'Manual', 'Lo ajustas tú a mano (colores, decoración, ocasionales).'],
  ['CONSUMO', 'Por arreglos', 'Se gasta con cada cita atendida. Ej.: la base rinde unos 25 arreglos.'],
  ['TIEMPO', 'Por tiempo', 'Se renueva cada tantos días. Ej.: la lima metálica cada 45 días.'],
]
const UNIDADES = ['unidad', 'ml', 'L', 'g', 'paquete', 'caja']
const ACABADOS = ['CREMOSO', 'PERLADO', 'TRASLUCIDO', 'METALIZADO', 'FOTOCROMATICO', 'DECORACION']
const FAMILIAS = ['blanco', 'nude', 'rosado', 'rojo', 'vino', 'naranja', 'amarillo', 'verde', 'azul', 'morado', 'gris', 'negro', 'café', 'dorado', 'plateado']

const vacio = {
  tipo: 'PRODUCTO', nombre: '', categoria: '', categoriaNueva: '', modoControl: 'MANUAL', presentacion: '', unidad: 'unidad',
  rendimiento: '', stockActual: 0, stockMinimo: 0, esCritico: false, esHabitual: false, imagenUrl: '', respaldo: false,
  linea: '', lineaNueva: '', codigo: '', acabado: 'CREMOSO', familiaColor: '', hex: '#e8a8be',
}

/** Ventana para agregar un producto o un color nuevo, o para corregir los datos de uno existente. */
export default function ProductoForm({ producto, categorias, lineas, onCerrar, onGuardado }) {
  const editando = Boolean(producto)
  const [f, setF] = useState(() => producto ? {
    ...vacio, ...producto, tipo: producto.linea ? 'COLOR' : 'PRODUCTO',
    presentacion: producto.presentacion ?? '', rendimiento: producto.rendimiento ?? '', unidad: producto.unidad ?? 'unidad',
    imagenUrl: producto.imagenUrl ?? '', acabado: producto.acabado ?? 'CREMOSO', familiaColor: producto.familiaColor ?? '',
    hex: producto.hex ?? '#e8a8be', categoriaNueva: '', lineaNueva: '',
  } : { ...vacio })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const cambiar = (campo, valor) => setF((x) => ({ ...x, [campo]: valor }))
  const esColor = f.tipo === 'COLOR'

  async function guardar(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    const num = (v) => (v === '' || v === null ? null : Number(v))
    const datos = {
      nombre: f.nombre,
      categoria: esColor ? (editando ? f.categoria : 'Esmaltes') : (f.categoria === '__nueva' ? f.categoriaNueva : f.categoria),
      modoControl: f.modoControl, presentacion: num(f.presentacion), unidad: f.unidad,
      rendimiento: f.modoControl === 'MANUAL' ? null : num(f.rendimiento),
      stockActual: num(f.stockActual), stockMinimo: num(f.stockMinimo), esCritico: f.esCritico, esHabitual: f.esHabitual,
      imagenUrl: f.imagenUrl, respaldo: f.respaldo,
      ...(esColor ? {
        linea: f.linea === '__nueva' ? f.lineaNueva : f.linea, codigo: f.codigo, acabado: f.acabado,
        familiaColor: f.familiaColor, hex: f.hex,
      } : {}),
    }
    try {
      const r = editando ? await api.editarProducto(producto.id, datos) : await api.crearProducto(datos)
      onGuardado(r, editando)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  async function ocultar() {
    setError('')
    try {
      const r = await api.actualizar(producto.id, { activo: !producto.activo })
      onGuardado(r, true)
    } catch (err) { setError(err.message) }
  }

  const modo = MODOS.find((m) => m[0] === f.modoControl)

  return (
    <div className="velo" role="dialog" aria-modal="true" aria-label={editando ? 'Editar producto' : 'Agregar producto'}>
      <form className="ventana" onSubmit={guardar}>
        <div className="ventana-cab">
          <h3>{editando ? 'Editar producto' : 'Agregar al inventario'}</h3>
          <button type="button" className="icono" onClick={onCerrar} aria-label="Cerrar"><X size={18} /></button>
        </div>

        {!editando && (
          <div className="chips" role="group" aria-label="Tipo">
            <button type="button" className={!esColor ? 'chip activa' : 'chip'} onClick={() => cambiar('tipo', 'PRODUCTO')}>Producto o herramienta</button>
            <button type="button" className={esColor ? 'chip activa' : 'chip'} onClick={() => cambiar('tipo', 'COLOR')}>Color de esmalte</button>
          </div>
        )}

        {esColor ? (
          <>
            <div className="dos">
              <label className="campo">
                <span className="etiqueta-campo">Línea</span>
                <select id="pf-linea" value={f.linea} onChange={(e) => cambiar('linea', e.target.value)} required>
                  <option value="">Elige…</option>
                  {lineas.map((l) => <option key={l.nombre} value={l.nombre}>{l.nombre}</option>)}
                  <option value="__nueva">Otra marca…</option>
                </select>
              </label>
              <label className="campo">
                <span className="etiqueta-campo">Número o nombre</span>
                <input id="pf-codigo" value={f.codigo} onChange={(e) => cambiar('codigo', e.target.value)} placeholder="Ej.: 182" required />
              </label>
            </div>
            {f.linea === '__nueva' && (
              <label className="campo">
                <span className="etiqueta-campo">Nombre de la marca</span>
                <input id="pf-linea-nueva" value={f.lineaNueva} onChange={(e) => cambiar('lineaNueva', e.target.value)} placeholder="Ej.: Meali" required />
              </label>
            )}
            <div className="dos">
              <label className="campo">
                <span className="etiqueta-campo">Tono</span>
                <input id="pf-hex" type="color" value={f.hex} onChange={(e) => cambiar('hex', e.target.value)} style={{ height: 42, padding: 4 }} />
              </label>
              <label className="campo">
                <span className="etiqueta-campo">Familia de color</span>
                <select id="pf-familia" value={f.familiaColor} onChange={(e) => cambiar('familiaColor', e.target.value)}>
                  <option value="">Sin definir</option>
                  {FAMILIAS.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </label>
            </div>
            <label className="campo">
              <span className="etiqueta-campo">Acabado</span>
              <select id="pf-acabado" value={f.acabado} onChange={(e) => cambiar('acabado', e.target.value)}>
                {ACABADOS.map((a) => <option key={a} value={a}>{a.charAt(0) + a.slice(1).toLowerCase()}</option>)}
              </select>
            </label>
            {editando && (
              <label className="campo">
                <span className="etiqueta-campo">Nombre en el catálogo</span>
                <input id="pf-nombre" value={f.nombre} onChange={(e) => cambiar('nombre', e.target.value)} required />
              </label>
            )}
          </>
        ) : (
          <>
            <label className="campo">
              <span className="etiqueta-campo">Nombre</span>
              <input id="pf-nombre" value={f.nombre} onChange={(e) => cambiar('nombre', e.target.value)} placeholder="Ej.: Lima metálica" required />
            </label>
            <label className="campo">
              <span className="etiqueta-campo">Categoría</span>
              <select id="pf-categoria" value={f.categoria} onChange={(e) => cambiar('categoria', e.target.value)} required>
                <option value="">Elige…</option>
                {categorias.filter((c) => c.nombre !== 'Esmaltes').map((c) => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
                <option value="__nueva">Otra categoría…</option>
              </select>
            </label>
            {f.categoria === '__nueva' && (
              <label className="campo">
                <span className="etiqueta-campo">Nombre de la categoría</span>
                <input id="pf-categoria-nueva" value={f.categoriaNueva} onChange={(e) => cambiar('categoriaNueva', e.target.value)} required />
              </label>
            )}
          </>
        )}

        <div className="campo">
          <span className="etiqueta-campo">¿Cómo se gasta?</span>
          <div className="chips" role="group" aria-label="Modo de control">
            {MODOS.map(([v, t]) => (
              <button type="button" key={v} className={f.modoControl === v ? 'chip activa' : 'chip'} onClick={() => cambiar('modoControl', v)}>{t}</button>
            ))}
          </div>
          <small className="suave" style={{ fontWeight: 400 }}>{modo[2]}</small>
        </div>
        {f.modoControl !== 'MANUAL' && (
          <label className="campo">
            <span className="etiqueta-campo">{f.modoControl === 'CONSUMO' ? '¿Cuántos arreglos rinde cada uno?' : '¿Cada cuántos días se renueva?'}</span>
            <input id="pf-rendimiento" type="number" min="1" step="1" value={f.rendimiento} onChange={(e) => cambiar('rendimiento', e.target.value)} required />
          </label>
        )}

        <div className="dos">
          <label className="campo">
            <span className="etiqueta-campo">Presentación</span>
            <input id="pf-presentacion" type="number" min="0" step="0.5" value={f.presentacion} onChange={(e) => cambiar('presentacion', e.target.value)} placeholder="Ej.: 14" />
          </label>
          <label className="campo">
            <span className="etiqueta-campo">Unidad</span>
            <select id="pf-unidad" value={f.unidad} onChange={(e) => cambiar('unidad', e.target.value)}>
              {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </label>
        </div>

        <div className="dos">
          {!editando && (
            <label className="campo">
              <span className="etiqueta-campo">¿Cuántos tienes?</span>
              <input id="pf-stock" type="number" min="0" step="1" value={f.stockActual} onChange={(e) => cambiar('stockActual', e.target.value)} />
            </label>
          )}
          <label className="campo">
            <span className="etiqueta-campo">Mínimo antes de avisar</span>
            <input id="pf-minimo" type="number" min="0" step="1" value={f.stockMinimo} onChange={(e) => cambiar('stockMinimo', e.target.value)} />
          </label>
        </div>

        <label className="interruptor">
          <input id="pf-critico" type="checkbox" checked={f.esCritico} onChange={(e) => cambiar('esCritico', e.target.checked)} />
          Crítico: no puede faltar en la ruta (avisa al llegar al mínimo)
        </label>
        {!editando && (
          <label className="interruptor">
            <input id="pf-habitual" type="checkbox" checked={f.esHabitual} onChange={(e) => cambiar('esHabitual', e.target.checked)} />
            Habitual: lo uso siempre
          </label>
        )}

        <label className="interruptor">
          <input id="pf-respaldo" type="checkbox" checked={f.respaldo} onChange={(e) => cambiar('respaldo', e.target.checked)} />
          Compra de respaldo: reponerlo cada mes y medio aunque no se acabe
        </label>

        <label className="campo">
          <span className="etiqueta-campo">Imagen (opcional)</span>
          <input id="pf-imagen" value={f.imagenUrl} onChange={(e) => cambiar('imagenUrl', e.target.value)} placeholder="Enlace de la imagen" />
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <div className="acciones">
          <button className="primario" type="submit" disabled={enviando}>{enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Agregar'}</button>
          <button className="secundario" type="button" onClick={onCerrar}>Cancelar</button>
          {editando && (
            <button className="enlace-boton" type="button" onClick={ocultar}>
              {producto.activo ? 'Ocultar del catálogo' : 'Volver a mostrar'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
