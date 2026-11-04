import { useEffect, useState } from 'react'
import { MessageCircle, Copy } from 'lucide-react'
import { api } from '../api.js'

function aComprar(p) {
  const porHabitual = p.esHabitual ? Math.max(0, Number(p.cantidadHabitual) - Number(p.stockActual)) : 0
  return Math.max(porHabitual, Number(p.porComprar))
}

export default function ListaCompras() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    api.listaCompras().then(setItems).catch((e) => setError(e.message)).finally(() => setCargando(false))
  }, [])

  const texto = 'Lista de compras Mary Nails:\n' + items.map((p) => {
    const falta = aComprar(p)
    return `- ${p.linea ? `${p.linea} ${p.codigo}` : p.nombre}${falta > 1 ? ` x${falta}` : ''}`
  }).join('\n')

  async function yaCompre(p) {
    try {
      const stock = Number(p.stockActual)
      const nuevo = p.esHabitual ? Math.max(stock, Number(p.cantidadHabitual)) : stock + Number(p.porComprar)
      await api.actualizar(p.id, { stockActual: nuevo, porComprar: 0 })
      setItems((prev) => prev.filter((x) => x.id !== p.id))
    } catch (e) {
      setError(e.message)
    }
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setError('No se pudo copiar; usa el botón de WhatsApp')
    }
  }

  return (
    <section>
      <div className="encabezado">
        <h2>Lista de compras</h2>
        <p className="suave">Lo que marcaste con “Quiero comprar”, los habituales que tienes por debajo de la cantidad que quieres, y lo crítico que llegó al mínimo.</p>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {cargando && <p className="vacio">Cargando…</p>}
      {!cargando && items.length === 0 && <p className="vacio">No falta nada por ahora.</p>}

      <ul className="lista">
        {items.map((p) => (
          <li key={p.id}>
            <div>
              <strong>{p.linea ? `${p.linea} ${p.codigo}` : p.nombre}</strong>
              <span className="suave"> · {p.categoria}</span>
            </div>
            <div className="etiquetas">
              {p.esCritico && <span className="etiqueta critico">Crítico</span>}
              {p.esHabitual && <span className="etiqueta">Habitual</span>}
              <span className="etiqueta suave">Tengo {Number(p.stockActual)}</span>
              <span className="etiqueta">Comprar {aComprar(p)}</span>
              <button className="secundario pequeno" onClick={() => yaCompre(p)}>Ya lo compré</button>
            </div>
          </li>
        ))}
      </ul>

      {items.length > 0 && (
        <div className="acciones">
          <a className="primario enlace" href={`https://wa.me/?text=${encodeURIComponent(texto)}`} target="_blank" rel="noreferrer">
            <MessageCircle size={18} /> Enviar por WhatsApp
          </a>
          <button className="secundario" onClick={copiar}><Copy size={18} /> {copiado ? 'Copiado' : 'Copiar lista'}</button>
        </div>
      )}
    </section>
  )
}
