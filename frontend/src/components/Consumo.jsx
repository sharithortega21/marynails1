import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { api } from '../api.js'
import { diaMes, nombreDia } from '../fechas.js'

const ESTADOS = {
  AGOTADO: ['Se acabó', 'estado-mal'],
  PRONTO: ['Compra ya', 'estado-mal'],
  ATENTO: ['En 2 semanas', 'estado-aviso'],
  BIEN: ['Alcanza', 'estado-ok'],
  SIN_USO: ['Sin citas', ''],
}

function cuando(p) {
  if (p.diasRestantes == null) return 'Sin citas que lo usen: no se puede calcular'
  if (p.diasRestantes <= 0) return 'Ya no queda'
  if (p.diasRestantes === 1) return 'Se acaba mañana'
  if (p.diasRestantes <= 7) return `Se acaba el ${nombreDia(p.seAcaba).toLowerCase()} ${diaMes(p.seAcaba)}`
  return `Se acaba cerca del ${diaMes(p.seAcaba)} (en ${p.diasRestantes} días)`
}

/**
 * ¿Cuándo se acaba? Con lo que Mary puso en cada producto ("me dura 30 clientas" o "lo compro cada mes")
 * y los turnos de la agenda, avisa qué hay que comprar antes de que falte.
 */
export default function Consumo() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [ver, setVer] = useState('avisos')

  useEffect(() => {
    api.prediccion().then(setItems).catch((e) => setError(e.message)).finally(() => setCargando(false))
  }, [])

  async function aLista(ids) {
    setError('')
    try {
      await Promise.all(ids.map((id) => api.actualizar(id, { porComprar: 1 })))
      setItems((prev) => prev.map((x) => (ids.includes(x.productoId) ? { ...x, enLista: true } : x)))
    } catch (e) { setError(e.message) }
  }

  const avisos = items.filter((i) => i.estado === 'AGOTADO' || i.estado === 'PRONTO' || i.estado === 'ATENTO')
  const lista = ver === 'avisos' ? avisos : items
  const urgentes = avisos.filter((i) => i.estado !== 'ATENTO' && !i.enLista).map((i) => i.productoId)

  return (
    <section>
      <div className="encabezado encabezado-accion">
        <div>
          <h2>¿Cuándo se acaba?</h2>
          <p className="suave">Calculado con lo que pusiste en cada producto («me dura 30 clientas» o «lo compro cada mes») y los turnos de la agenda. Manos y pies cuentan como un turno.</p>
        </div>
        {urgentes.length > 0 && <button className="primario" onClick={() => aLista(urgentes)}><ShoppingCart size={16} /> Pasar lo urgente a la lista</button>}
      </div>
      <div className="subtabs">
        <button className={ver === 'avisos' ? 'chip activo' : 'chip'} onClick={() => setVer('avisos')}>Avisos ({avisos.length})</button>
        <button className={ver === 'todos' ? 'chip activo' : 'chip'} onClick={() => setVer('todos')}>Todos ({items.length})</button>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {cargando && <p className="vacio">Cargando…</p>}
      {!cargando && lista.length === 0 && <p className="vacio">{ver === 'avisos' ? 'Todo alcanza por ahora.' : 'Ningún producto tiene duración. Ponla en el catálogo con «Por clientas» o «Por tiempo».'}</p>}
      <ul className="lista">
        {lista.map((i) => {
          const [etiqueta, clase] = ESTADOS[i.estado]
          return (
            <li key={i.productoId}>
              <div>
                <strong>{i.nombre}</strong> <span className={`estado ${clase}`}>{etiqueta}</span>
                <div className="suave">
                  {i.modoControl === 'CONSUMO'
                    ? `Dura ${Number(i.rendimiento)} clientas · quedan para unas ${i.clientasRestantes} · ${i.programadas} turnos agendados en 2 semanas`
                    : `Lo cambias cada ${Number(i.rendimiento)} días · tienes ${Number(i.stockActual)}`}
                </div>
                <div className="consumo-cuando">{cuando(i)}</div>
              </div>
              {i.enLista
                ? <span className="etiqueta">En la lista</span>
                : <button className="secundario pequeno" onClick={() => aLista([i.productoId])}><ShoppingCart size={14} /> A la lista</button>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
