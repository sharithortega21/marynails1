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
