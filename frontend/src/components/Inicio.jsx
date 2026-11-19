import { useEffect, useState } from 'react'
import { AlertTriangle, Briefcase, CalendarCheck, MessageCircle, RefreshCw, ShoppingBag, UserRound, Wallet } from 'lucide-react'
import { api } from '../api.js'
import { aTexto, deTexto, hoy, hora12, pesos, sumarDias, nombreDia, diaMes } from '../fechas.js'

const diasEntre = (a, b) => Math.round((deTexto(b) - deTexto(a)) / 86400000)

export default function Inicio({ ir, usuario }) {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [listos, setListos] = useState({}) // lo que ya se metió al maletín (solo en esta pantalla)

  useEffect(() => {
    const h = hoy()
    const mes = h.slice(0, 8) + '01'
    const f = deTexto(h); const finMes = aTexto(new Date(f.getFullYear(), f.getMonth() + 1, 0))
    Promise.all([api.citas(h, sumarDias(h, 1)), api.listaCompras(), api.clientas(), api.resumen(mes, finMes),
      api.porRenovar(), api.maletin(sumarDias(h, 1))])
      .then(([citas, faltantes, clientas, resumen, porRenovar, maletin]) => setDatos({ citas, faltantes, clientas, resumen, porRenovar, maletin }))
      .catch((e) => setError(e.message))
  }, [])

  async function renovar(id) {
    try {
      await api.renovar(id)
      setDatos((d) => ({ ...d, porRenovar: d.porRenovar.filter((r) => r.producto.id !== id) }))
    } catch (e) { setError(e.message) }
  }

  if (error) return <p className="error" role="alert">{error}</p>
  if (!datos) return <p className="vacio">Cargando…</p>

  const h = hoy()
  const activas = datos.citas.filter((c) => c.estado === 'PROGRAMADA' || c.estado === 'ATENDIDA')
  const deHoy = activas.filter((c) => c.fecha === h)
  const deManana = activas.filter((c) => c.fecha === sumarDias(h, 1))
  const recontactar = datos.clientas.filter((c) => c.frecuenciaDias && c.ultimaCita && !c.proximaCita && diasEntre(c.ultimaCita, h) >= c.frecuenciaDias)
  const mesActual = new Date().toLocaleDateString('es-CO', { month: 'long' })

  const texto = 'Lista de compras Mary Nails:\n' + datos.faltantes.map((p) => `- ${p.linea ? `${p.linea} ${p.codigo}` : p.nombre}`).join('\n')

  return (
    <section>
      <div className="encabezado">
        <h2>Hola, {(usuario?.nombre || 'Mary').split(' ')[0]}</h2>
        <p className="suave">{nombreDia(h)} {diaMes(h)}</p>
      </div>

      <div className="kpis">
        <button className="kpi" onClick={() => ir('agenda')}><CalendarCheck size={20} /><strong>{deHoy.length}</strong><span>citas hoy</span></button>
        <button className="kpi" onClick={() => ir('compras')}><ShoppingBag size={20} /><strong>{datos.faltantes.length}</strong><span>por comprar</span></button>
        <button className="kpi" onClick={() => ir('clientas')}><UserRound size={20} /><strong>{recontactar.length}</strong><span>por recontactar</span></button>
        <button className="kpi" onClick={() => ir('finanzas')}><Wallet size={20} /><strong>{pesos(datos.resumen.ingresos)}</strong><span>ingresos de {mesActual}</span></button>
      </div>

      <div className="dos-columnas">
        <div className="panel">
          <h3>Citas de hoy</h3>
          {deHoy.length === 0 && <p className="vacio">No hay citas hoy.</p>}
          <ul className="mini">
            {deHoy.map((c) => (
              <li key={c.id}>
                <b>{hora12(c.hora)}</b> <span>{c.cliente} · {c.servicio}</span>
                {c.estado === 'ATENDIDA' && <em className="ok"> atendida</em>}
              </li>
            ))}
          </ul>
          <h3>Mañana</h3>
          {deManana.length === 0 && <p className="vacio">Sin citas mañana.</p>}
          <ul className="mini">
            {deManana.map((c) => <li key={c.id}><b>{hora12(c.hora)}</b> <span>{c.cliente} · {c.servicio}</span></li>)}
          </ul>
        </div>

        <div className="panel">
          <h3><AlertTriangle size={16} /> Alertas</h3>
          {datos.faltantes.length === 0 && recontactar.length === 0 && datos.porRenovar.length === 0 && <p className="vacio">Todo en orden.</p>}
          <ul className="mini">
            {datos.faltantes.slice(0, 6).map((p) => (
              <li key={p.id}>
                <span>{p.linea ? `${p.linea} ${p.codigo}` : p.nombre}</span>
                <em className="aviso">{p.esCritico && Number(p.stockActual) <= Number(p.stockMinimo) ? 'crítico' : 'por comprar'}</em>
              </li>
            ))}
            {datos.faltantes.length > 6 && <li className="suave">y {datos.faltantes.length - 6} más en la lista…</li>}
            {datos.porRenovar.map((r) => (
              <li key={'r' + r.producto.id}>
                <span><RefreshCw size={13} /> Renovar {r.producto.nombre}</span>
                <em className="aviso">{r.diasRestantes <= 0 ? `lleva ${r.diasDeUso} días` : `en ${r.diasRestantes} ${r.diasRestantes === 1 ? 'día' : 'días'}`}</em>
                <button className="enlace-boton renovar-hoy" onClick={() => renovar(r.producto.id)}>La renové hoy</button>
              </li>
            ))}
            {recontactar.slice(0, 5).map((c) => (
              <li key={'c' + c.id}><span>Recontactar a {c.nombre}</span><em className="aviso">{diasEntre(c.ultimaCita, h)} días</em></li>
            ))}
          </ul>
          {datos.faltantes.length > 0 && (
            <a className="boton" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(texto)}`}>
              <MessageCircle size={16} /> Enviar lista por WhatsApp
            </a>
          )}
        </div>

        <div className="panel">
          <h3><Briefcase size={16} /> Maletín para mañana</h3>
          {deManana.length === 0 && <p className="suave">Sin citas mañana; estos son los que no pueden faltar.</p>}
          {datos.maletin.length === 0 && <p className="vacio">Nada que preparar.</p>}
          <ul className="maletin">
            {datos.maletin.map((i) => (
              <li key={i.productoId} className={listos[i.productoId] ? 'listo' : ''}>
                <label>
                  <input type="checkbox" checked={Boolean(listos[i.productoId])} onChange={(e) => setListos((x) => ({ ...x, [i.productoId]: e.target.checked }))} />
                  <span>{i.nombre}</span>
                </label>
                <span className="maletin-meta">
                  <span className="suave">{i.arreglos > 0 ? `${i.arreglos} ${i.arreglos === 1 ? 'arreglo' : 'arreglos'}` : 'no puede faltar'}</span>
                  {i.falta && <em className="aviso">no hay</em>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
