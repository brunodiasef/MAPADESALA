// Service worker do "Mapa de Sala" — E.E.E.F.M. Ilda Ferreira da Fonseca Martins
//
// Este arquivo só funciona se for hospedado na MESMA pasta do mapa-de-sala.html
// em um endereço de internet (http:// ou https://) — não funciona abrindo o
// arquivo direto da pasta Downloads do computador (file://).
//
// Ele guarda uma cópia da página em cache para que o app continue abrindo
// mesmo sem internet (os dados dos alunos continuam sendo salvos normalmente
// pelo navegador, isso aqui só cuida do "abrir o app offline").

const CACHE_NAME = 'mapa-de-sala-v1';
const APP_SHELL = [
  './',
  './mapa-de-sala.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => { /* alguma URL do app shell pode não existir; ignora */ })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// Estratégia: tenta a rede primeiro (para sempre pegar a versão mais nova),
// e usa o cache como reserva se estiver offline.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
