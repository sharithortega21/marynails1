import { Star, Plus, Minus, Check } from 'lucide-react'

const ACABADOS = {
  CREMOSO: 'Cremoso', PERLADO: 'Perlado', TRASLUCIDO: 'Traslúcido', METALIZADO: 'Metalizado',
  FOTOCROMATICO: 'Fotocromático', BRILLO: 'Brillo', DECORACION: 'Decoración', MATIFICADOR: 'Matificador',
  'TRASLUCIDO/PERLADO': 'Traslúcido/perlado', 'PERLADO/METALIZADO': 'Perlado/metalizado',
}

export default function ProductoCard({ p, onCambiar }) {
  const esColor = Boolean(p.linea)
  const stock = Number(p.stockActual)
  const tengo = stock > 0
  const titulo = esColor ? p.codigo : p.nombre

  return (
    <article className={tengo ? 'tarjeta tengo' : 'tarjeta'}>
      <div className="tarjeta-cab">
        <div>
          {esColor && <span className="linea">{p.linea}</span>}
          <h3>{titulo}</h3>
        </div>
        <button
          className={p.esHabitual ? 'icono estrella activa' : 'icono estrella'}
          onClick={() => onCambiar(p.id, { esHabitual: !p.esHabitual })}
          aria-pressed={p.esHabitual}
          aria-label={p.esHabitual ? 'Quitar de habituales' : 'Marcar como habitual'}
          title={p.esHabitual ? 'Habitual' : 'Marcar como habitual'}
        >
          <Star size={18} fill={p.esHabitual ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="etiquetas">
        {p.acabado && <span className="etiqueta">{ACABADOS[p.acabado] || p.acabado}</span>}
        {p.esCritico && <span className="etiqueta critico">Crítico</span>}
        {!esColor && <span className="etiqueta suave">{p.categoria}</span>}
      </div>

      {esColor ? (
        <button
          className={tengo ? 'tengo-boton si' : 'tengo-boton'}
          onClick={() => onCambiar(p.id, { stockActual: tengo ? 0 : 1 })}
          aria-pressed={tengo}
        >
          {tengo && <Check size={16} />} {tengo ? 'Lo tengo' : 'No lo tengo'}
        </button>
      ) : (
        <div className="cantidad">
          <button className="icono" onClick={() => onCambiar(p.id, { stockActual: Math.max(0, stock - 1) })} aria-label="Restar uno" disabled={stock <= 0}><Minus size={16} /></button>
          <span><strong>{stock}</strong> {p.unidad ? `(${p.unidad})` : 'en stock'}</span>
          <button className="icono" onClick={() => onCambiar(p.id, { stockActual: stock + 1 })} aria-label="Sumar uno"><Plus size={16} /></button>
        </div>
      )}
    </article>
  )
}
