import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { MessageCircle, X } from 'lucide-react'
import { api } from '../api.js'
import { diaMes, hora12, nombreDia } from '../fechas.js'

function whatsapp(tel, texto) {
  const n = (tel || '').replace(/\D/g, '')
  if (!n) return null
  return `https://wa.me/${n.length === 10 ? '57' + n : n}?text=${encodeURIComponent(texto)}`
}

/**
 * Se liberó un cupo (la clienta canceló o no vino): a quién ofrecérselo.
 * Primero las del mismo barrio, luego las del mismo municipio; dentro de cada grupo, a quienes ya les toca.
 */
export default function CupoLibre({ cita, onCerrar }) {
  const [lista, setLista] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.sugerenciasCupo(cita.id).then(setLista).catch((e) => setError(e.message))
  }, [cita.id])

  const cuando = `el ${nombreDia(cita.fecha).toLowerCase()} ${diaMes(cita.fecha)} a las ${hora12(cita.hora)}`

  // Se monta en <body>: la tarjeta cancelada es semitransparente y no debe afectar a la ventana
  return createPortal(
    <div className="velo" role="dialog" aria-modal="true" aria-label="Ofrecer el cupo">
      <div className="ventana">
        <div className="ventana-cab">
          <h3>Ofrecer el cupo</h3>
          <button type="button" className="icono" onClick={onCerrar} aria-label="Cerrar"><X size={18} /></button>
        </div>
        <p className="suave">Se liberó {cuando}{cita.barrio ? ` en ${cita.barrio}` : ''}. Estas clientas no tienen cita programada:</p>
        {error && <p className="error" role="alert">{error}</p>}
        {!lista && !error && <p className="vacio">Buscando…</p>}
        {lista && lista.length === 0 && <p className="vacio">No hay clientas de la zona sin cita.</p>}
        <ul className="lista">
          {(lista || []).map(({ clienta: k, mismoBarrio, leToca, diasDesdeUltima }) => {
            const enlace = whatsapp(k.telefono, `Hola ${k.nombre.split(' ')[0]}, te escribe Mary. Se me liberó un cupo ${cuando}. ¿Te gustaría arreglarte las uñas?`)
            return (
              <li key={k.id}>
                <div>
                  <strong>{k.nombre}</strong>
                  {mismoBarrio && <span className="etiqueta">Mismo barrio</span>}
                  {leToca && <span className="etiqueta">Ya le toca</span>}
                  <div className="suave">{k.barrio ? `${k.barrio} · ${k.municipio}` : 'Sin sector'}{diasDesdeUltima != null ? ` · última cita hace ${diasDesdeUltima} días` : ' · sin citas antes'}</div>
                </div>
                {enlace
                  ? <a className="secundario pequeno" href={enlace} target="_blank" rel="noreferrer"><MessageCircle size={14} /> Escribirle</a>
                  : <span className="suave">Sin teléfono</span>}
              </li>
            )
          })}
        </ul>
      </div>
    </div>,
    document.body,
  )
}
