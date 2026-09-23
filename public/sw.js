// Minimal service worker: makes the app installable and shows a fallback page offline.
// Statuses are live data, so everything else goes straight to the network.
const OFFLINE_HTML = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ImAwake</title><body style="font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:16px"><div><p style="font-size:48px;margin:0">🌙</p><p>Pas de connexion.<br>Réessaie quand tu es en ligne.</p></div></body></html>`;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(
      () => new Response(OFFLINE_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } }),
    ),
  );
});
