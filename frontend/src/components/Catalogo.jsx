import { useCallback, useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { api } from '../api.js'
import ProductoCard from './ProductoCard.jsx'

const TAMANO = 100

export default function Catalogo() {
  const [categorias, setCategorias] = useState([])
  const [lineas, setLineas] = useState([])
  const [categoria, setCategoria] = useState('Esmaltes')
  const [linea, setLinea] = useState('')
  const [q, setQ] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [soloHabituales, setSoloHabituales] = useState(false)
  const [soloTengo, setSoloTengo] = useState(false)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(0)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.categorias().then(setCategorias).catch((e) => setError(e.message))
    api.lineas().then(setLineas).catch((e) => setError(e.message))
  }, [])

  // pequena espera al escribir para no pedir en cada letra
  useEffect(() => {
    const t = setTimeout(() => setBusqueda(q), 300)
    return () => clearTimeout(t)
  }, [q])

  const cargar = useCallback(async (paraPagina) => {
    setCargando(true)
    setError('')
    try {
      const r = await api.productos({
        categoria, linea, q: busqueda, soloHabituales, soloTengo, pagina: paraPagina, tamano: TAMANO,
      })
      setItems((prev) => (paraPagina === 0 ? r.content : [...prev, ...r.content]))
      setTotal(r.totalElements)
      setPagina(paraPagina)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [categoria, linea, busqueda, soloHabituales, soloTengo])

  useEffect(() => { cargar(0) }, [cargar])

  function elegirCategoria(nombre) {
    setCategoria(nombre === categoria ? '' : nombre)
    setLinea('')
  }

  async function cambiar(id, cambios) {
    try {
      const nuevo = await api.actualizar(id, cambios)
      setItems((prev) => prev.map((p) => (p.id === id ? nuevo : p)))
      api.categorias().then(setCategorias).catch(() => {})
      api.lineas().then(setLineas).catch(() => {})
    } catch (e) {
      setError(e.message)
    }
  }

  const esEsmalte = categoria === 'Esmaltes' || linea !== ''

  return (
    <section>
      <div className="encabezado">
        <h2>Catálogo</h2>
        <p className="suave">Marca lo que tienes y lo que usas siempre. {total} resultados.</p>
      </div>

      <div className="chips" role="group" aria-label="Categorías">
        <button className={categoria === '' ? 'chip activa' : 'chip'} onClick={() => { setCategoria(''); setLinea('') }}>Todo</button>
        {categorias.map((c) => (
          <button key={c.nombre} className={categoria === c.nombre ? 'chip activa' : 'chip'} onClick={() => elegirCategoria(c.nombre)}>
            {c.nombre} <small>{c.tengo}/{c.total}</small>
          </button>
        ))}
      </div>

      {esEsmalte && (
        <div className="chips secundarios" role="group" aria-label="Líneas de color">
          <button className={linea === '' ? 'chip activa' : 'chip'} onClick={() => setLinea('')}>Todas las líneas</button>
          {lineas.map((l) => (
            <button key={l.nombre} className={linea === l.nombre ? 'chip activa' : 'chip'} onClick={() => setLinea(l.nombre === linea ? '' : l.nombre)}>
              {l.nombre} <small>{l.tengo}/{l.total}</small>
            </button>
          ))}
        </div>
      )}

      <div className="filtros">
        <label className="buscador">
          <Search size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o número" aria-label="Buscar" />
        </label>
        <label className="interruptor">
          <input type="checkbox" checked={soloHabituales} onChange={(e) => setSoloHabituales(e.target.checked)} /> Solo habituales
        </label>
        <label className="interruptor">
          <input type="checkbox" checked={soloTengo} onChange={(e) => setSoloTengo(e.target.checked)} /> Solo los que tengo
        </label>
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="rejilla">
        {items.map((p) => <ProductoCard key={p.id} p={p} onCambiar={cambiar} />)}
      </div>

      {!cargando && items.length === 0 && !error && <p className="vacio">No hay productos con esos filtros.</p>}
      {cargando && <p className="vacio">Cargando…</p>}
      {!cargando && items.length < total && (
        <div className="centro"><button className="secundario" onClick={() => cargar(pagina + 1)}>Cargar más ({total - items.length} restantes)</button></div>
      )}
    </section>
  )
}
