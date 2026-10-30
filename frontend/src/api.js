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
    let msg = 'Algo salió mal'
    try { msg = (await res.json()).message || (res.status === 401 ? 'Correo o clave incorrectos' : msg) } catch { /* sin cuerpo */ }
    throw new Error(msg)
  }
  return res.json()
}

export const api = {
  login: (correo, clave) => pedir('/api/auth/login', { method: 'POST', body: JSON.stringify({ correo, clave }) }),
  categorias: () => pedir('/api/categorias'),
  lineas: () => pedir('/api/lineas-color'),
  productos: (p) => pedir('/api/productos?' + new URLSearchParams(p)),
  actualizar: (id, cambios) => pedir(`/api/productos/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) }),
  listaCompras: () => pedir('/api/lista-compras'),
}
