import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { api } from '../api.js'
import { diaMes } from '../fechas.js'

/** Productos estándar (limas, stickers, decorativos) que se reponen cada mes y medio aunque no se hayan acabado. */
export default function CompraRespaldo() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.compraRespaldo().then(setItems).catch((e) => setError(e.message)).finally(() => setCargando(false))
  }, [])

  async function aLista(ids) {
    setError('')
    try {
      await Promise.all(ids.map((id) => api.actualizar(id, { porComprar: 1 })))
      setItems((prev) => prev.map((x) => (ids.includes(x.productoId) ? { ...x, enLista: true } : x)))
    } catch (e) { setError(e.message) }
  }

  const pendientes = items.filter((i) => !i.enLista).map((i) => i.productoId)

  return (
    <section>
      <div className="encabezado encabezado-accion">
        <div>
          <h2>Compra de respaldo</h2>
          <p className="suave">Productos estándar que se reponen cada mes y medio aunque no se hayan acabado. Márcalos en el catálogo con «Compra de respaldo».</p>
        </div>
        {pendientes.length > 0 && <button className="primario" onClick={() => aLista(pendientes)}><ShoppingCart size={16} /> Pasar todo a la lista</button>}
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {cargando && <p className="vacio">Cargando…</p>}
      {!cargando && items.length === 0 && <p className="vacio">Nada por reponer: todo se compró hace menos de mes y medio.</p>}
      <ul className="lista">
        {items.map((i) => (
          <li key={i.productoId}>
            <div>
              <strong>{i.nombre}</strong>
              <div className="suave">{i.categoria} · {i.ultimaCompra ? `última compra el ${diaMes(i.ultimaCompra)} (hace ${i.diasDesdeCompra} días)` : 'sin compras registradas'} · tienes {Number(i.stockActual)}</div>
            </div>
            {i.enLista
              ? <span className="etiqueta">En la lista</span>
              : <button className="secundario pequeno" onClick={() => aLista([i.productoId])}><ShoppingCart size={14} /> A la lista</button>}
          </li>
        ))}
      </ul>
    </section>
  )
}
