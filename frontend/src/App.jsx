import { useEffect, useState } from 'react'
import { LogOut, Palette, ShoppingBag, CalendarDays } from 'lucide-react'
import { api, hayToken, setToken } from './api.js'
import Login from './components/Login.jsx'
import Catalogo from './components/Catalogo.jsx'
import ListaCompras from './components/ListaCompras.jsx'

function leerUsuario() {
  try { return JSON.parse(sessionStorage.getItem('mn_usuario')) } catch { return null }
}

export default function App() {
  const [usuario, setUsuario] = useState(() => (hayToken() ? leerUsuario() : null))
  const [vista, setVista] = useState('catalogo')

  useEffect(() => {
    const salir = () => setUsuario(null)
    window.addEventListener('mn-sesion-expirada', salir)
    return () => window.removeEventListener('mn-sesion-expirada', salir)
  }, [])

  function entrar(respuesta) {
    setToken(respuesta.token)
    const u = { nombre: respuesta.nombre, rol: respuesta.rol }
    try { sessionStorage.setItem('mn_usuario', JSON.stringify(u)) } catch { /* sin almacenamiento */ }
    setUsuario(u)
  }

  function salir() {
    setToken(null)
    setUsuario(null)
  }

  if (!usuario) return <Login onEntrar={entrar} login={api.login} />

  return (
    <div className="app">
      <header className="barra">
        <div className="marca">
          <span className="marca-logo">M</span>
          <span className="marca-nombre">Mary Nails</span>
        </div>
        <nav className="tabs">
          <button className={vista === 'catalogo' ? 'tab activa' : 'tab'} onClick={() => setVista('catalogo')}>
            <Palette size={18} /> <span>Catálogo</span>
          </button>
          <button className={vista === 'compras' ? 'tab activa' : 'tab'} onClick={() => setVista('compras')}>
            <ShoppingBag size={18} /> <span>Lista de compras</span>
          </button>
          <button className="tab desactivada" disabled title="Próximamente">
            <CalendarDays size={18} /> <span>Agenda</span>
          </button>
        </nav>
        <div className="usuario">
          <span>{usuario.nombre}</span>
          <button className="icono" onClick={salir} aria-label="Cerrar sesión" title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <main className="contenido">
        {vista === 'catalogo' ? <Catalogo /> : <ListaCompras />}
      </main>
    </div>
  )
}
