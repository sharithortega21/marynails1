const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

let token = null
try { token = sessionStorage.getItem('mn_token') } catch { /* sin almacenamiento */ }

export function setToken(t) {
  token = t
  try {
    if (t) sessionStorage.setItem('mn_token', t)
    else sessionStorage.removeItem('mn_token')
  } catch { /* sin almacenamiento */ }
}
export const hayToken = () => Boolean(token)

async function pedir(ruta, opciones = {}) {
  const res = await fetch(BASE + ruta, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (res.status === 401 && token) {
    setToken(null)
    window.dispatchEvent(new Event('mn-sesion-expirada'))
  }
  if (!res.ok) {
    let msg = res.status === 401 ? 'Correo o clave incorrectos' : 'Algo salió mal'
    try {
      // La API responde {message}, {error} o, en las validaciones, un objeto {campo: mensaje}
      const cuerpo = await res.json()
      msg = cuerpo.message || cuerpo.error || Object.values(cuerpo).filter((v) => typeof v === 'string').join('. ') || msg
    } catch { /* sin cuerpo */ }
    throw new Error(msg)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  login: (correo, clave) => pedir('/api/auth/login', { method: 'POST', body: JSON.stringify({ correo, clave }) }),
  categorias: () => pedir('/api/categorias'),
  lineas: () => pedir('/api/lineas-color'),
  productos: (p) => pedir('/api/productos?' + new URLSearchParams(p)),
  actualizar: (id, cambios) => pedir(`/api/productos/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) }),
  listaCompras: () => pedir('/api/lista-compras'),
  servicios: () => pedir('/api/servicios'),
  buscarServicios: (nombre) => pedir('/api/servicios/buscar?' + new URLSearchParams({ nombre })),
  crearServicio: (s) => pedir('/api/servicios', { method: 'POST', body: JSON.stringify(s) }),
  editarServicio: (id, s) => pedir(`/api/servicios/${id}`, { method: 'PUT', body: JSON.stringify(s) }),
  borrarServicio: (id) => pedir(`/api/servicios/${id}`, { method: 'DELETE' }),
  sectores: () => pedir('/api/sectores'),
  crearSector: (s) => pedir('/api/sectores', { method: 'POST', body: JSON.stringify(s) }),
  clientas: () => pedir('/api/clientas'),
  crearClienta: (c) => pedir('/api/clientas', { method: 'POST', body: JSON.stringify(c) }),
  editarClienta: (id, c) => pedir(`/api/clientas/${id}`, { method: 'PATCH', body: JSON.stringify(c) }),
  citas: (desde, hasta) => pedir('/api/citas?' + new URLSearchParams({ desde, hasta })),
  crearCita: (c) => pedir('/api/citas', { method: 'POST', body: JSON.stringify(c) }),
  cambiarCita: (id, c) => pedir(`/api/citas/${id}`, { method: 'PATCH', body: JSON.stringify(c) }),
  borrarCita: (id) => pedir(`/api/citas/${id}`, { method: 'DELETE' }),
  compras: (desde, hasta) => pedir('/api/compras?' + new URLSearchParams({ desde, hasta })),
  registrarCompra: (c) => pedir('/api/compras', { method: 'POST', body: JSON.stringify(c) }),
  gastos: (desde, hasta) => pedir('/api/gastos?' + new URLSearchParams({ desde, hasta })),
  crearGasto: (g) => pedir('/api/gastos', { method: 'POST', body: JSON.stringify(g) }),
  borrarGasto: (id) => pedir(`/api/gastos/${id}`, { method: 'DELETE' }),
  resumen: (desde, hasta) => pedir('/api/finanzas/resumen?' + new URLSearchParams({ desde, hasta })),
}
