// v2 : les pages privées (compte connecté) ne sont plus jamais mises en cache.
// Changer de nom de cache supprime à l'activation les anciennes copies (v1).
const CACHE_NAME = 'drop-job-v2'
const PRECACHE_URLS = ['/', '/jobs', '/offline']
const STATIC_PATTERN = /\.(png|jpg|jpeg|gif|svg|woff|woff2|ico)$/

// Pages personnelles : toujours demandées au serveur, jamais copiées sur l'appareil
const PRIVATE_PREFIXES = ['/dashboard', '/profile', '/cv', '/auth', '/api/']

function isPrivate(pathname) {
  return PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p.endsWith('/') ? p : p + '/') || pathname.startsWith(p + '?'))
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return
  if (isPrivate(url.pathname)) return

  const isStatic =
    STATIC_PATTERN.test(url.pathname) || url.pathname.startsWith('/_next/static/')

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
      })
    )
  } else {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // On ne garde que les vraies pages publiques (pas les redirections vers la connexion)
          if (response.ok && !response.redirected) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match('/offline'))
        )
    )
  }
})
