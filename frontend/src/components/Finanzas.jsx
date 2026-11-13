import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { api } from '../api.js'
import { aTexto, deTexto, diaMes, hoy, pesos } from '../fechas.js'

const CATS = [['GASOLINA', 'Gasolina'], ['ACEITE_MOTO', 'Aceite de la moto'], ['MANTENIMIENTO_MOTO', 'Mantenimiento moto'], ['OTRO', 'Otro']]
const nombreCat = (c) => (CATS.find(([v]) => v === c) || [0, c])[1]

export default function Finanzas() {
  const [mes, setMes] = useState(() => { const d = deTexto(hoy()); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [resumen, setResumen] = useState(null)
  const [gastos, setGastos] = useState([])
  const [error, setError] = useState('')
  const [f, setF] = useState({ fecha: hoy(), categoria: 'GASOLINA', monto: '', descripcion: '' })

  const desde = aTexto(mes)
  const hasta = aTexto(new Date(mes.getFullYear(), mes.getMonth() + 1, 0))

  const cargar = useCallback(() => {
    Promise.all([api.resumen(desde, hasta), api.gastos(desde, hasta)])
      .then(([r, g]) => { setResumen(r); setGastos(g) })
      .catch((e) => setError(e.message))
  }, [desde, hasta])
  useEffect(cargar, [cargar])

  async function agregar(e) {
    e.preventDefault(); setError('')
    try {
      await api.crearGasto({ ...f, monto: Number(f.monto) })
      setF({ ...f, monto: '', descripcion: '' })
      cargar()
    } catch (er) { setError(er.message) }
  }
  async function quitar(id) {
    try { await api.borrarGasto(id); cargar() } catch (er) { setError(er.message) }
  }
  const moverMes = (n) => setMes(new Date(mes.getFullYear(), mes.getMonth() + n, 1))
  const maximo = resumen ? Math.max(1, ...resumen.semanas.map((s) => Math.max(Number(s.ingresos), Number(s.egresos)))) : 1

  return (
    <section>
      <div className="encabezado">
        <h2>Finanzas</h2>
        <div className="selector-mes">
          <button className="icono" aria-label="Mes anterior" onClick={() => moverMes(-1)}><ChevronLeft size={18} /></button>
          <strong>{mes.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</strong>
          <button className="icono" aria-label="Mes siguiente" onClick={() => moverMes(1)}><ChevronRight size={18} /></button>
        </div>
      </div>
      {error && <p className="error" role="alert">{error}</p>}

      {resumen && (
        <>
          <div className="kpis">
            <div className="kpi"><span>Ingresos</span><strong>{pesos(resumen.ingresos)}</strong><small>{resumen.citasAtendidas} citas atendidas</small></div>
            <div className="kpi"><span>Compras</span><strong>{pesos(resumen.compras)}</strong><small>mercancía</small></div>
            <div className="kpi"><span>Gastos</span><strong>{pesos(resumen.gastos)}</strong><small>moto y otros</small></div>
            <div className={Number(resumen.ganancia) >= 0 ? 'kpi bueno' : 'kpi malo'}><span>Ganancia</span><strong>{pesos(resumen.ganancia)}</strong><small>{Number(resumen.porCobrar) > 0 ? `${pesos(resumen.porCobrar)} por cobrar` : 'ingresos − egresos'}</small></div>
          </div>

          <div className="barras" aria-label="Ingresos y egresos por semana">
            {resumen.semanas.map((s) => (
              <div key={s.desde} className="semana">
                <div className="par">
                  <span className="b-ing" style={{ height: `${(Number(s.ingresos) / maximo) * 100}%` }} title={`Ingresos ${pesos(s.ingresos)}`} />
                  <span className="b-egr" style={{ height: `${(Number(s.egresos) / maximo) * 100}%` }} title={`Egresos ${pesos(s.egresos)}`} />
                </div>
                <small>{diaMes(s.desde)}</small>
              </div>
            ))}
          </div>
          <p className="leyenda"><span className="p-ing" /> Ingresos <span className="p-egr" /> Compras + gastos</p>
        </>
      )}

      <h3 className="sub">Gastos</h3>
      <form className="form-gasto" onSubmit={agregar}>
        <input type="date" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} aria-label="Fecha" />
        <select value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })} aria-label="Tipo">
          {CATS.map(([v, n]) => <option key={v} value={v}>{n}</option>)}
        </select>
        <input type="number" min="1" step="100" placeholder="Valor" value={f.monto} onChange={(e) => setF({ ...f, monto: e.target.value })} aria-label="Valor" required />
        <input placeholder="Nota (opcional)" value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} aria-label="Nota" />
        <button className="primario" type="submit">Agregar</button>
      </form>
      {gastos.length === 0 && <p className="vacio">No hay gastos este mes.</p>}
      <ul className="historial">
        {gastos.map((g) => (
          <li key={g.id}>
            <div><b>{diaMes(g.fecha)}</b> · {nombreCat(g.categoria)}{g.descripcion ? ` · ${g.descripcion}` : ''}
              <strong className="derecha">{pesos(g.monto)}</strong>
              <button className="icono" aria-label="Quitar gasto" onClick={() => quitar(g.id)}><Trash2 size={15} /></button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
