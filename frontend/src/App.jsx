import { useEffect, useState } from 'react'
import { LogOut, Palette, ShoppingBag, CalendarDays, Users, Home, Wallet, Scissors, Info } from 'lucide-react'
import { api, hayToken, setToken } from './api.js'
import Login from './components/Login.jsx'
import Catalogo from './components/Catalogo.jsx'
import Compras from './components/Compras.jsx'
import Inicio from './components/Inicio.jsx'
import Finanzas from './components/Finanzas.jsx'
import Agenda from './components/Agenda.jsx'
import Clientas from './components/Clientas.jsx'
import Servicios from './components/Servicios.jsx'
import AcercaDe from './components/AcercaDe.jsx'

function leerUsuario() {
  try { return JSON.parse(sessionStorage.getItem('mn_usuario')) } catch { return null }
}

export default function App() {
  const [usuario, setUsuario] = useState(() => (hayToken() ? leerUsuario() : null))
  const [vista, setVista] = useState('inicio')

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

  // Mary (PROPIETARIA) ve todo; Sharith (ADMIN) ve inventario, compras y la agenda solo para consultar
  const esMary = usuario.rol === 'PROPIETARIA'
  const pestanas = [
    ['inicio', Home, 'Inicio'],
    ['agenda', CalendarDays, 'Agenda'],
    ...(esMary ? [['clientas', Users, 'Clientas'], ['servicios', Scissors, 'Servicios']] : []),
    ['catalogo', Palette, 'Catálogo'],
    ['compras', ShoppingBag, 'Compras'],
    ...(esMary ? [['finanzas', Wallet, 'Finanzas']] : []),
    ['acerca', Info, 'Acerca de'],
  ]

  return (
    <div className="app">
      <header className="barra">
        <div className="marca">
          <span className="marca-logo">M</span>
          <span className="marca-nombre">Mary Nails</span>
        </div>
        <nav className="tabs">
          {pestanas.map(([id, Icono, texto]) => (
            <button key={id} className={vista === id ? 'tab activa' : 'tab'} onClick={() => setVista(id)}>
              <Icono size={18} /> <span>{texto}</span>
            </button>
          ))}
        </nav>
        <div className="usuario">
          <span>{usuario.nombre}</span>
          <button className="icono" onClick={salir} aria-label="Cerrar sesión" title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <main className="contenido">
        {vista === 'inicio' ? <Inicio ir={setVista} usuario={usuario} /> : vista === 'acerca' ? <AcercaDe /> : vista === 'servicios' && esMary ? <Servicios /> : vista === 'catalogo' ? <Catalogo /> : vista === 'compras' ? <Compras /> : vista === 'clientas' && esMary ? <Clientas /> : vista === 'finanzas' && esMary ? <Finanzas /> : <Agenda soloVer={!esMary} />}
      </main>
    </div>
  )
}
