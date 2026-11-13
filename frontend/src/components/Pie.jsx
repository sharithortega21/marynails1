import { useEffect, useState } from 'react'
import './Pie.css'

const HORARIO = 'Lunes a sábado: 6:00 a. m. a 12:00 m. y 2:00 p. m. a 6:00 p. m.'
const WHATSAPP = 'https://wa.me/573124554648'

// Pie de página con el horario y el WhatsApp, y un aviso si no hay internet
export default function Pie() {
  const [enLinea, setEnLinea] = useState(navigator.onLine)

  useEffect(() => {
    const subir = () => setEnLinea(true)
    const bajar = () => setEnLinea(false)
    window.addEventListener('online', subir)
    window.addEventListener('offline', bajar)
    return () => {
      window.removeEventListener('online', subir)
      window.removeEventListener('offline', bajar)
    }
  }, [])

  return (
    <footer className="pie">
      {!enLinea && <p className="pie-aviso">Sin conexión a internet. Los cambios no se guardarán hasta que vuelva.</p>}
      <p>Mary Nails · {HORARIO}</p>
      <p>
        <a href={WHATSAPP} target="_blank" rel="noreferrer">Escríbenos por WhatsApp</a>
      </p>
    </footer>
  )
}
