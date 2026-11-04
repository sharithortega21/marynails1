import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { api } from '../api.js'
import { pesos } from '../fechas.js'

const FRECUENCIAS = [[15, '15 días'], [20, '20 días'], [30, '1 mes'], [45, '1 mes y medio'], [60, '2 meses']]

/** Ventana para agendar una cita: elige o crea la clienta, el servicio, la fecha y la hora. */
export default function NuevaCita({ fechaInicial, onCerrar, onCreada }) {
  const [clientas, setClientas] = useState([])
  const [servicios, setServicios] = useState([])
  const [sectores, setSectores] = useState([])
  const [nueva, setNueva] = useState(false)
  const [clienteId, setClienteId] = useState('')
  const [servicioId, setServicioId] = useState('')
  const [fecha, setFecha] = useState(fechaInicial)
  const [hora, setHora] = useState('08:00')
  const [turnos, setTurnos] = useState(1)
  const [lugar, setLugar] = useState('DOMICILIO')
  const [obs, setObs] = useState('')
  const [c, setC] = useState({ nombre: '', telefono: '', frecuenciaDias: '', sectorId: '', barrio: '', municipio: 'Cúcuta' })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    Promise.all([api.clientas(), api.servicios(), api.sectores()])
      .then(([cl, sv, se]) => { setClientas(cl); setServicios(sv); setSectores(se) })
      .catch((e) => setError(e.message))
  }, [])

  const servicio = servicios.find((s) => String(s.id) === String(servicioId))
  const domingo = new Date(fecha + 'T00:00').getDay() === 0

  async function guardar(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      let idCliente = clienteId
      if (nueva) {
        let sectorId = c.sectorId
        if (sectorId === 'otro') {
          const s = await api.crearSector({ barrio: c.barrio, municipio: c.municipio })
          sectorId = s.id
        }
        const creada = await api.crearClienta({
          nombre: c.nombre, telefono: c.telefono,
          sectorId: sectorId ? Number(sectorId) : null,
          frecuenciaDias: c.frecuenciaDias ? Number(c.frecuenciaDias) : null,
        })
        idCliente = creada.id
      }
      const cita = await api.crearCita({
        clienteId: Number(idCliente), servicioId: Number(servicioId), fecha, hora, turnos, lugar, observaciones: obs,
      })
      onCreada(cita)
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <div className="velo" role="dialog" aria-modal="true" aria-label="Nueva cita">
      <form className="ventana" onSubmit={guardar}>
        <div className="ventana-cab">
          <h3>Nueva cita</h3>
          <button type="button" className="icono" onClick={onCerrar} aria-label="Cerrar"><X size={18} /></button>
        </div>

        <div className="campo">
          <div className="campo-fila">
            <span className="etiqueta-campo">Clienta, familia o dirección</span>
            <button type="button" className="enlace-boton" onClick={() => setNueva(!nueva)}>
              {nueva ? 'Elegir una que ya existe' : '+ Clienta nueva'}
            </button>
          </div>
          {!nueva ? (
            <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
              <option value="">Elige…</option>
              {clientas.map((x) => (
                <option key={x.id} value={x.id}>{x.nombre}{x.barrio ? ` · ${x.barrio}` : ''}</option>
              ))}
            </select>
          ) : (
            <div className="subcampos">
              <input placeholder="Nombre (persona, familia o dirección)" value={c.nombre} onChange={(e) => setC({ ...c, nombre: e.target.value })} required />
              <input placeholder="Teléfono (WhatsApp)" inputMode="tel" value={c.telefono} onChange={(e) => setC({ ...c, telefono: e.target.value })} />
              <select value={c.sectorId} onChange={(e) => setC({ ...c, sectorId: e.target.value })}>
                <option value="">Sector / barrio…</option>
                {sectores.map((s) => <option key={s.id} value={s.id}>{s.barrio} · {s.municipio}</option>)}
                <option value="otro">Otro barrio (nuevo)…</option>
              </select>
              {c.sectorId === 'otro' && (
                <div className="dos">
                  <input placeholder="Barrio" value={c.barrio} onChange={(e) => setC({ ...c, barrio: e.target.value })} required />
                  <select value={c.municipio} onChange={(e) => setC({ ...c, municipio: e.target.value })}>
                    {['Cúcuta', 'Villa del Rosario', 'Los Patios', 'El Zulia'].map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
              )}
              <select value={c.frecuenciaDias} onChange={(e) => setC({ ...c, frecuenciaDias: e.target.value })}>
                <option value="">¿Cada cuánto viene? (opcional)</option>
                {FRECUENCIAS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
              </select>
            </div>
          )}
        </div>

        <label className="campo">
          <span className="etiqueta-campo">Servicio</span>
          <select value={servicioId} onChange={(e) => setServicioId(e.target.value)} required>
            <option value="">Elige un servicio…</option>
            {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre} · {pesos(s.precio)}</option>)}
          </select>
        </label>

        <div className="campo">
          <span className="etiqueta-campo">¿Cuántos turnos?</span>
          <div className="cantidad habitual" style={{ borderTop: 0, paddingTop: 0 }}>
            <button type="button" className="icono" onClick={() => setTurnos(Math.max(1, turnos - 1))} aria-label="Un turno menos" disabled={turnos <= 1}>−</button>
            <strong>{turnos}</strong>
            <button type="button" className="icono" onClick={() => setTurnos(Math.min(30, turnos + 1))} aria-label="Un turno más">+</button>
            {servicio && <small className="suave">{turnos} × {pesos(servicio.precio)} = <b>{pesos(Number(servicio.precio) * turnos)}</b> · unos {servicio.duracionMin * turnos} min. El cobro lo puedes ajustar después.</small>}
          </div>
        </div>

        <div className="dos">
          <label className="campo">
            <span className="etiqueta-campo">Fecha</span>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </label>
          <label className="campo">
            <span className="etiqueta-campo">Hora</span>
            <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
          </label>
        </div>
        {domingo && <p className="aviso">Los domingos no se atiende; revisa la fecha.</p>}

        <div className="campo">
          <span className="etiqueta-campo">Lugar</span>
          <div className="chips">
            <button type="button" className={lugar === 'DOMICILIO' ? 'chip activa' : 'chip'} onClick={() => setLugar('DOMICILIO')}>A domicilio</button>
            <button type="button" className={lugar === 'CASA_MARY' ? 'chip activa' : 'chip'} onClick={() => setLugar('CASA_MARY')}>Casa de Mary</button>
          </div>
        </div>

        <label className="campo">
          <span className="etiqueta-campo">Notas (opcional)</span>
          <input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Diseños, color, cuántas personas…" />
        </label>

        {error && <p className="error" role="alert">{error}</p>}
        <div className="acciones">
          <button type="submit" className="primario" disabled={enviando}>{enviando ? 'Guardando…' : 'Agendar cita'}</button>
          <button type="button" className="secundario" onClick={onCerrar}>Cancelar</button>
        </div>
      </form>
    </div>
  )
}
