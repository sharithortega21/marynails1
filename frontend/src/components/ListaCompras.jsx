import { useEffect, useState } from 'react'
import { MessageCircle, Copy } from 'lucide-react'
import { api } from '../api.js'

export default function ListaCompras() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    api.listaCompras().then(setItems).catch((e) => setError(e.message)).finally(() => setCargando(false))
  }, [])

  const texto = 'Lista de compras Mary Nails:\n' + items.map((p) => `- ${p.linea ? `${p.linea} ${p.codigo}` : p.nombre}`).join('\n')

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
        <p className="suave">Lo habitual o crítico que ya llegó al mínimo. Cambia el mínimo de un producto para que aparezca aquí.</p>
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
