/* Élec TIIN — fonctionnement hors connexion.
   Changer CACHE à chaque publication (tools/version.py le fait automatiquement). */
const CACHE='elec-tiin-823b93d93c';
const ASSETS=['./','./index.html','./style.css','./icon.svg','./manifest.webmanifest',
 './assets/fonts/lexend.css','./assets/fonts/lexend-0.ttf','./assets/fonts/lexend-1.ttf','./assets/fonts/lexend-2.ttf','./assets/fonts/lexend-3.ttf',
 './assets/logo-tocqueville.png','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png',
 './js/dessin.js','./js/export.js','./js/moteur.js','./js/symboles-data.js','./js/atelier.js','./js/symboles.js','./js/defis-data.js','./js/defis.js','./js/fluidique-dessin.js','./js/fluidique-data.js','./js/fluidique.js','./js/depannage-data.js','./js/depannage.js','./js/consignation-data.js','./js/consignation.js','./js/consignation-fluides.js','./js/protection.js','./js/app.js',
 './js/schemas/direct-un-sens.js','./js/schemas/deux-sens.js','./js/schemas/etoile-triangle.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:'reload'}))))));
self.addEventListener('message',e=>{if(e.data&&e.data.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('elec-tiin-')&&x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==self.location.origin)return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:true});if(hit)return hit;
    try{return await fetch(e.request);}catch(err){if(e.request.mode==='navigate')return c.match('./index.html');throw err;}
  }));
});
