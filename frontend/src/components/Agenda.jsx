import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, MessageCircle, Clock, MapPin, Home, CalendarPlus, HeartPulse, Wallet } from 'lucide-react'
import { api } from '../api.js'
import { avisoHorario, diaMes, hora12, hoy, lunesDe, nombreDia, pesos, sumarDias } from '../fechas.js'
import CupoLibre from './CupoLibre.jsx'
import NuevaCita from './NuevaCita.jsx'

const ESTADOS = {
  PROGRAMADA: ['Programada', 'estado-prog'],
  ATENDIDA: ['Atendida', 'estado-ok'],
  CANCELADA: ['Cancelada', 'estado-no'],
  NO_ASISTIO: ['No vino', 'estado-no'],
}

function whatsapp(tel, texto) {
  const n = (tel || '').replace(/\D/g, '')
  if (!n) return null
  return `https://wa.me/${n.length === 10 ? '57' + n : n}?text=${encodeURIComponent(texto)}`
}

/** Enlace que abre Google Calendar con la cita ya llena; Mary solo pulsa Guardar y recibe las notificaciones. */
function googleCalendar(c) {
  const [h, m] = c.hora.slice(0, 5).split(':').map(Number)
  const inicio = new Date(`${c.fecha}T00:00:00`)
  inicio.setHours(h, m)
  const fin = new Date(inicio.getTime() + (c.duracionMin || 60) * (c.turnos || 1) * 60000)
  const f = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`
  const lugar = c.lugar === 'CASA_MARY' ? 'Casa de Mary' : [c.direccion, c.barrio, c.municipio].filter(Boolean).join(', ')
  const detalle = [`${c.turnos > 1 ? c.turnos + ' turnos · ' : ''}${c.servicio}`, c.telefono ? `Tel: ${c.telefono}` : '', c.observaciones || ''].filter(Boolean).join('\n')
  const q = new URLSearchParams({
    action: 'TEMPLATE', text: `Uñas: ${c.cliente}`, dates: `${f(inicio)}/${f(fin)}`, ctz: 'America/Bogota', details: detalle, location: lugar,
  })
  return `https://calendar.google.com/calendar/render?${q}`
}

const MEDIOS = { EFECTIVO: 'efectivo', TRANSFERENCIA: 'transferencia', MIXTO: 'efectivo y transferencia' }

function CitaTarjeta({ c, onCambiar, onBorrar, soloVer }) {
  const [modo, setModo] = useState('')        // '', 'cobro', 'mover', 'borrar', 'cupo'
  const [valor, setValor] = useState(Number(c.precioCobrado) + Number(c.extraDiseno))
  const [extra, setExtra] = useState(Number(c.extraDiseno))
  const [medio, setMedio] = useState(c.medioPago || 'EFECTIVO')
  const total = Number(c.precioCobrado) + Number(c.extraDiseno)
  const debe = c.estado === 'ATENDIDA' && c.valorPagado != null ? Math.max(0, total - Number(c.valorPagado)) : 0
  // Como pagó: todo, una parte, o "te pago al rato" (queda pendiente)
  const [forma, setForma] = useState(c.estado === 'ATENDIDA' && debe > 0 ? (Number(c.valorPagado) > 0 ? 'parte' : 'despues') : 'todo')
  const [fecha, setFecha] = useState(c.fecha)
  const [hora, setHora] = useState(c.hora.slice(0, 5))
  const [turnos, setTurnos] = useState(c.turnos)
  const [etiqueta, clase] = ESTADOS[c.estado]
  const programada = c.estado === 'PROGRAMADA'
  const enlace = whatsapp(c.telefono, `Hola ${c.cliente.split(' ')[0]}, te confirmo tu cita de uñas el ${nombreDia(c.fecha).toLowerCase()} ${diaMes(c.fecha)} a las ${hora12(c.hora)}. ¡Nos vemos!`)

  return (
    <article className={`cita ${clase}`}>
      <div className="cita-hora"><Clock size={14} /> {hora12(c.hora)}</div>
      <div className="cita-cuerpo">
        <div className="cita-linea">
          <strong>{c.cliente}</strong>
          <span className={`estado ${clase}`}>{etiqueta}</span>
        </div>
        <div className="suave cita-detalle">
          <span><MapPin size={13} /> {c.barrio ? `${c.barrio} · ${c.municipio}` : 'Sin sector'}</span>
          <span>{c.lugar === 'CASA_MARY' ? <><Home size={13} /> Casa de Mary</> : 'A domicilio'}</span>
        </div>
        <div className="cita-servicio">{c.turnos > 1 && <b>{c.turnos} turnos · </b>}{c.servicio} <span className="suave">· unos {c.duracionMin * c.turnos} min{c.precioCobrado != null && ` · ${pesos(Number(c.precioCobrado) + Number(c.extraDiseno))}`}</span></div>
        {c.observaciones && <div className="suave nota">“{c.observaciones}”</div>}
        {c.salud && <div className="salud-cita" role="note"><HeartPulse size={14} aria-hidden="true" /> Salud: {c.salud}</div>}
        {c.estado === 'ATENDIDA' && c.valorPagado != null && debe === 0 && (
          <div className="pago">Pagó {pesos(c.valorPagado)}{c.medioPago ? ` · ${MEDIOS[c.medioPago] || c.medioPago}` : ''}</div>
        )}
        {debe > 0 && (
          <div className="pago-pendiente" role="note">
            <Wallet size={14} aria-hidden="true" /> Pendiente por pago: <b>{pesos(debe)}</b>
            {Number(c.valorPagado) > 0 && <span> (abonó {pesos(c.valorPagado)})</span>}
            {!soloVer && modo === '' && <button className="enlace-boton" onClick={() => { setForma('todo'); setValor(total); setModo('cobro') }}>Ya pagó</button>}
          </div>
        )}

        {modo === '' && !soloVer && (
          <div className="cita-acciones">
            {programada && <button className="primario pequeno" onClick={() => setModo('cobro')}>Atendida</button>}
            {programada && <button className="secundario pequeno" onClick={() => onCambiar(c.id, { estado: 'NO_ASISTIO' })}>No vino</button>}
            {programada && <button className="secundario pequeno" onClick={() => onCambiar(c.id, { estado: 'CANCELADA' })}>Canceló</button>}
            {!programada && <button className="secundario pequeno" onClick={() => onCambiar(c.id, { estado: 'PROGRAMADA' })}>Volver a programada</button>}
            {c.estado === 'ATENDIDA' && <button className="secundario pequeno" onClick={() => setModo('cobro')}>Cambiar cobro</button>}
            {programada && <button className="secundario pequeno" onClick={() => setModo('mover')}>Editar</button>}
            {programada && enlace && <a className="secundario pequeno" href={enlace} target="_blank" rel="noreferrer"><MessageCircle size={14} /> Confirmar</a>}
            {programada && <a className="secundario pequeno" href={googleCalendar(c)} target="_blank" rel="noreferrer"><CalendarPlus size={14} /> Google Calendar</a>}
            {(c.estado === 'CANCELADA' || c.estado === 'NO_ASISTIO') && c.fecha >= hoy() && <button className="secundario pequeno" onClick={() => setModo('cupo')}>Ofrecer el cupo</button>}
            <button className="enlace-boton" onClick={() => setModo('borrar')}>Quitar</button>
          </div>
        )}

        {modo === 'cobro' && (
          <form className="mini-form" onSubmit={(e) => {
            e.preventDefault()
            const pagado = forma === 'todo' ? Number(c.precioCobrado) + extra : forma === 'despues' ? 0 : valor
            onCambiar(c.id, { estado: 'ATENDIDA', extraDiseno: extra, valorPagado: pagado, medioPago: forma === 'despues' ? '' : medio })
            setModo('')
          }}>
            <div className="extra-diseno">
              <span>Extra por diseño: <b>{pesos(extra)}</b></span>
              <div className="acciones">
                {[0, 5000, 10000].map((v) => (
                  <button type="button" key={v} className={extra === v ? 'chip activa' : 'chip'} onClick={() => { setValor(Number(valor) - extra + v); setExtra(v) }}>{v === 0 ? 'Sin extra' : pesos(v)}</button>
                ))}
              </div>
              <input type="range" min="0" max="50000" step="1000" value={extra} aria-label="Ajustar extra por diseño"
                     onChange={(e) => { const v = Number(e.target.value); setValor(Number(valor) - extra + v); setExtra(v) }} />
            </div>
            <div className="forma-pago" role="group" aria-label="¿Cómo pagó?">
              {[['todo', `Pagó todo (${pesos(Number(c.precioCobrado) + extra)})`], ['parte', 'Pagó una parte'], ['despues', 'Paga después']].map(([v, t]) => (
                <button type="button" key={v} className={forma === v ? 'chip activa' : 'chip'} onClick={() => setForma(v)}>{t}</button>
              ))}
            </div>
            {forma === 'parte' && <label>¿Cuánto pagó?<input type="number" min="0" step="1000" value={valor} onChange={(e) => setValor(Number(e.target.value))} /></label>}
            {forma === 'despues' && <p className="suave">Queda en «Pagos pendientes» en Inicio hasta que marques «Ya pagó».</p>}
            {forma !== 'despues' && <label>Medio<select value={medio} onChange={(e) => setMedio(e.target.value)}><option value="EFECTIVO">Efectivo</option><option value="TRANSFERENCIA">Transferencia</option><option value="MIXTO">Mixto (efectivo y transferencia)</option></select></label>}
            <div className="acciones"><button className="primario pequeno" type="submit">Guardar</button><button type="button" className="secundario pequeno" onClick={() => setModo('')}>Cancelar</button></div>
          </form>
        )}

        {modo === 'mover' && (
          <form className="mini-form" onSubmit={(e) => { e.preventDefault(); onCambiar(c.id, { fecha, hora, ...(Number(turnos) !== c.turnos ? { turnos: Number(turnos) } : {}) }); setModo('') }}>
            <label>Fecha<input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required /></label>
            <label>Hora<input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required /></label>
            <label>Turnos<input type="number" min="1" max="30" value={turnos} onChange={(e) => setTurnos(e.target.value)} required /></label>
            {avisoHorario(hora, c.lugar) && <p className="aviso">{avisoHorario(hora, c.lugar)}</p>}
            <div className="acciones"><button className="primario pequeno" type="submit">Guardar</button><button type="button" className="secundario pequeno" onClick={() => setModo('')}>Cancelar</button></div>
          </form>
        )}

        {modo === 'cupo' && <CupoLibre cita={c} onCerrar={() => setModo('')} />}

        {modo === 'borrar' && (
          <div className="mini-form">
            <p>¿Quitar esta cita por completo? Esto no se puede deshacer.</p>
            <div className="acciones"><button className="primario pequeno" onClick={() => onBorrar(c.id)}>Sí, quitar</button><button className="secundario pequeno" onClick={() => setModo('')}>No</button></div>
          </div>
        )}
      </div>
    </article>
  )
}

export default function Agenda({ soloVer = false }) {
  const [lunes, setLunes] = useState(() => lunesDe(hoy()))
  const [citas, setCitas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [nueva, setNueva] = useState(null) // fecha inicial o null
  const [maximo, setMaximo] = useState(6)
  useEffect(() => { api.reglasAgenda().then((r) => setMaximo(r.maximoDia)).catch(() => {}) }, [])

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try { setCitas(await api.citas(lunes, sumarDias(lunes, 6))) } catch (e) { setError(e.message) } finally { setCargando(false) }
  }, [lunes])

  useEffect(() => { cargar() }, [cargar])

  async function cambiar(id, cambios) {
    try {
      const nueva = await api.cambiarCita(id, cambios)
      setCitas((prev) => prev.map((c) => (c.id === id ? nueva : c)).filter((c) => c.fecha >= lunes && c.fecha <= sumarDias(lunes, 6)).sort(ordenar))
    } catch (e) { setError(e.message) }
  }
  async function borrar(id) {
    try { await api.borrarCita(id); setCitas((prev) => prev.filter((c) => c.id !== id)) } catch (e) { setError(e.message) }
  }

  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i)).filter((d, i) => i < 6 || citas.some((c) => c.fecha === d))
  const total = citas.filter((c) => c.estado !== 'CANCELADA').length
  const hoyTexto = hoy()
  const rango = `${diaMes(lunes)} – ${diaMes(sumarDias(lunes, 5))}`

  return (
    <section>
      <div className="encabezado encabezado-fila">
        <div>
          <h2>Agenda</h2>
          <p className="suave">Semana del {rango} · {total} {total === 1 ? 'cita' : 'citas'}</p>
        </div>
        {!soloVer && <button className="primario" onClick={() => setNueva(lunes <= hoyTexto && hoyTexto <= sumarDias(lunes, 5) ? hoyTexto : lunes)}><Plus size={18} /> Nueva cita</button>}
      </div>

      <div className="semana-nav">
        <button className="icono" onClick={() => setLunes(sumarDias(lunes, -7))} aria-label="Semana anterior"><ChevronLeft size={18} /></button>
        <button className="secundario pequeno" onClick={() => setLunes(lunesDe(hoy()))}>Hoy</button>
        <button className="icono" onClick={() => setLunes(sumarDias(lunes, 7))} aria-label="Semana siguiente"><ChevronRight size={18} /></button>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {cargando && <p className="vacio">Cargando…</p>}

      {!cargando && dias.map((d) => {
        const delDia = citas.filter((c) => c.fecha === d)
        const sectores = [...new Set(delDia.filter((c) => c.estado !== 'CANCELADA' && c.barrio).map((c) => c.barrio))]
        const personas = delDia.filter((c) => c.estado === 'PROGRAMADA' || c.estado === 'ATENDIDA').reduce((a, c) => a + (c.turnos || 1), 0)
        return (
          <div key={d} className={d === hoyTexto ? 'dia hoy' : 'dia'}>
            <div className="dia-cab">
              <h3>{nombreDia(d)} <span className="suave">{diaMes(d)}</span>{d === hoyTexto && <span className="etiqueta">Hoy</span>}</h3>
              <span className="suave dia-resumen">{delDia.length ? `${personas} de ${maximo} personas${sectores.length ? ' · ' + sectores.join(', ') : ''}` : 'Libre'}</span>
              {!soloVer && <button className="icono" onClick={() => setNueva(d)} aria-label={`Agendar el ${nombreDia(d).toLowerCase()}`}><Plus size={16} /></button>}
            </div>
            {delDia.map((c) => <CitaTarjeta key={c.id} c={c} onCambiar={cambiar} onBorrar={borrar} soloVer={soloVer} />)}
          </div>
        )
      })}

      {nueva && <NuevaCita fechaInicial={nueva} onCerrar={() => setNueva(null)} onCreada={(c) => { setNueva(null); if (c.fecha < lunes || c.fecha > sumarDias(lunes, 6)) setLunes(lunesDe(c.fecha)); else cargar() }} />}
    </section>
  )
}

const ordenar = (a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora)
