/* Élec TIIN — navigation, thème, état réseau, mises à jour. */
(function(){
"use strict";
const VERSION="1.7.0";
const main=document.getElementById("main");
let quitter=()=>{};

function infos(){
  main.innerHTML=`
    <div class="page-head"><div>
      <p class="tag"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>Informations</p>
      <h1>À propos d'Élec TIIN</h1>
      <p class="lead">Simulateurs de schémas électriques pour les apprentis du Bac Pro TIIN, Lycée Alexis de Tocqueville.</p>
    </div></div>
    <div class="infos">
      <section class="bloc"><h2>Ce que fait la simulation</h2>
        <p>La simulation est « tout ou rien » : elle cherche quels conducteurs sont reliés à une source par des contacts fermés. Elle ne calcule ni courants ni chutes de tension.</p>
        <ul>
          <li>Un récepteur (bobine, voyant, transformateur) fonctionne quand ses deux bornes sont reliées à deux sources différentes.</li>
          <li>Deux sources différentes reliées sans récepteur provoquent un court-circuit : l'appareil de protection du schéma déclenche ou ses fusibles fondent.</li>
          <li>La surcharge est simulée par le bouton « Surcharge moteur » : la protection thermique déclenche.</li>
          <li>Le moteur tourne quand il reçoit ses trois phases. Son sens dépend de l'ordre des phases, le couplage étoile ou triangle est détecté automatiquement.</li>
        </ul></section>
      <section class="bloc"><h2>Références</h2>
        <ul>
          <li>Symboles graphiques : IEC 60617 (NF EN 60617).</li>
          <li>Équipement électrique des machines, sectionnement et arrêt d'urgence : NF EN 60204-1.</li>
          <li>Protection des personnes : NF C 15-100 (schéma TT, différentiel 30 mA), effets du courant d'après l'IEC 60479, conduite à tenir d'après le référentiel SST de l'INRS (ED 7000).</li>
          <li>Lettres repères des appareils (Q, KM, F, S, H, M, T, X) : usage courant issu de l'IEC 81346 et des anciennes recommandations françaises.</li>
          <li>Les schémas reprennent les macros LaTeX de l'enseignant (symboles-electriques.tex), pour que cours et simulateur aient le même dessin.</li>
        </ul></section>
      <section class="bloc"><h2>Confidentialité</h2>
        <p>Aucun compte, aucune note, aucun historique. L'application n'enregistre que le choix du thème clair ou sombre sur l'appareil.</p></section>
      <section class="bloc"><h2>Version et mise à jour</h2>
        <p>Version ${VERSION}. L'application fonctionne hors connexion après la première ouverture.</p>
        <div class="actions"><button type="button" class="btn" id="checkUpdate">Rechercher une mise à jour</button></div>
        <p id="updateStatus" class="astuce" aria-live="polite"></p></section>
      <section class="bloc"><h2>Crédits</h2>
        <p>Conception pédagogique : Xavier Le Pallabre, Bac Pro TIIN. Police Lexend, licence SIL Open Font License (assets/fonts/OFL.txt).</p></section>
    </div>`;
  const b=document.getElementById("checkUpdate");
  b.addEventListener("click",()=>{
    const st=document.getElementById("updateStatus");
    if(!("serviceWorker" in navigator)){st.textContent="Mise à jour automatique indisponible dans ce navigateur.";return;}
    navigator.serviceWorker.getRegistration().then(reg=>{
      if(!reg){st.textContent="Mise à jour indisponible ici : ouvre l'application depuis son adresse en ligne.";return;}
      return reg.update().then(()=>{st.textContent=reg.waiting?"Une mise à jour est disponible.":"Vérification effectuée : aucune mise à jour en attente.";});
    }).catch(()=>{st.textContent="Vérification indisponible hors connexion.";});
  });
  return ()=>{};
}

function route(){
  quitter();
  const h=(location.hash||"#/atelier").replace(/^#\/?/,"").split("/");
  const onglet=h[0]||"atelier";
  document.querySelectorAll("[data-onglet]").forEach(a=>{
    if(a.dataset.onglet===onglet)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");
  });
  try{
    if(onglet==="fluidique")quitter=h[1]?window.ElecFluidique.ouvrir(main,h[1]):window.ElecFluidique.liste(main);
    else if(onglet==="depannage")quitter=h[1]?window.ElecDepannage.ouvrir(main,h[1]):window.ElecDepannage.liste(main);
    else if(onglet==="consignation"){const C=window.ElecConsignation;
      quitter=h[1]==="presse-guidee"||h[1]==="presse-erreurs"?window.ElecConsFluides.scene(main,h[1]==="presse-guidee"?"guidee":"erreurs"):
        h[1]==="guidee"||h[1]==="erreurs"?C.scene(main,h[1]):h[1]==="roles"?C.roles(main):h[1]==="fluides"?C.fluides(main):
        h[1]==="ddr"?window.ElecProtection.ddr(main):h[1]==="effets"?window.ElecProtection.effets(main):h[1]==="accident"?window.ElecProtection.accident(main):C.accueil(main);}
    else if(onglet==="defis")quitter=h[1]?window.ElecDefis.ouvrir(main,+h[1]):window.ElecDefis.liste(main);
    else if(onglet==="symboles")quitter=h[1]==="jeu"?window.ElecSymboles.jeu(main):window.ElecSymboles.imagier(main);
    else if(onglet==="infos")quitter=infos();
    else quitter=h[1]?window.ElecAtelier.ouvrir(main,h[1]):window.ElecAtelier.liste(main);
  }catch(err){
    console.error(err);
    main.innerHTML=`<p class="lead">Cette page n'a pas pu s'afficher. <a href="#/atelier">Retour à l'Atelier</a></p>`;
    quitter=()=>{};
  }
  const titres={atelier:"Atelier",fluidique:"Fluidique",defis:"Défis",depannage:"Dépannage",consignation:"Sécurité",symboles:"Symboles",infos:"Informations"};
  document.title=(h[1]&&onglet==="atelier"?(window.ELEC_SCHEMAS.find(s=>s.id===h[1])||{}).titre+" · ":(titres[onglet]?titres[onglet]+" · ":""))+"Élec TIIN";
  window.scrollTo(0,0);
}
window.addEventListener("hashchange",route);
route();

/* thème */
document.getElementById("themeToggle").addEventListener("click",()=>{
  const r=document.documentElement;
  const sombre=r.dataset.theme?r.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches;
  r.dataset.theme=sombre?"light":"dark";
  try{localStorage.setItem("elec-theme",r.dataset.theme);}catch(e){}
});

/* état du réseau */
const net=document.getElementById("netStatus");
const majNet=()=>{net.hidden=navigator.onLine;};
addEventListener("online",majNet);addEventListener("offline",majNet);majNet();

/* service worker et proposition de mise à jour */
if("serviceWorker" in navigator&&location.protocol!=="file:"){
  const bar=document.createElement("aside");bar.className="update-bar";bar.hidden=true;bar.setAttribute("aria-live","polite");
  bar.innerHTML='<span>Une mise à jour d’Élec TIIN est prête.</span><button type="button" class="btn btn-primary">Mettre à jour</button><button type="button" class="btn btn-ghost">Plus tard</button>';
  document.body.append(bar);
  let attente=null,accepte=false;
  bar.querySelectorAll("button")[0].onclick=()=>{if(!attente)return;accepte=true;attente.postMessage({type:"ACTIVATE_UPDATE"});};
  bar.querySelectorAll("button")[1].onclick=()=>bar.hidden=true;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{if(accepte)location.reload();});
  navigator.serviceWorker.register("sw.js").then(reg=>{
    const proposer=()=>{if(reg.waiting&&navigator.serviceWorker.controller){attente=reg.waiting;bar.hidden=false;}};
    proposer();
    reg.addEventListener("updatefound",()=>{const i=reg.installing;i&&i.addEventListener("statechange",()=>{if(i.state==="installed")proposer();});});
  }).catch(()=>{});
}
})();
