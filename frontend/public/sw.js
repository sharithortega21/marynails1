// Service worker minimo de Mary Nails: permite instalar la pagina como aplicacion en el celular.
// No guarda datos ni la API en cache: todo se pide al servidor, asi Mary siempre ve lo ultimo.
// Si no hay internet al abrir la app, muestra un aviso en vez de la pagina de error del navegador.
const AVISO = `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mary Nails</title><body style="font-family:system-ui,sans-serif;background:#fdf4f5;color:#332227;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:24px">
<div><div style="width:64px;height:64px;border-radius:50%;background:#c23c5d;color:#fff;display:grid;place-items:center;font:700 30px Georgia,serif;margin:0 auto 16px">M</div>
<h1 style="font-family:Georgia,serif;font-size:22px">Sin conexión</h1><p>Mary Nails necesita internet. Revisa los datos o el wifi y vuelve a intentar.</p>
<button onclick="location.reload()" style="border:0;border-radius:999px;background:#c23c5d;color:#fff;padding:10px 20px;font-weight:600">Reintentar</button></div></body></html>`;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return; // el resto va directo a la red
  e.respondWith(fetch(e.request).catch(() => new Response(AVISO, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })));
});
