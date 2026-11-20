// Fechas en hora local como texto AAAA-MM-DD (evita el corrimiento de un dia por UTC).
export const aTexto = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const deTexto = (t) => { const [y, m, d] = t.split('-').map(Number); return new Date(y, m - 1, d) }
export const sumarDias = (t, n) => { const d = deTexto(t); d.setDate(d.getDate() + n); return aTexto(d) }
export const lunesDe = (t) => { const d = deTexto(t); const dia = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dia); return aTexto(d) }
export const hoy = () => aTexto(new Date())
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
export const nombreDia = (t) => DIAS[deTexto(t).getDay()]
export const diaMes = (t) => { const d = deTexto(t); return `${d.getDate()} ${MESES[d.getMonth()]}` }
export const hora12 = (h) => { const [H, M] = h.split(':').map(Number); return `${((H + 11) % 12) + 1}:${String(M).padStart(2, '0')} ${H < 12 ? 'a. m.' : 'p. m.'}` }
export const pesos = (n) => '$' + Number(n || 0).toLocaleString('es-CO')

/**
 * Horario habitual de Mary: mañana de 6:00 a 12:00 y tarde de 2:30 a 6:30; después de las 6 p. m. atiende en su casa.
 * Solo avisa (no bloquea), porque a veces hay excepciones.
 */
export function avisoHorario(hora, lugar) {
  if (!hora) return ''
  const [H, M] = hora.split(':').map(Number)
  const m = H * 60 + M
  if (m < 360) return 'Es antes de las 6:00 a. m., más temprano que el horario de Mary.'
  if (m >= 720 && m < 870) return 'Entre las 12:00 y las 2:30 p. m. Mary no suele atender. Revisa la hora.'
  if (m >= 1080 && lugar === 'DOMICILIO') return 'Después de las 6:00 p. m. Mary atiende en su casa.'
  if (m >= 1200) return 'Es después de las 8:00 p. m., más tarde que el horario de Mary.'
  return ''
}
