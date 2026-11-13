import { useCallback, useEffect, useMemo, useState } from 'react'
import { MessageCircle, Pencil, Plus, Search, X } from 'lucide-react'
import { api } from '../api.js'
import { deTexto, diaMes, hoy } from '../fechas.js'

const FRECUENCIAS = [[15, '15 días'], [20, '20 días'], [30, '1 mes'], [45, '1 mes y medio'], [60, '2 meses']]
const MUNICIPIOS = ['Cúcuta', 'Villa del Rosario', 'Los Patios', 'El Zulia']
const nombreFrecuencia = (d) => (FRECUENCIAS.find(([v]) => v === d) || [0, `${d} días`])[1]

const diasEntre = (desde, hasta) => Math.round((deTexto(hasta) - deTexto(desde)) / 86400000)

function estadoDe(c) {
  const dias = c.ultimaCita ? diasEntre(c.ultimaCita, hoy()) : null
  const toca = Boolean(c.frecuenciaDias && dias !== null && dias >= c.frecuenciaDias && !c.proximaCita)
  return { dias, toca }
}

function whatsapp(c, dias) {
  const n = (c.telefono || '').replace(/\D/g, '')
  if (!n) return null
  const texto = `Hola ${c.nombre.split(' ')[0]}, ¿cómo estás? Ya pasaron ${dias} días desde tu última cita de uñas. ¿Te agendo una nueva?`
  return `https://wa.me/${n.length === 10 ? '57' + n : n}?text=${encodeURIComponent(texto)}`
}

function Formulario({ clienta, onCerrar, onGuardada }) {
  const [sectores, setSectores] = useState([])
  const [f, setF] = useState({
    nombre: clienta?.nombre || '', telefono: clienta?.telefono || '', direccion: clienta?.direccion || '',
    sectorId: clienta?.sectorId ? String(clienta.sectorId) : '', frecuenciaDias: clienta?.frecuenciaDias ? String(clienta.frecuenciaDias) : '',
    observaciones: clienta?.observaciones || '', barrio: '', municipio: 'Cúcuta',
  })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => { api.sectores().then(setSectores).catch((e) => setError(e.message)) }, [])
  const poner = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function guardar(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      let sectorId = f.sectorId
      if (sectorId === 'otro') sectorId = (await api.crearSector({ barrio: f.barrio, municipio: f.municipio })).id
      const cuerpo = {
        nombre: f.nombre, telefono: f.telefono, direccion: f.direccion, observaciones: f.observaciones,
        sectorId: sectorId ? Number(sectorId) : null,
        frecuenciaDias: f.frecuenciaDias ? Number(f.frecuenciaDias) : (clienta?.frecuenciaDias ? 0 : null),
      }
      onGuardada(clienta ? await api.editarClienta(clienta.id, cuerpo) : await api.crearClienta(cuerpo))
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <div className="velo" role="dialog" aria-modal="true" aria-label={clienta ? 'Editar' : 'Nueva clienta'}>
      <form className="ventana" onSubmit={guardar}>
        <div className="ventana-cab">
          <h3>{clienta ? 'Editar' : 'Nueva clienta'}</h3>
          <button type="button" className="icono" onClick={onCerrar} aria-label="Cerrar"><X size={18} /></button>
        </div>
        <label className="campo"><span className="etiqueta-campo">Nombre (persona, familia o dirección)</span>
          <input value={f.nombre} onChange={poner('nombre')} required /></label>
        <label className="campo"><span className="etiqueta-campo">Teléfono (WhatsApp)</span>
          <input inputMode="tel" value={f.telefono} onChange={poner('telefono')} placeholder="Si no lo tienes, déjalo vacío" /></label>
        <label className="campo"><span className="etiqueta-campo">Dirección</span>
          <input value={f.direccion} onChange={poner('direccion')} /></label>
        <label className="campo"><span className="etiqueta-campo">Sector / barrio</span>
          <select value={f.sectorId} onChange={poner('sectorId')}>
            <option value="">Sin sector</option>
            {sectores.map((s) => <option key={s.id} value={s.id}>{s.barrio} · {s.municipio}</option>)}
            <option value="otro">Otro barrio (nuevo)…</option>
          </select></label>
        {f.sectorId === 'otro' && (
          <div className="dos">
            <input placeholder="Barrio" value={f.barrio} onChange={poner('barrio')} required />
            <select value={f.municipio} onChange={poner('municipio')}>{MUNICIPIOS.map((m) => <option key={m}>{m}</option>)}</select>
          </div>
        )}
        <label className="campo"><span className="etiqueta-campo">¿Cada cuánto viene?</span>
          <select value={f.frecuenciaDias} onChange={poner('frecuenciaDias')}>
            <option value="">No sé / sin frecuencia</option>
            {FRECUENCIAS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
          <small className="suave">Es una referencia: cuando pase ese tiempo desde su última cita, te avisamos para que le escribas.</small></label>
        <label className="campo"><span className="etiqueta-campo">Notas</span>
          <input value={f.observaciones} onChange={poner('observaciones')} placeholder="Prefiere las tardes, le gustan los diseños…" /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="acciones">
          <button type="submit" className="primario" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar'}</button>
          <button type="button" className="secundario" onClick={onCerrar}>Cancelar</button>
        </div>
      </form>
    </div>
  )
}

export default function Clientas() {
  const [lista, setLista] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState('todas') // todas | recontactar | <municipio>
  const [editando, setEditando] = useState(null) // null | 'nueva' | clienta

  const cargar = useCallback(async () => {
    setError('')
    try { setLista(await api.clientas()) } catch (e) { setError(e.message) } finally { setCargando(false) }
  }, [])
  useEffect(() => { cargar() }, [cargar])

  const recontactar = useMemo(() => lista.filter((c) => estadoDe(c).toca), [lista])
  const municipios = useMemo(() => [...new Set(lista.map((c) => c.municipio).filter(Boolean))].sort(), [lista])
  const visibles = lista.filter((c) => {
    if (filtro === 'recontactar' && !estadoDe(c).toca) return false
    if (filtro !== 'todas' && filtro !== 'recontactar' && c.municipio !== filtro) return false
    const t = q.trim().toLowerCase()
    return !t || c.nombre.toLowerCase().includes(t) || (c.barrio || '').toLowerCase().includes(t) || (c.telefono || '').includes(t)
  })

  function guardada(c) {
    setLista((prev) => (prev.some((x) => x.id === c.id) ? prev.map((x) => (x.id === c.id ? c : x)) : [...prev, c].sort((a, b) => a.nombre.localeCompare(b.nombre))))
    setEditando(null)
  }

  return (
    <section>
      <div className="encabezado encabezado-fila">
        <div>
          <h2>Clientas</h2>
          <p className="suave">Quién toca atender, dónde vive y cada cuánto viene. {lista.length} registradas.</p>
        </div>
        <button className="primario" onClick={() => setEditando('nueva')}><Plus size={18} /> Nueva clienta</button>
      </div>

      <div className="chips" role="group" aria-label="Filtros">
        <button className={filtro === 'todas' ? 'chip activa' : 'chip'} onClick={() => setFiltro('todas')}>Todas <small>{lista.length}</small></button>
        <button className={filtro === 'recontactar' ? 'chip activa' : 'chip'} onClick={() => setFiltro('recontactar')}>Por recontactar <small>{recontactar.length}</small></button>
        {municipios.map((m) => <button key={m} className={filtro === m ? 'chip activa' : 'chip'} onClick={() => setFiltro(filtro === m ? 'todas' : m)}>{m}</button>)}
      </div>
      <div className="filtros">
        <label className="buscador"><Search size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, barrio o teléfono" aria-label="Buscar" /></label>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {cargando && <p className="vacio">Cargando…</p>}
      {!cargando && visibles.length === 0 && <p className="vacio">{lista.length === 0 ? 'Aún no hay clientas. Agrega la primera.' : 'No hay clientas con esos filtros.'}</p>}

      <ul className="lista clientas">
        {visibles.map((c) => {
          const { dias, toca } = estadoDe(c)
          const enlace = toca ? whatsapp(c, dias) : null
          return (
            <li key={c.id} className={toca ? 'toca' : ''}>
              <div className="cl-datos">
                <strong>{c.nombre}</strong>
                <span className="suave">{c.barrio ? `${c.barrio} · ${c.municipio}` : 'Sin sector'}{c.telefono ? ` · ${c.telefono}` : ''}</span>
                <span className="suave cl-meta">
                  {c.frecuenciaDias ? `Viene cada ${nombreFrecuencia(c.frecuenciaDias)}` : 'Sin frecuencia'}
                  {' · '}{c.ultimaCita ? (dias === 0 ? 'última cita: hoy' : `última cita hace ${dias} ${dias === 1 ? 'día' : 'días'}`) : 'sin citas atendidas'}
                  {c.proximaCita && ` · próxima: ${diaMes(c.proximaCita)}`}
                </span>
                {c.observaciones && <span className="suave nota">“{c.observaciones}”</span>}
              </div>
              <div className="etiquetas">
                {toca && <span className="etiqueta critico">Escríbele · pasaron {dias} días</span>}
                {enlace && <a className="primario pequeno" href={enlace} target="_blank" rel="noreferrer"><MessageCircle size={14} /> WhatsApp</a>}
                {toca && !enlace && <span className="suave nota">Sin teléfono</span>}
                <button className="secundario pequeno" onClick={() => setEditando(c)}><Pencil size={14} /> Editar</button>
              </div>
            </li>
          )
        })}
      </ul>

      {editando && <Formulario clienta={editando === 'nueva' ? null : editando} onCerrar={() => setEditando(null)} onGuardada={guardada} />}
    </section>
  )
}
