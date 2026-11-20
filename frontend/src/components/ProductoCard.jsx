import { useState } from 'react'
import { deTexto, hoy } from '../fechas.js'
import { Star, Plus, Minus, Check, ShoppingCart, X, Pencil, RefreshCw } from 'lucide-react'

const ACABADOS = {
  CREMOSO: 'Cremoso', PERLADO: 'Perlado', TRASLUCIDO: 'Traslúcido', METALIZADO: 'Metalizado',
  FOTOCROMATICO: 'Fotocromático', BRILLO: 'Brillo', DECORACION: 'Decoración', MATIFICADOR: 'Matificador',
  'TRASLUCIDO/PERLADO': 'Traslúcido/perlado', 'PERLADO/METALIZADO': 'Perlado/metalizado',
}

export default function ProductoCard({ p, onCambiar, onEditar, onRenovar }) {
  const esColor = Boolean(p.linea)
  // Si la foto aún no está subida (o el enlace falla), la tarjeta se muestra sin imagen
  const [sinFoto, setSinFoto] = useState(false)
  const stock = Number(p.stockActual)
  const tengo = stock > 0
  const titulo = esColor ? p.codigo : p.nombre
  const alcanza = p.modoControl === 'CONSUMO' && p.rendimiento ? Math.floor(stock * Number(p.rendimiento) + 0.0001) : null
  let renovacion = null
  if (p.modoControl === 'TIEMPO' && p.rendimiento && p.enUsoDesde) {
    const uso = Math.round((deTexto(hoy()) - deTexto(p.enUsoDesde)) / 86400000)
    const faltan = Number(p.rendimiento) - uso
    renovacion = faltan <= 0 ? `Toca renovarla (lleva ${uso} días)` : `Renovar en ${faltan} ${faltan === 1 ? 'día' : 'días'}`
  }

  return (
    <article className={(tengo ? 'tarjeta tengo' : 'tarjeta') + (p.activo === false ? ' oculto' : '')}>
      {!esColor && p.imagenUrl && !sinFoto && <img className="foto-producto" src={p.imagenUrl} alt={p.nombre} loading="lazy" onError={() => setSinFoto(true)} />}
      {esColor && (
        <div className={p.hex ? 'muestra' : 'muestra sin-color'} style={p.hex ? { background: p.hex } : undefined}
             title={p.hex ? `${p.linea} ${p.codigo} · ${p.hex}` : 'Color por cargar'} aria-hidden="true" />
      )}
      <div className="tarjeta-cab">
        <div>
          {esColor && <span className="linea">{p.linea}</span>}
          <h3>{titulo}</h3>
        </div>
        <button className="icono" onClick={onEditar} aria-label={`Editar ${titulo}`} title="Editar"><Pencil size={16} /></button>
        <button
          className={p.esHabitual ? 'icono estrella activa' : 'icono estrella'}
          onClick={() => onCambiar(p.id, p.esHabitual ? { esHabitual: false } : { esHabitual: true, cantidadHabitual: Number(p.cantidadHabitual) > 0 ? Number(p.cantidadHabitual) : 1 })}
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
        {p.modoControl === 'CONSUMO' && p.rendimiento && <span className="etiqueta suave">Dura {Number(p.rendimiento)} clientas</span>}
        {p.modoControl === 'TIEMPO' && p.rendimiento && <span className="etiqueta suave">Se cambia cada {Number(p.rendimiento)} días</span>}
        {p.activo === false && <span className="etiqueta">Oculto</span>}
      </div>
      {alcanza !== null && <p className={alcanza <= 5 ? 'rinde poco' : 'rinde'}>{alcanza <= 0 ? 'Ya no queda: toca comprar' : `Queda para unas ${alcanza} ${alcanza === 1 ? 'clienta' : 'clientas'}`}</p>}
      {p.modoControl === 'TIEMPO' && p.rendimiento && (
        <div className="renovar">
          {renovacion && <span className={renovacion.startsWith('Toca') ? 'rinde poco' : 'rinde'}>{renovacion}</span>}
          <button className="secundario pequeno" onClick={() => onRenovar(p.id)}>
            <RefreshCw size={13} /> {p.enUsoDesde ? 'La renové hoy' : 'Empecé a usarla hoy'}
          </button>
        </div>
      )}

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
      {!p.esHabitual && (
        Number(p.porComprar) > 0 ? (
          <div className="cantidad habitual por-comprar">
            <span className="etiqueta"><ShoppingCart size={13} /> Por comprar</span>
            <button className="icono" onClick={() => onCambiar(p.id, { porComprar: Math.max(1, Number(p.porComprar) - 1) })} aria-label="Comprar uno menos" disabled={Number(p.porComprar) <= 1}><Minus size={16} /></button>
            <strong>{Number(p.porComprar)}</strong>
            <button className="icono" onClick={() => onCambiar(p.id, { porComprar: Number(p.porComprar) + 1 })} aria-label="Comprar uno más"><Plus size={16} /></button>
            <button className="icono" onClick={() => onCambiar(p.id, { porComprar: 0 })} aria-label="Quitar de la lista de compras" title="Quitar de compras"><X size={16} /></button>
          </div>
        ) : (
          <button className="secundario quiero-comprar" onClick={() => onCambiar(p.id, { porComprar: 1 })}><ShoppingCart size={15} /> Quiero comprar</button>
        )
      )}
      {p.esHabitual && (
        <div className="cantidad habitual" title="Cuántas quieres tener siempre; si tienes menos, pasa a la lista de compras">
          <span className="suave">Quiero tener</span>
          <button className="icono" onClick={() => onCambiar(p.id, { cantidadHabitual: Math.max(0, Number(p.cantidadHabitual) - 1) })} aria-label="Quiero tener uno menos" disabled={Number(p.cantidadHabitual) <= 0}><Minus size={16} /></button>
          <strong>{Number(p.cantidadHabitual)}</strong>
          <button className="icono" onClick={() => onCambiar(p.id, { cantidadHabitual: Number(p.cantidadHabitual) + 1 })} aria-label="Quiero tener uno más"><Plus size={16} /></button>
        </div>
      )}
    </article>
  )
}
