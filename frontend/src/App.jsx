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

  return (
    <div className="app">
      <header className="barra">
        <div className="marca">
          <span className="marca-logo">M</span>
          <span className="marca-nombre">Mary Nails</span>
        </div>
        <nav className="tabs">
          <button className={vista === 'inicio' ? 'tab activa' : 'tab'} onClick={() => setVista('inicio')}>
            <Home size={18} /> <span>Inicio</span>
          </button>
          <button className={vista === 'agenda' ? 'tab activa' : 'tab'} onClick={() => setVista('agenda')}>
            <CalendarDays size={18} /> <span>Agenda</span>
          </button>
          <button className={vista === 'clientas' ? 'tab activa' : 'tab'} onClick={() => setVista('clientas')}>
            <Users size={18} /> <span>Clientas</span>
          </button>
          <button className={vista === 'servicios' ? 'tab activa' : 'tab'} onClick={() => setVista('servicios')}>
            <Scissors size={18} /> <span>Servicios</span>
          </button>
          <button className={vista === 'catalogo' ? 'tab activa' : 'tab'} onClick={() => setVista('catalogo')}>
            <Palette size={18} /> <span>Catálogo</span>
          </button>
          <button className={vista === 'compras' ? 'tab activa' : 'tab'} onClick={() => setVista('compras')}>
            <ShoppingBag size={18} /> <span>Compras</span>
          </button>
          <button className={vista === 'finanzas' ? 'tab activa' : 'tab'} onClick={() => setVista('finanzas')}>
            <Wallet size={18} /> <span>Finanzas</span>
          </button>
          <button className={vista === 'acerca' ? 'tab activa' : 'tab'} onClick={() => setVista('acerca')}>
            <Info size={18} /> <span>Acerca de</span>
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
        {vista === 'inicio' ? <Inicio ir={setVista} /> : vista === 'acerca' ? <AcercaDe /> : vista === 'servicios' ? <Servicios /> : vista === 'catalogo' ? <Catalogo /> : vista === 'compras' ? <Compras /> : vista === 'clientas' ? <Clientas /> : vista === 'finanzas' ? <Finanzas /> : <Agenda />}
      </main>
    </div>
  )
}
