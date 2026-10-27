/* Élec TIIN — moteur de simulation.
   Logique « tout ou rien » : on ne calcule pas de courants, on cherche quels conducteurs
   sont reliés à quelle source par des contacts fermés (équipotentielles).
   - un récepteur (bobine, voyant, transformateur) est alimenté si ses deux bornes sont reliées
     à deux sources différentes (deux phases, ou phase et neutre / 24 V et 0 V) ;
   - deux sources différentes reliées sans récepteur entre elles = court-circuit :
     l'appareil de protection désigné par le schéma déclenche ;
   - les contacteurs suivent leur bobine ; les contacts temporisés « travail » changent d'état
     après la durée réglée, bobine alimentée sans interruption. */
(function(){
"use strict";

class Simulation{
  constructor(schema){
    this.sch=schema;
    this.contacts=[];
    schema.folios.forEach(f=>(f.contacts||[]).forEach(c=>this.contacts.push(c)));
    (schema.contactsCaches||[]).forEach(c=>this.contacts.push(c)); // contacts non dessinés (groupe, MALT-CC)
    this.reinitialiser();
  }
  reinitialiser(){
    this.app={};
    for(const [id,a] of Object.entries(this.sch.appareils)){
      const etat={type:a.type};
      if(a.type==="manuel"){etat.ferme=a.initial!==false;etat.declenche=false;}
      if(a.type==="poussoir"||a.type==="au")etat.appuye=false;
      if(a.type==="contacteur"){etat.ferme=false;etat.t0=null;etat.ecoule=false;}
      if(a.type==="thermique")etat.declenche=false;
      this.app[id]=etat;
    }
    this.court=null;this.charges={};
    return this.resoudre();
  }
  maintenant(){return performance.now()/1000;}

  /* ---------- état d'un contact ---------- */
  ferme(c){
    const a=this.app[c.app]; if(!a)throw new Error("Appareil inconnu : "+c.app);
    const m=c.mode||"no";
    switch(a.type){
      case "manuel": return m==="nf"?!a.ferme:a.ferme;
      case "poussoir": case "au": return m==="nf"?!a.appuye:a.appuye;
      case "thermique": return m==="nf"?!a.declenche:a.declenche;
      case "contacteur":{
        const t=a.ferme&&a.ecoule;
        if(m==="tno")return t; if(m==="tnf")return !t;
        return m==="nf"?!a.ferme:a.ferme;
      }
    }
    return false;
  }

  /* ---------- actions de l'utilisateur ---------- */
  basculer(id){
    const a=this.app[id];
    if(a.type==="manuel"){
      if(a.declenche){a.declenche=false;a.ferme=true;} // réarmement / remplacement des fusibles
      else a.ferme=!a.ferme;
      if(a.ferme)this.court=null;
    } else if(a.type==="au") a.appuye=!a.appuye;
    else if(a.type==="thermique") a.declenche=false;
    return this.resoudre();
  }
  appuyer(id,v){const a=this.app[id];if(a.appuye===v)return null;a.appuye=v;return this.resoudre();}
  declencher(id){
    const a=this.app[id];
    if(a.type==="manuel"){a.ferme=false;a.declenche=true;}
    if(a.type==="thermique")a.declenche=true;
    return this.resoudre();
  }

  /* ---------- résolution ---------- */
  composantes(){
    const parent={};
    const trouve=n=>{if(!(n in parent))parent[n]=n;while(parent[n]!==n){parent[n]=parent[parent[n]];n=parent[n];}return n;};
    const unir=(a,b)=>{a=trouve(a);b=trouve(b);if(a!==b)parent[a]=b;};
    for(const c of this.contacts){trouve(c.haut);trouve(c.bas);if(this.ferme(c))unir(c.haut,c.bas);}
    for(const l of (this.sch.liaisons||[]))unir(l[0],l[1]); // conducteurs portant deux noms
    return trouve;
  }
  resoudre(){
    // on part de l'état précédent des récepteurs : un transformateur déjà alimenté
    // garde son secondaire sous tension pendant la recherche (sinon l'auto-maintien retomberait)
    const sch=this.sch; let trouve,srcComp,charges=Object.assign({},this.charges||{});
    let stable=false;
    for(let tour=0;tour<30;tour++){
      trouve=this.composantes();
      // sources actives (une source conditionnelle dépend d'un transformateur alimenté)
      srcComp={};
      for(const s of sch.sources){
        if(s.si&&!charges[s.si])continue;
        const k=trouve(s.net);(srcComp[k]=srcComp[k]||[]);
        if(!srcComp[k].some(x=>x.nom===s.nom))srcComp[k].push(s);
      }
      // court-circuit : deux sources différentes dans la même équipotentielle
      let declenche=false;
      for(const k in srcComp){
        const noms=srcComp[k].map(s=>s.nom);
        if(noms.length<2)continue;
        const prot=(sch.protections||[]).find(p=>noms.every(n=>p.noms.includes(n))&&this.app[p.app]&&this.app[p.app].ferme);
        if(prot){const a=this.app[prot.app];a.ferme=false;a.declenche=true;
          this.court={app:prot.app,texte:prot.texte||("Court-circuit : "+prot.app+" a déclenché.")};declenche=true;break;}
      }
      if(declenche)continue;
      // récepteurs
      const nouv={};
      for(const ch of sch.charges){
        const a=srcComp[trouve(ch.a)]||[],b=srcComp[trouve(ch.b)]||[];
        nouv[ch.id]=a.length>0&&b.length>0&&a.some(x=>b.every(y=>y.nom!==x.nom));
      }
      // contacteurs et temporisations
      let change=false; const t=this.maintenant(); this.echeance=null;
      for(const [id,def] of Object.entries(sch.appareils)){
        if(def.type!=="contacteur")continue;
        const a=this.app[id],alim=!!nouv[def.bobine];
        if(a.ferme!==alim){a.ferme=alim;change=true;}
        if(def.tempo){
          if(a.ferme){if(a.t0===null)a.t0=t;const ec=t-a.t0>=def.tempo;
            if(ec!==a.ecoule){a.ecoule=ec;change=true;}
            if(!ec)this.echeance=Math.min(this.echeance??Infinity,a.t0+def.tempo);}
          else if(a.t0!==null||a.ecoule){a.t0=null;a.ecoule=false;change=true;}
        }
      }
      for(const k in nouv)if(!!charges[k]!==nouv[k])change=true;
      charges=nouv;
      if(!change){stable=true;break;}
    }
    // pas d'état stable : un contacteur se coupe lui-même (pompage)
    this.instable=!stable;
    this.trouve=trouve;this.srcComp=srcComp;this.charges=charges;
    this.mot=this.etatMoteur();
    return this;
  }

  /* ---------- lecture de l'état ---------- */
  sourcesDe(net){return this.srcComp[this.trouve(net)]||[];}
  phaseDe(net){const s=this.sourcesDe(net).filter(x=>x.type==="phase");return s.length===1?s[0].nom:null;}
  etatNet(net){
    const s=this.sourcesDe(net);
    if(s.some(x=>x.type==="phase"))return {cls:"vif",phase:s.find(x=>x.type==="phase").nom};
    if(s.length)return {cls:"neutre"};
    return {cls:"mort"};
  }
  etatMoteur(){
    const m=this.sch.moteur; if(!m)return null;
    const ordre=["L1","L2","L3"], idx=p=>ordre.indexOf(p);
    const sens=(a,b,c)=>((idx(b)-idx(a)+3)%3===1)?1:2;
    if(m.type==="direct"){
      const p=m.bornes.map(n=>this.phaseDe(n));
      if(p.every(x=>x)&&new Set(p).size===3)return {tourne:true,sens:sens(...p),couplage:null};
      if(p.some(x=>x))return {tourne:false,anomalie:"Le moteur ne reçoit pas ses trois phases."};
      return {tourne:false};
    }
    if(m.type==="etoile-triangle"){
      const b=m.bornes, ph=k=>this.phaseDe(b[k]);
      const t1=[ph("U1"),ph("V1"),ph("W1")];
      if(!t1.every(x=>x)||new Set(t1).size<3){
        if(t1.some(x=>x))return {tourne:false,anomalie:"Le moteur ne reçoit pas ses trois phases."};
        return {tourne:false};
      }
      const k2=["U2","V2","W2"].map(k=>this.trouve(b[k]));
      if(k2[0]===k2[1]&&k2[1]===k2[2]&&!this.sourcesDe(b.U2).length)
        return {tourne:true,sens:sens(...t1),couplage:"étoile"};
      const t2=[ph("U2"),ph("V2"),ph("W2")];
      if(t2.every(x=>x)&&t1.every((p,i)=>p!==t2[i]))return {tourne:true,sens:sens(...t1),couplage:"triangle"};
      return {tourne:false,anomalie:"Enroulements alimentés d'un seul côté : aucun couplage n'est réalisé."};
    }
    return null;
  }
  /* aide pour les explications des schémas */
  aide(){
    const s=this;
    return {
      ferme:id=>{const a=s.app[id];return a.type==="manuel"||a.type==="contacteur"?a.ferme:!a.appuye;},
      appuye:id=>!!s.app[id].appuye,
      declenche:id=>!!s.app[id].declenche,
      alimente:id=>!!s.charges[id],
      sous:net=>s.sourcesDe(net).length>0,
      tempo:id=>s.app[id],
      moteur:s.mot||{},
      court:s.court
    };
  }
}
window.ElecSimulation=Simulation;
})();
