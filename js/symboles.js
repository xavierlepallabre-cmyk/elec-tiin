/* Élec TIIN — Symboles : imagier et jeu de reconnaissance.
   Le jeu ne garde aucune trace : le bilan s'affiche à la fin de la série, puis disparaît. */
(function(){
"use strict";
const D=window.ElecDessin;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const melange=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

function dessiner(sym,label){
  const svg=document.createElementNS(D.NS,"svg");
  svg.setAttribute("role","img");svg.setAttribute("aria-label",label||sym.nom);
  const F=D.construire(svg,sym.f);
  Object.values(F.contacts).forEach(c=>c.maj(c.spec.mode==="nf","var(--mort)"));
  return svg;
}

function imagier(main){
  const cats=window.ELEC_CATEGORIES;let filtre="tous";
  main.innerHTML=`
    <div class="page-head"><div>
      <p class="tag"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>Symboles</p>
      <h1>Symboles normalisés</h1>
      <p class="lead">Les symboles des schémas de l'Atelier, avec la lettre repère de l'appareil et ses bornes usuelles. Contacts dessinés au repos.</p>
    </div><a class="btn btn-primary" href="#/symboles/jeu">Jouer : reconnaître les symboles</a></div>
    <div class="filtres" role="group" aria-label="Familles de symboles">${cats.map(c=>`<button type="button" data-c="${c.id}" aria-pressed="${c.id==="tous"}">${esc(c.nom)}</button>`).join("")}</div>
    <label class="option export-nb"><input type="checkbox" id="expNoir"> Exporter en noir et blanc (photocopie)</label>
    <div class="imagier" id="imagier"></div>`;
  const zone=main.querySelector("#imagier");
  function remplir(){
    zone.innerHTML="";
    window.ELEC_SYMBOLES.filter(s=>filtre==="tous"||s.cat===filtre).forEach(s=>{
      const a=document.createElement("article");a.className="fiche";
      a.innerHTML=`<div class="dessin"></div><div class="txt"><div class="ligne"><h3>${esc(s.nom)}</h3>${s.repere?`<span class="repere">${esc(s.repere)}</span>`:""}</div>
        <p>${esc(s.fonction)}</p>${s.bornes?`<p><b>Bornes :</b> ${esc(s.bornes)}</p>`:""}
        <div class="exp-sym" role="group" aria-label="Exporter ${esc(s.nom)}"><span>Exporter</span><button type="button" class="btn" data-fmt="svg">SVG</button><button type="button" class="btn" data-fmt="png">PNG</button></div></div>`;
      const svg=dessiner(s);
      a.querySelector(".dessin").appendChild(svg);
      a.querySelectorAll("[data-fmt]").forEach(b=>b.addEventListener("click",async()=>{
        const X=window.ElecExport,noir=main.querySelector("#expNoir").checked;
        const nom="symbole-"+X.slug(s.nom)+(noir?"-nb":"");
        const ok=await X.exporter(()=>({svg}),b.dataset.fmt,nom,{noir,titre:s.nom,description:"Symbole, contacts au repos"},b);
        if(!ok)b.closest(".exp-sym").querySelector("span").textContent="Échec, essaie l'autre format";
      }));
      zone.appendChild(a);
    });
  }
  main.querySelectorAll(".filtres button").forEach(b=>b.addEventListener("click",()=>{
    filtre=b.dataset.c;main.querySelectorAll(".filtres button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));remplir();
  }));
  remplir();
  return ()=>{};
}

const LETTRES=["Q","QS","F","KM","S","H","M","T","X"];
function jeu(main){
  const total=10;let n=0,bons=0,questions=[];
  const tous=window.ELEC_SYMBOLES;
  // série : symboles tirés sans répétition ; un tiers des questions porte sur la lettre repère
  melange(tous).slice(0,total).forEach(s=>{
    const lettre=LETTRES.includes(s.repere);
    questions.push({s,type:lettre&&Math.random()<0.35?"repere":"nom"});
  });
  function question(){
    const q=questions[n],s=q.s;
    let options;
    if(q.type==="nom"){
      const proches=tous.filter(x=>x.id!==s.id&&x.cat===s.cat),autres=tous.filter(x=>x.id!==s.id&&x.cat!==s.cat);
      options=melange([s.nom,...melange(proches).slice(0,2).map(x=>x.nom),...melange(autres).slice(0,1).map(x=>x.nom)]);
      if(new Set(options).size<4)options=melange([s.nom,...melange(tous.filter(x=>x.id!==s.id)).slice(0,3).map(x=>x.nom)]);
    } else options=melange([s.repere,...melange(LETTRES.filter(l=>l!==s.repere)).slice(0,3)]);
    const bonne=q.type==="nom"?s.nom:s.repere;
    main.innerHTML=`
      <a class="retour" href="#/symboles">← Imagier</a>
      <div class="jeu">
        <div class="progression"><span>Question ${n+1} sur ${total}</span><span class="barre"><i style="width:${n/total*100}%"></i></span></div>
        <div class="question"><div class="dessin"></div><div class="corps">
          <h2>${q.type==="nom"?"Quel est ce symbole ?":"Quelle lettre repère l'appareil représenté ?"}</h2>
          <div class="choix">${options.map(o=>`<button type="button">${esc(o)}</button>`).join("")}</div>
          <div class="retour-jeu" hidden aria-live="polite"></div>
          <button type="button" class="btn btn-primary suite" hidden>${n+1<total?"Question suivante":"Voir le bilan"}</button>
        </div></div>
      </div>`;
    main.querySelector(".dessin").appendChild(dessiner(s,"Symbole à reconnaître"));
    const fb=main.querySelector(".retour-jeu"),suite=main.querySelector(".suite");
    main.querySelectorAll(".choix button").forEach(b=>b.addEventListener("click",()=>{
      const ok=b.textContent===bonne;if(ok)bons++;
      main.querySelectorAll(".choix button").forEach(x=>{x.disabled=true;if(x.textContent===bonne)x.classList.add("juste");});
      if(!ok)b.classList.add("faux");
      fb.hidden=false;fb.className="retour-jeu "+(ok?"juste":"faux");
      fb.innerHTML=`<b>${ok?"Exact.":"Ce n'est pas ça."}</b> ${esc(s.nom)}${s.repere&&LETTRES.includes(s.repere)?` (repère ${esc(s.repere)})`:""} : ${esc(s.fonction)}`;
      suite.hidden=false;suite.focus();
    }));
    suite.addEventListener("click",()=>{n++;n<total?question():bilan();});
  }
  function bilan(){
    const msg=bons>=9?"Excellent, tu reconnais les symboles sans hésiter.":bons>=6?"Bien. Revois dans l'imagier les symboles qui t'ont fait hésiter.":"Prends le temps de parcourir l'imagier, puis rejoue une série.";
    main.innerHTML=`<a class="retour" href="#/symboles">← Imagier</a>
      <div class="jeu"><div class="bilan"><p class="tag">Bilan de la série</p><p class="gros">${bons} / ${total}</p><p>${msg}</p>
      <p class="astuce">Ce résultat n'est pas enregistré.</p>
      <div class="actions"><button type="button" class="btn btn-primary" id="rejouer">Rejouer une série</button><a class="btn" href="#/symboles">Revoir l'imagier</a></div></div></div>`;
    main.querySelector("#rejouer").addEventListener("click",()=>{n=0;bons=0;questions=[];melange(tous).slice(0,total).forEach(s=>questions.push({s,type:LETTRES.includes(s.repere)&&Math.random()<0.35?"repere":"nom"}));question();});
  }
  question();
  return ()=>{};
}

window.ElecSymboles={imagier,jeu};
})();
