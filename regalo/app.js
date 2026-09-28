import { IDEAS } from './catalogo.js';
import { abrirCheckout, iniciarCheckout, sePuedeComprar } from './checkout.js';
import { bandera, MONEDAS, nombreMoneda, PAISES, paisDelIdioma } from './paises.js';
import { enlaceCompra, textoCompra, sorpresa } from './tienda.js';
import { INTERESTS, REL, OCC, PROFESSIONS, PERSONALITY, SPECIAL, conceptosDesdeTexto, expandConceptos, oportunidadesDesdeConceptos, scoreConceptoEnIdea, scoreOportunidadEnIdea, normalizeLocal } from './semantica.js';

const $ = id => document.getElementById(id);
const REGION_KEY = 'acierto.region';
let region = read(REGION_KEY);
let tasas = null;
let currentIdeas = [];
let activeFilter = 'all';
let lastIdeaId = null;

function read(k){try{return JSON.parse(localStorage.getItem(k))}catch{return null}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}

function init(){
  setupRegion();
  setupExamples();
  setupSurprise();
  $('encontrar').onclick = run;
  $('persona').addEventListener('keydown', e => {
    if((e.ctrlKey || e.metaKey) && e.key === 'Enter') run();
  });
  $('editar').onclick = () => {
    $('resultados-section').style.display = 'none';
    $('persona').focus();
    window.scrollTo({top:0,behavior:'smooth'});
  };
  iniciarCheckout(() => ({...regionActual(),tasas})).then(() => {});
}

function setupExamples(){
  document.querySelectorAll('.example2').forEach(b => b.onclick = () => {
    const key = b.textContent.replace(/^\S+\s/,'').trim();
    const map = {
      'Científica que se gradúa':'Mi amiga es científica, trabaja en un laboratorio y acaba de terminar su doctorado. Le gusta la astronomía, es curiosa y ya tiene muchísimas cosas relacionadas con su trabajo.',
      'Piloto que ya tiene de todo':'Mi hermano es piloto comercial, viaja mucho, tiene casi todo el equipo que necesita y es muy práctico. Le encanta la aviación y también salir a correr.',
      'Amigo obsesionado con cocinar':'Mi mejor amigo tiene 34 años y está obsesionado con cocinar. Tiene una cocina muy equipada, le encanta probar recetas nuevas y descubrir ingredientes de otros países.',
      'Pareja a distancia':'Mi pareja vive en otro país. Nos gustan los viajes, la fotografía y tenemos muchos recuerdos juntos. Quiero algo personal que nos haga sentir cerca.',
      'Alguien difícil de regalar':'Es una persona que siempre dice que no necesita nada. Tiene de todo, es bastante minimalista y prefiere experiencias a acumular objetos.'
    };
    $('persona').value = map[key] || '';
    run();
  });
}

function setupSurprise(){
  $('sorprendeme').onclick = () => showSurprise();
  $('otra-sorpresa').onclick = () => showSurprise();
  $('cerrar-sorpresa').onclick = () => $('dialogo-sorpresa').close();
}
function showSurprise(){
  const idea = sorpresa(lastIdeaId);
  if(!idea) return;
  lastIdeaId = idea.id;
  $('idea-sorpresa').innerHTML = '<h3 style="margin:0 0 8px">'+esc(idea.nombre)+'</h3><p style="margin:0;color:var(--suave)">'+esc(idea.porque)+'</p>';
  $('dialogo-sorpresa').showModal();
}

function setupRegion(){
  const p=$('pais'),m=$('moneda');
  Object.entries(PAISES).forEach(([c,x])=>p.append(new Option(bandera(c)+' '+x.nombre,c)));
  MONEDAS.forEach(x=>m.append(new Option(x+' · '+nombreMoneda(x),x)));
  p.onchange=()=>m.value=PAISES[p.value].moneda;
  $('region').onclick=openRegion;
  $('form-region').onsubmit=()=>{
    region={pais:p.value,moneda:m.value};
    save(REGION_KEY,region);
    paintRegion();
  };
  paintRegion();
}

function regionActual(){
  if(region && PAISES[region.pais]) return region;
  const pais=paisDelIdioma(navigator.languages||[navigator.language]);
  return {pais,moneda:PAISES[pais].moneda};
}
function openRegion(){
  const r=regionActual();
  $('pais').value=r.pais;
  $('moneda').value=r.moneda;
  $('dialogo-region').showModal();
}
function paintRegion(){
  const r=regionActual();
  $('region').textContent=bandera(r.pais)+' '+r.moneda;
}

function normalize(value){ return normalizeLocal(value); }
function hasAny(text, words){
  const t=normalize(text);
  return words.some(x=>t.includes(normalize(x)));
}
function findGroups(text, groups){
  return Object.entries(groups).filter(([,words])=>hasAny(text,words)).map(([key])=>key);
}

function extract(text){
  const t=normalize(text);
  const detectedConcepts=conceptosDesdeTexto(t);
  const semanticConcepts=expandConceptos(detectedConcepts);
  const semanticOpportunities=oportunidadesDesdeConceptos(semanticConcepts);
  const p={
    interests:findGroups(t,INTERESTS),
    relations:findGroups(t,REL),
    occasions:findGroups(t,OCC),
    professions:findGroups(t,PROFESSIONS),
    personality:findGroups(t,PERSONALITY),
    age:null,
    budget:null,
    signals:[],
    avoid:[],
    custom:false,
    semantic_tags:[],
    semantic_concepts:semanticConcepts,
    semantic_opportunities:semanticOpportunities,
  };

  const age=t.match(/\b(\\d{1,3})\\s*(?:anos)\\b/);
  if(age) p.age=Number(age[1]);

  const budget=t.match(/(?:menos de|hasta|maximo|max|presupuesto de|presupuesto)\\s*(?:€|eur|\\$)?\\s*(\\d{1,5})/);
  if(budget) p.budget=Number(budget[1]);

  if(hasAny(t,SPECIAL.todo)){
    p.avoid.push('objetos genéricos');
    p.signals.push('Evitar otro objeto genérico');
    p.semantic_tags.push('experiencia','digital');
  }
  if(hasAny(t,SPECIAL.personal)){
    p.custom=true;
    p.signals.push('El componente personal importa');
    p.semantic_tags.push('personalizado','recuerdo');
  }
  if(hasAny(t,SPECIAL.unusual)){
    p.signals.push('Busca algo poco común');
    p.semantic_tags.push('original','sorpresa');
  }
  if(hasAny(t,SPECIAL.experience))p.semantic_tags.push('experiencia');
  if(hasAny(t,SPECIAL.urgent))p.semantic_tags.push('hoy');
  if(hasAny(t,SPECIAL.cheap))p.semantic_tags.push('economico');

  if(p.personality.includes('practico'))p.signals.push('Valora lo práctico y útil');
  if(p.personality.includes('minimalista'))p.signals.push('Conviene evitar acumular objetos');
  if(p.personality.includes('sentimental'))p.signals.push('La historia emocional puede ser parte del regalo');
  if(p.occasions.includes('graduacion'))p.signals.push('Momento profesional importante');
  if(p.professions.length)p.signals.push('Su profesión puede orientar una idea específica');
  if(semanticConcepts.length){
    const lead=semanticConcepts.slice(0,4).map(([id])=>labelConcepto(id)).join(' · ');
    p.signals.push('Hemos conectado '+semanticConcepts.length+' conceptos relacionados: '+lead);
  }

  p.semantic_tags=[
    ...new Set([
      ...p.interests,
      ...p.professions,
      ...p.personality,
      ...p.occasions,
      ...p.semantic_tags,
      ...semanticConcepts.map(([id])=>id),
      ...semanticOpportunities.slice(0,12).map(([id])=>id)
    ])
  ];
  return p;
}

function ageBucket(age){
  if(!age)return null;
  return age<13?'nino':age<25?'joven':age<60?'adulto':'mayor';
}

function score(i,p){
  let s=0;
  const text=normalize([i.nombre,i.porque,i.tipo,...(i.intereses||[]),...(i.categorias||[]),i.busqueda].join(' '));

  for(const x of p.interests) if((i.intereses||[]).includes(x)) s+=10;
  for(const x of p.relations) if((i.relaciones||[]).includes(x)) s+=4;
  for(const x of p.professions) if(text.includes(normalize(x))) s+=6;

  // La red semántica permite acertar aunque el texto del regalo no mencione literalmente
  // la profesión original: arqueología → historia → mapa/museo/experiencia, por ejemplo.
  for(const [concept,weight] of p.semantic_concepts||[]){
    if(scoreConceptoEnIdea(concept,text)) s += 5 * Math.min(weight,1);
  }
  for(const [opportunity,weight] of p.semantic_opportunities||[]){
    if(scoreOportunidadEnIdea(opportunity,text)) s += 4 * Math.min(weight,1.5);
  }
  for(const x of p.personality){
    if((x==='practico' || x==='minimalista') && ['experiencia','digital','tiempo','consumible'].includes(i.tipo))s+=4;
    if(x==='sentimental' && i.categorias?.includes('con-historia'))s+=8;
    if(x==='creativo' && (i.categorias?.includes('con-historia') || i.tipo==='tiempo'))s+=5;
    if(x==='curioso' && text.includes('aprend'))s+=5;
  }
  for(const x of p.occasions){
    if(x==='graduacion' && (i.categorias?.includes('su-obsesion') || i.categorias?.includes('con-historia')))s+=5;
    if(x==='cumpleanos' && i.categorias?.includes('con-historia'))s+=4;
    if(x==='aniversario' && i.categorias?.includes('con-historia'))s+=7;
    if(x==='jubilacion' && i.tipo==='experiencia')s+=5;
    if(x==='nuevoTrabajo' && (i.tipo==='objeto'||i.tipo==='experiencia'))s+=3;
  }
  if(p.age){
    const b=ageBucket(p.age);
    if(!i.edades || i.edades.includes(b))s+=3; else s-=7;
  }
  if(p.budget){
    const min=i.precio?.[0]??0;
    if(min<=p.budget)s+=3; else s-=5;
  }
  if(p.avoid.length){
    if(['experiencia','digital','tiempo','consumible'].includes(i.tipo))s+=7;
    if(i.categorias?.includes('lo-tiene-todo'))s+=6;
  }
  if(p.custom && i.categorias?.includes('con-historia'))s+=8;
  if(p.semantic_tags.some(x=>text.includes(normalize(x))))s+=2;

  return s;
}

function analyze(text){
  const p=extract(text);
  currentIdeas=IDEAS.map(i=>Object.assign({},i,{_score:score(i,p)}))
    .sort((a,b)=>b._score-a._score || a.precio[0]-b.precio[0]);
  return p;
}

async function run(){
  const text=$('persona').value.trim();
  if(text.length<12){$('persona').focus();return;}
  const button=$('encontrar');
  button.disabled=true;
  button.textContent='✨ Buscando coincidencias…';
  $('resultados-section').style.display='block';
  $('summary').textContent='Estamos cruzando intereses, relación, ocasión, personalidad y contexto.';
  $('signals').replaceChildren();
  $('resultados').innerHTML='<div class="vacio">🔎 Buscando las mejores coincidencias…</div>';
  $('resultados-section').scrollIntoView({behavior:'smooth',block:'start'});
  try{
    const profile=analyze(text);
    renderProfile(profile);
  }finally{
    button.disabled=false;
    button.textContent='✨ Encontrar regalos';
  }
}

function renderProfile(p){
  const bits=[];
  if(p.age)bits.push('tiene '+p.age+' años');
  if(p.relations.length)bits.push('es '+p.relations[0]);
  if(p.professions.length)bits.push(p.professions[0]);
  if(p.interests.length)bits.push('le interesa '+p.interests.slice(0,3).join(', '));
  $('summary').textContent=p.signals.length
    ? p.signals.slice(0,2).join('. ')+'. Hemos usado ese contexto para ordenar las ideas.'
    : ('Por lo que cuentas, '+(bits.join(', ')||'hay varias señales interesantes')+'. Hemos usado ese contexto para ordenar las ideas.');

  const s=$('signals');
  s.replaceChildren();
  const items=[];
  if(p.age)items.push('🎂 '+p.age+' años');
  if(p.relations.length)items.push('👥 '+p.relations[0]);
  p.professions.slice(0,2).forEach(x=>items.push('💼 '+x));
  p.interests.slice(0,4).forEach(x=>items.push('♡ '+labelInterest(x)));
  p.occasions.slice(0,1).forEach(x=>items.push('📅 '+labelOccasion(x)));
  p.personality.slice(0,2).forEach(x=>items.push('✦ '+labelPersonality(x)));
  if(p.budget)items.push('€ ≤ '+p.budget);
  p.signals.slice(0,2).forEach(x=>items.push('• '+x));
  items.slice(0,8).forEach(x=>{
    const b=document.createElement('span');
    b.className='signal2';
    b.textContent=x;
    s.append(b);
  });
  activeFilter='all';
  renderFilters();
  renderCards();
}

function labelConcepto(i){
  const labels={
    arqueologia:'arqueología', antropologia:'antropología', historia:'historia', patrimonio:'patrimonio',
    museo:'museos', cultura:'cultura', excavacion:'excavación', etnografia:'etnografía',
    cartografia:'cartografía', campo:'trabajo de campo', investigacion:'investigación',
    arquitectura:'arquitectura', ingenieria:'ingeniería', mecanica:'mecánica', electricidad:'electricidad',
    electronica:'electrónica', aviacion:'aviación', marina:'náutica', medicina:'medicina',
    biologia:'biología', botanica:'botánica', zoologia:'zoología', geologia:'geología',
    astronomia:'astronomía', fisica:'física', quimica:'química', matematicas:'matemáticas',
    programacion:'programación', ia:'IA', datos:'datos', ciberseguridad:'ciberseguridad',
    cocina:'cocina', cafe:'café', vino:'vino', lectura:'lectura', escritura:'escritura',
    musica:'música', fotografia:'fotografía', cine:'cine', arte:'arte', diseno:'diseño',
    manualidades:'manualidades', bricolaje:'bricolaje', jardines:'jardín', mascotas:'mascotas',
    viajes:'viajes', naturaleza:'naturaleza', deporte:'deporte', pesca:'pesca', videojuegos:'videojuegos',
    juegos:'juegos', idiomas:'idiomas', baile:'baile', coleccionismo:'coleccionismo',
    sostenibilidad:'sostenibilidad', aventura:'aventura', ciencia:'ciencia', tecnologia:'tecnología'
  };
  return labels[i]||String(i).replace(/([A-Z])/g,' $1').replace(/_/g,' ').replace(/^./,c=>c.toUpperCase());
}

function labelInterest(i){
  return {cocina:'cocina',cafe:'café',bebidas:'bebidas',deporte:'deporte',naturaleza:'naturaleza',viajes:'viajes',lectura:'lectura',musica:'música',cine:'cine',juegos:'juegos',videojuegos:'videojuegos',tecnologia:'tecnología',plantas:'plantas',manualidades:'arte',bienestar:'bienestar',mascotas:'mascotas',moda:'moda',foto:'fotografía'}[i]||i;
}
function labelOccasion(i){
  return {graduacion:'graduación',cumpleanos:'cumpleaños',aniversario:'aniversario',navidad:'Navidad',jubilacion:'jubilación',nuevoTrabajo:'nuevo trabajo',mudanza:'mudanza',nacimiento:'nacimiento'}[i]||i;
}
function labelPersonality(i){
  return {practico:'práctico',minimalista:'minimalista',curioso:'curioso',aventurero:'aventurero',sentimental:'sentimental',creativo:'creativo',foodie:'foodie'}[i]||i;
}

function renderFilters(){
  const f=$('filters');
  f.replaceChildren();
  [['all','Todo'],['personal','❤️ Más personales'],['experience','🎟️ Experiencias'],['unusual','✨ Poco comunes'],['fast','⚡ Para hoy']].forEach(([id,label])=>{
    const b=document.createElement('button');
    b.className='filter2'+(activeFilter===id?' active':'');
    b.textContent=label;
    b.setAttribute('aria-pressed',activeFilter===id?'true':'false');
    b.onclick=()=>{activeFilter=id;renderFilters();renderCards();};
    f.append(b);
  });
}

function filtered(){
  return currentIdeas.filter(i=>{
    if(activeFilter==='personal')return i.categorias?.includes('con-historia')||i.tipo==='tiempo';
    if(activeFilter==='experience')return i.tipo==='experiencia';
    if(activeFilter==='unusual')return i.categorias?.includes('su-obsesion')||i.categorias?.includes('lo-tiene-todo');
    if(activeFilter==='fast')return i.plazo==='hoy';
    return true;
  }).slice(0,12);
}

function renderCards(){
  const out=$('resultados');
  out.replaceChildren();
  const list=filtered();
  const groups=[['🎯 Aciertos principales',list.slice(0,3)],['✨ Otras ideas que encajan',list.slice(3,8)]];
  groups.forEach(g=>{
    if(!g[1].length)return;
    const sec=document.createElement('section');
    sec.innerHTML='<div class="section-title2"><h3>'+g[0]+'</h3><span>'+g[1].length+' ideas seleccionadas</span></div><div class="cards2"></div>';
    const cards=sec.querySelector('.cards2');
    g[1].forEach((idea,idx)=>cards.append(card(idea,idx===0)));
    out.append(sec);
  });
  if(!list.length)out.innerHTML='<div class="vacio">No encontramos una combinación clara con ese filtro. Prueba con “Todo”.</div>';
}

function card(i,featured){
  const r=regionActual();
  const article=document.createElement('article');
  article.className='card2'+(featured?' featured':'');
  const type={objeto:'🎁 Objeto',consumible:'🍯 Consumible',experiencia:'🎟️ Experiencia',digital:'📲 Digital',tiempo:'💛 Hecho por ti'}[i.tipo]||'🎁 Regalo';
  const price=i.precio&&i.precio[0]===0?'Gratis / hecho por ti':currency(i.precio?.[0]||0,r.moneda)+' – '+currency(i.precio?.[1]||0,r.moneda);
  article.innerHTML='<div class="cardtop2"><span>'+type+'</span><span class="match2">'+(i._score>=12?'Encaja especialmente bien':'Puede encajar')+'</span></div><h4>'+esc(i.nombre)+'</h4><p>'+esc(i.porque)+'</p><div class="reason2">💡 '+esc(reason(i))+'</div><div class="cardfooter2"><span class="price2">'+price+'</span></div>';
  const footer=article.querySelector('.cardfooter2');
  if(sePuedeComprar(i)){
    const b=document.createElement('button');
    b.className='buy2';
    b.textContent='Comprar aquí';
    b.onclick=()=>abrirCheckout(i);
    footer.append(b);
  }else if(i.tipo!=='tiempo'){
    const a=document.createElement('a');
    a.className='buy2';
    a.href=enlaceCompra(i,r.pais);
    a.target='_blank';
    a.rel='noopener';
    a.textContent=textoCompra(i,r.pais);
    footer.append(a);
  }
  return article;
}

function reason(i){
  if(i._score>=16)return'Conecta con varias señales de lo que nos has contado.';
  if(i.categorias?.includes('con-historia'))return'Puede convertir vuestra historia en parte del regalo.';
  if(i.categorias?.includes('lo-tiene-todo'))return'Evita otro objeto genérico y aprovecha mejor el contexto.';
  if(i.tipo==='experiencia')return'Puede regalar un momento en lugar de otra cosa que guardar.';
  if(i.tipo==='tiempo')return'La personalización puede hacer que una idea sencilla sea irrepetible.';
  return'Encaja con intereses o situaciones presentes en la descripción.';
}

function currency(v,c){
  if(c==='USD')return '$'+v;
  if(c==='EUR')return '€'+v;
  if(c==='GBP')return '£'+Math.round(v*.86);
  return v+' '+c;
}
function esc(s){
  return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

init();
