import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { api } from '../api.js'
import { hoy, diaMes, pesos } from '../fechas.js'
import ListaCompras from './ListaCompras.jsx'

function Entrada() {
  const [productos, setProductos] = useState([])
  const [busca, setBusca] = useState('')
  const [lineas, setLineas] = useState([])
  const [proveedor, setProveedor] = useState('')
  const [fecha, setFecha] = useState(hoy())
  const [historial, setHistorial] = useState([])
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const cargarHistorial = () => {
    const h = hoy()
    api.compras(h.slice(0, 5) + '01-01', h).then(setHistorial).catch((e) => setError(e.message))
  }
  useEffect(cargarHistorial, [])
  useEffect(() => {
    if (busca.trim().length < 2) { setProductos([]); return }
    const t = setTimeout(() => api.productos({ q: busca, pagina: 0, tamano: 8 }).then((r) => setProductos(r.content)).catch(() => {}), 250)
    return () => clearTimeout(t)
  }, [busca])

  const nombre = (p) => (p.linea ? `${p.linea} ${p.codigo}` : p.nombre)
  const agregar = (p) => {
    if (!lineas.some((l) => l.id === p.id)) setLineas([...lineas, { id: p.id, nombre: nombre(p), cantidad: '1', costo: '' }])
    setBusca(''); setProductos([])
  }
  const cambiar = (id, k, v) => setLineas(lineas.map((l) => (l.id === id ? { ...l, [k]: v } : l)))
  const total = lineas.reduce((a, l) => a + Number(l.cantidad || 0) * Number(l.costo || 0), 0)

  async function guardar() {
    setError(''); setOk('')
    try {
      await api.registrarCompra({
        fecha, proveedor,
        detalles: lineas.map((l) => ({ productoId: l.id, cantidad: Number(l.cantidad), costoUnitario: Number(l.costo || 0) })),
      })
      setLineas([]); setProveedor(''); setOk('Compra registrada: el inventario ya subió.')
      cargarHistorial()
    } catch (e) { setError(e.message) }
  }

  return (
    <div>
      <div className="form-fila">
        <label>Fecha<input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></label>
        <label>Proveedor<input value={proveedor} onChange={(e) => setProveedor(e.target.value)} placeholder="Distribuidora" /></label>
      </div>
      <label className="campo-busca">Agregar producto
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Escribe el nombre o el código…" />
      </label>
      {productos.length > 0 && (
        <ul className="sugerencias">
          {productos.map((p) => <li key={p.id}><button onClick={() => agregar(p)}><Plus size={14} /> {nombre(p)}</button></li>)}
        </ul>
      )}

      {lineas.length > 0 && (
        <ul className="lineas">
          {lineas.map((l) => (
            <li key={l.id}>
              <span className="l-nombre">{l.nombre}</span>
              <label>Cant.<input type="number" min="1" step="1" value={l.cantidad} onChange={(e) => cambiar(l.id, 'cantidad', e.target.value)} /></label>
              <label>Costo c/u<input type="number" min="0" step="100" value={l.costo} onChange={(e) => cambiar(l.id, 'costo', e.target.value)} /></label>
              <button className="icono" aria-label="Quitar" onClick={() => setLineas(lineas.filter((x) => x.id !== l.id))}><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      {ok && <p className="exito">{ok}</p>}
      <div className="total-fila">
        <strong>Total: {pesos(total)}</strong>
        <button className="primario" disabled={lineas.length === 0} onClick={guardar}>Registrar compra</button>
      </div>

      <h3 className="sub">Compras de este año</h3>
      {historial.length === 0 && <p className="vacio">Aún no hay compras registradas.</p>}
      <ul className="historial">
        {historial.map((c) => (
          <li key={c.id}>
            <div><b>{diaMes(c.fecha)}</b> · {c.proveedor || 'Sin proveedor'} <strong className="derecha">{pesos(c.total)}</strong></div>
            <small className="suave">{c.detalles.map((d) => `${d.producto} x${Number(d.cantidad)}`).join(', ')}</small>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Compras() {
  const [sub, setSub] = useState('lista')
  return (
    <section>
      <div className="encabezado"><h2>Compras</h2></div>
      <div className="subtabs">
        <button className={sub === 'lista' ? 'chip activo' : 'chip'} onClick={() => setSub('lista')}>Por comprar</button>
        <button className={sub === 'entrada' ? 'chip activo' : 'chip'} onClick={() => setSub('entrada')}>Registrar compra</button>
      </div>
      {sub === 'lista' ? <ListaCompras /> : <Entrada />}
    </section>
  )
}
