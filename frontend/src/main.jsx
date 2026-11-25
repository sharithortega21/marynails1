import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App.jsx'
import Pie from './components/Pie.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Pie />
  </StrictMode>,
)

// Permite instalar Mary Nails en el celular como una aplicacion (solo en la version publicada)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}) })
}
