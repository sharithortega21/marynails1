import { useState } from 'react'
import { X } from 'lucide-react'
import { api } from '../api.js'

/** Cambiar la propia clave. Se usa al pasar a producción para dejar atrás las claves iniciales. */
export default function CambiarClave({ onCerrar }) {
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [repetir, setRepetir] = useState('')
  const [error, setError] = useState('')
  const [listo, setListo] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function guardar(e) {
    e.preventDefault()
    setError('')
    if (nueva !== repetir) { setError('Las dos claves nuevas no coinciden'); return }
    setEnviando(true)
    try {
      await api.cambiarClave(actual, nueva)
      setListo(true)
    } catch (err) { setError(err.message) } finally { setEnviando(false) }
  }

  return (
    <div className="velo" role="dialog" aria-modal="true" aria-label="Cambiar clave">
      <form className="ventana" onSubmit={guardar}>
        <div className="ventana-cab">
          <h3>Cambiar clave</h3>
          <button type="button" className="icono" onClick={onCerrar} aria-label="Cerrar"><X size={18} /></button>
        </div>
        {listo ? (
          <>
            <p>Listo, tu clave quedó cambiada. La próxima vez entra con la nueva.</p>
            <div className="acciones"><button type="button" className="primario" onClick={onCerrar}>Cerrar</button></div>
          </>
        ) : (
          <>
            <label className="campo"><span className="etiqueta-campo">Clave actual</span>
              <input type="password" autoComplete="current-password" value={actual} onChange={(e) => setActual(e.target.value)} required />
            </label>
            <label className="campo"><span className="etiqueta-campo">Clave nueva (mínimo 10 caracteres)</span>
              <input type="password" autoComplete="new-password" minLength={10} value={nueva} onChange={(e) => setNueva(e.target.value)} required />
            </label>
            <label className="campo"><span className="etiqueta-campo">Repite la clave nueva</span>
              <input type="password" autoComplete="new-password" minLength={10} value={repetir} onChange={(e) => setRepetir(e.target.value)} required />
            </label>
            {error && <p className="error" role="alert">{error}</p>}
            <div className="acciones">
              <button type="submit" className="primario" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar'}</button>
              <button type="button" className="secundario" onClick={onCerrar}>Cancelar</button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
