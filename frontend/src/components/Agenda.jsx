import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, MessageCircle, Clock, MapPin, Home } from 'lucide-react'
import { api } from '../api.js'
import { diaMes, hora12, hoy, lunesDe, nombreDia, pesos, sumarDias } from '../fechas.js'
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

function CitaTarjeta({ c, onCambiar, onBorrar }) {
  const [modo, setModo] = useState('')        // '', 'cobro', 'mover', 'borrar'
  const [valor, setValor] = useState(Number(c.precioCobrado) + Number(c.extraDiseno))
  const [extra, setExtra] = useState(Number(c.extraDiseno))
  const [medio, setMedio] = useState(c.medioPago || 'EFECTIVO')
  const [fecha, setFecha] = useState(c.fecha)
  const [hora, setHora] = useState(c.hora.slice(0, 5))
  const [etiqueta, clase] = ESTADOS[c.estado]
  const programada = c.estado === 'PROGRAMADA'
  const enlace = whatsapp(c.telefono, `Hola ${c.cliente.split(' ')[0]}, te confirmo tu cita de uñas el ${nombreDia(c.fecha)} ${diaMes(c.fecha)} a las ${hora12(c.hora)}. ¡Nos vemos!`)

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
        <div className="cita-servicio">{c.servicio} <span className="suave">· {c.duracionMin} min · {pesos(Number(c.precioCobrado) + Number(c.extraDiseno))}</span></div>
        {c.observaciones && <div className="suave nota">“{c.observaciones}”</div>}
        {c.estado === 'ATENDIDA' && (
          <div className="pago">Pagó {pesos(c.valorPagado)}{c.medioPago ? ` · ${c.medioPago === 'EFECTIVO' ? 'efectivo' : 'transferencia'}` : ''}
            {Number(c.valorPagado) < Number(c.precioCobrado) + Number(c.extraDiseno) && <b> · debe {pesos(Number(c.precioCobrado) + Number(c.extraDiseno) - Number(c.valorPagado))}</b>}
          </div>
        )}

        {modo === '' && (
          <div className="cita-acciones">
            {programada && <button className="primario pequeno" onClick={() => setModo('cobro')}>Atendida</button>}
            {programada && <button className="secundario pequeno" onClick={() => onCambiar(c.id, { estado: 'NO_ASISTIO' })}>No vino</button>}
            {programada && <button className="secundario pequeno" onClick={() => onCambiar(c.id, { estado: 'CANCELADA' })}>Canceló</button>}
            {!programada && <button className="secundario pequeno" onClick={() => onCambiar(c.id, { estado: 'PROGRAMADA' })}>Volver a programada</button>}
            {c.estado === 'ATENDIDA' && <button className="secundario pequeno" onClick={() => setModo('cobro')}>Cambiar cobro</button>}
            {programada && <button className="secundario pequeno" onClick={() => setModo('mover')}>Mover</button>}
            {programada && enlace && <a className="secundario pequeno" href={enlace} target="_blank" rel="noreferrer"><MessageCircle size={14} /> Confirmar</a>}
            <button className="enlace-boton" onClick={() => setModo('borrar')}>Quitar</button>
          </div>
        )}

        {modo === 'cobro' && (
          <form className="mini-form" onSubmit={(e) => { e.preventDefault(); onCambiar(c.id, { estado: 'ATENDIDA', extraDiseno: extra, valorPagado: valor, medioPago: medio }); setModo('') }}>
            <label>Extra por diseño<input type="number" min="0" step="1000" value={extra} onChange={(e) => { const v = Number(e.target.value); setValor(Number(valor) - extra + v); setExtra(v) }} /></label>
            <label>Pagó<input type="number" min="0" step="1000" value={valor} onChange={(e) => setValor(Number(e.target.value))} /></label>
            <label>Medio<select value={medio} onChange={(e) => setMedio(e.target.value)}><option value="EFECTIVO">Efectivo</option><option value="TRANSFERENCIA">Transferencia</option></select></label>
            <div className="acciones"><button className="primario pequeno" type="submit">Guardar</button><button type="button" className="secundario pequeno" onClick={() => setModo('')}>Cancelar</button></div>
          </form>
        )}

        {modo === 'mover' && (
          <form className="mini-form" onSubmit={(e) => { e.preventDefault(); onCambiar(c.id, { fecha, hora }); setModo('') }}>
            <label>Fecha<input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required /></label>
            <label>Hora<input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required /></label>
            <div className="acciones"><button className="primario pequeno" type="submit">Mover</button><button type="button" className="secundario pequeno" onClick={() => setModo('')}>Cancelar</button></div>
          </form>
        )}

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

export default function Agenda() {
  const [lunes, setLunes] = useState(() => lunesDe(hoy()))
  const [citas, setCitas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [nueva, setNueva] = useState(null) // fecha inicial o null

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
        <button className="primario" onClick={() => setNueva(lunes <= hoyTexto && hoyTexto <= sumarDias(lunes, 5) ? hoyTexto : lunes)}><Plus size={18} /> Nueva cita</button>
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
        return (
          <div key={d} className={d === hoyTexto ? 'dia hoy' : 'dia'}>
            <div className="dia-cab">
              <h3>{nombreDia(d)} <span className="suave">{diaMes(d)}</span>{d === hoyTexto && <span className="etiqueta">Hoy</span>}</h3>
              <span className="suave dia-resumen">{delDia.length ? `${delDia.length} ${delDia.length === 1 ? 'cita' : 'citas'}${sectores.length ? ' · ' + sectores.join(', ') : ''}` : 'Libre'}</span>
              <button className="icono" onClick={() => setNueva(d)} aria-label={`Agendar el ${nombreDia(d)}`}><Plus size={16} /></button>
            </div>
            {delDia.map((c) => <CitaTarjeta key={c.id} c={c} onCambiar={cambiar} onBorrar={borrar} />)}
          </div>
        )
      })}

      {nueva && <NuevaCita fechaInicial={nueva} onCerrar={() => setNueva(null)} onCreada={(c) => { setNueva(null); if (c.fecha < lunes || c.fecha > sumarDias(lunes, 6)) setLunes(lunesDe(c.fecha)); else cargar() }} />}
    </section>
  )
}

const ordenar = (a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora)
