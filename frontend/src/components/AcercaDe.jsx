import { Heart, MessageCircle } from 'lucide-react'
import './AcercaDe.css'

// Datos del negocio
const NEGOCIO = {
  nombre: 'Mary Nails',
  descripcion:
    'Mary Nails ofrece servicio de manicure y pedicure a domicilio: tradicional, semipermanente, soft gel y uñas en resina. ' +
    'Las clientas llegan sobre todo por recomendación y cada visita se agenda según el sector para aprovechar mejor el tiempo. ' +
    'Este sistema web ayuda a llevar la agenda, las clientas, el inventario de esmaltes, las compras y las finanzas.',
  zonas: 'Los Patios, Atalaya, Villa del Rosario, El Zulia y otros barrios de Cúcuta',
  horario: 'Lunes a sábado, de 6:00 a. m. a 12:00 m. y de 2:00 p. m. a 6:00 p. m. Después de las 6:00 p. m. con cita previa.',
  telefono: '312 455 4648',
  whatsapp: 'https://wa.me/573124554648',
}

const EQUIPO = [
  'María Angélica Leguizamón Jiménez',
  'Manuel Alejandro Ramírez Duarte',
  'Nicolás Gutiérrez Santiago',
  'Sharith Stefany Ortega Robles',
]

// Pantalla informativa: no consulta la API, solo muestra datos del negocio y del equipo
export default function AcercaDe() {
  return (
    <section className="acerca">
      <div className="encabezado"><h2>Acerca de</h2></div>

      <div className="acerca-tarjeta">
        <h3>{NEGOCIO.nombre}</h3>
        <p>{NEGOCIO.descripcion}</p>
        <p><strong>Zonas de atención:</strong> {NEGOCIO.zonas}</p>
        <p><strong>Horario:</strong> {NEGOCIO.horario}</p>
        <p>
          <strong>Contacto:</strong> {NEGOCIO.telefono}{' '}
          <a href={NEGOCIO.whatsapp} target="_blank" rel="noreferrer" className="acerca-enlace">
            <MessageCircle size={14} /> Escribir por WhatsApp
          </a>
        </p>
      </div>

      <div className="acerca-tarjeta">
        <h3>Equipo de desarrollo</h3>
        <ul>
          {EQUIPO.map((nombre) => <li key={nombre}>{nombre}</li>)}
        </ul>
        <p className="acerca-nota">
          <Heart size={14} /> Proyecto de la Universidad de Pamplona
        </p>
      </div>
    </section>
  )
}
