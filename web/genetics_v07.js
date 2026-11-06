/* Atlas v0.7 — fantasy inheritance, runs offline. This is a game model. */
(function(){
'use strict';
const uid=()=> 'sp-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
const choose=a=>a[Math.floor(Math.random()*a.length)];
const numeric={size:[60,190],build:[0,100],armor:[0,100],glow:[0,100],headWidth:[65,145],neckLen:[0,65],shoulderWidth:[65,145],waistWidth:[65,145],armLength:[65,140],texture:[0,100]};
const choices={
 eyes:['standard','large','slit','blank'],eyeCount:[1,2,4],head:['oval','wide','long','beak','spike'],
 skin:['smooth','scales','spots','stripes','bark'],tail:['none','fish','serpent','reptile','feather'],
 wings:['none','membrane','insect','feather'],arms:[0,2,4],legs:[0,2,4],
 ears:['none','point','fin','frill'],mouth:['soft','fangs','beak','mandible'],horns:['none','single','pair','antlers'],
 hands:['fingers','webbed','claws','pincers'],feet:['human','webbed','claws','hooves'],
 markings:['none','scales','dots','stripes','runes'],spine:['none','fins','plates','feathers'],
 ability:['sonar','healing','telepathy','fire','flight','camouflage','magic'],
 v6form:['humanoid','aquatic','winged','serpentine','fourarmed'],v6diet:['omnivore','predator','herbivore','energy'],
 v6move:['walk','swim','fly','slither','float'],v6repro:['live','eggs','spores','division','none'],
 v6mind:['sentient','instinct','social','collective'],v6life:['medium','short','long','ancient']
};
const mutable=['head','skin','tail','wings','horns','ears','mouth','markings','spine','eyeCount','glow','armor','build','headWidth','armLength','texture'];
const oldClean=clean;
function normalizedMeta(x,out){
 const obj=x&&typeof x==='object'?x:{};
 if(typeof obj.id==='string' && obj.id.length<120)out.id=obj.id;
 out.v7parents=Array.isArray(obj.v7parents)?obj.v7parents.slice(0,2).filter(y=>y&&typeof y==='object').map(y=>({id:String(y.id||'').slice(0,120),name:String(y.name||'').slice(0,60)})):[];
 out.v7sources={};
 if(obj.v7sources&&typeof obj.v7sources==='object')for(const [k,v] of Object.entries(obj.v7sources).slice(0,65)){
  if(k.length<40&&['A','B','AB','M'].includes(v))out.v7sources[k]=v;
 }
 out.v7mutations=Array.isArray(obj.v7mutations)?obj.v7mutations.slice(0,20).map(y=>String(y).slice(0,90)):[];
 out.v7depth=clamp(Number(obj.v7depth)||0,0,999);
 return out
}
clean=function(x){return normalizedMeta(x,oldClean(x))};
catalog=catalog.filter(valid).slice(0,100).map(x=>{const e=clean(x);if(!e.id)e.id=uid();return e});
persist();
const st=document.createElement('style');
st.textContent=[
 '#v7Lab{border:1px solid var(--ui-gold-deep,#8b7650);background:var(--ui-pane,#152633);padding:14px!important}',
 '#v7Lab h3{font-family:Georgia,serif;color:var(--ui-gold,#eed19e);font-size:21px;margin:8px 0}',
 '#v7Lab p{font-size:12px;line-height:1.55;color:var(--ui-muted,#c4d0cc)}',
 '#v7Lab label{display:block;color:var(--ui-gold,#e6ca92);font-size:12px;margin:9px 0 5px}',
 '#v7Lab select{width:100%;min-width:0;padding:10px 6px;color:var(--ui-ink,#fff);border:1px solid var(--ui-gold-deep,#8a7550);background:var(--ui-card,#193139);border-radius:8px}',
 '#v7Lab input[type=range]{width:100%;accent-color:var(--ui-gold,#e6ca92)}',
 '#v7Lab .v7pairs{display:grid;grid-template-columns:1fr 1fr;gap:9px}',
 '#v7Lab .v7pairs>div{min-width:0}',
 '#v7Breed{background:linear-gradient(140deg,#f5dba2,#d4ab73);color:#332313;display:block;width:100%;margin:12px 0;min-height:44px;font-weight:700}',
 '#v7Breed:disabled{opacity:.5;cursor:not-allowed}',
 '#v7Family{border:1px solid var(--ui-gold-deep,#8b7650);border-radius:9px;background:var(--ui-card,#1a313b);padding:11px;margin:11px 0}',
 '#v7Family strong{color:var(--ui-gold,#e6ca92)}',
 '#v7Family button{font-size:11px;margin:3px;padding:6px}',
 '#v7Family p{margin:6px 0}',
 '@media(max-width:690px){',
 '#mobileNav button{font-size:11px!important;padding:9px 2px!important}',
 'body[data-tab=genetics] main>.panel:not(.right),body[data-tab=genetics] .stagecol{display:none!important}',
 'body[data-tab=genetics] main>.panel.right{display:flex!important;flex-direction:column!important}',
 'body[data-tab=genetics] main>.panel.right>.section:not(#v7Lab){display:none!important}',
 'body[data-tab=dossier] #v7Lab{display:none!important}',
 '}'
].join('\n');
document.head.append(st);
const lab=document.createElement('section');
lab.className='section';lab.id='v7Lab';
lab.innerHTML=[
 '<div class="caps">07 · генетическая лаборатория</div>',
 '<h3>Наследование признаков</h3>',
 '<p>Выбери двух сохранённых существ. Потомок получит смешанные характеристики родителей и может приобрести мутацию.</p>',
 '<div class="v7pairs"><div><label for="v7A">Родитель А</label><select id="v7A"></select></div>',
 '<div><label for="v7B">Родитель Б</label><select id="v7B"></select></div></div>',
 '<label for="v7Chance">Вероятность мутации <output id="v7ChanceOut">10%</output></label>',
 '<input id="v7Chance" type="range" min="0" max="30" value="10" step="5">',
 '<button id="v7Breed" type="button">Создать потомка</button>',
 '<p id="v7Status"></p>',
 '<div id="v7Family" aria-live="polite"></div>',
 '<p>Упрощённая игровая модель, а не реальная генетика.</p>'
].join('');
const aside=document.querySelector('main > .panel.right');
if(!aside)throw Error('No dossier panel');
aside.insertBefore(lab,aside.firstChild);
const nav=document.getElementById('mobileNav');
if(nav){
 const tab=document.createElement('button');
 tab.type='button';tab.dataset.tab='genetics';tab.textContent='Генетика';
 tab.setAttribute('aria-selected','false');nav.append(tab);
 tab.onclick=()=>{
  document.body.dataset.tab='genetics';
  nav.querySelectorAll('button').forEach(x=>x.setAttribute('aria-selected',String(x===tab)));
  window.scrollTo(0,0)
 }
}
const el=id=>document.getElementById(id);
const selA=el('v7A'),selB=el('v7B'),btn=el('v7Breed'),chance=el('v7Chance'),status=el('v7Status');
chance.oninput=()=>el('v7ChanceOut').textContent=chance.value+'%';
const find=id=>catalog.find(x=>x.id===id);
function parentsUI(){
 let assigned=false;
 for(const parent of catalog){if(!parent.id){parent.id=uid();assigned=true}}
 if(assigned)persist();
 const signature=catalog.map(x=>x.id+':'+x.name).join('|');
 if(selA.dataset.sig===signature&&selB.dataset.sig===signature)return;
 const beforeA=selA.value,beforeB=selB.value;
 for(const select of [selA,selB]){
  select.replaceChildren();
  const empty=document.createElement('option');empty.value='';empty.textContent='Выбрать';select.append(empty);
  for(const member of catalog){
   const opt=document.createElement('option');opt.value=member.id;
   opt.textContent=member.name;select.append(opt)
  }
  select.dataset.sig=signature
 }
 selA.value=find(beforeA)?beforeA:(catalog[0]?.id||'');
 selB.value=find(beforeB)?beforeB:(catalog[1]?.id||'');
 btn.disabled=catalog.length<2;
 if(catalog.length<2)status.textContent='Для наследования сначала сохрани минимум двух существ.';
}
function familyUI(){
 const view=el('v7Family');view.replaceChildren();
 const title=document.createElement('strong');title.textContent='Родословная: '+s.name;view.append(title);
 const depth=document.createElement('p');depth.textContent='Поколение '+s.generation+' · линия '+(s.v7depth||0);view.append(depth);
 if(!s.v7parents?.length){
  const p=document.createElement('p');p.textContent='Основатель линии. Родители неизвестны.';view.append(p);return
 }
 for(const parent of s.v7parents){
  const link=document.createElement('button');link.type='button';link.textContent=parent.name;
  const found=find(parent.id);link.disabled=!found;
  link.onclick=()=>{s=clean(found);render();message('Открыт родитель: '+found.name)};
  view.append(link)
 }
 const c=Object.values(s.v7sources||{}).reduce((out,t)=>(out[t]=(out[t]||0)+1,out),{});
 const p=document.createElement('p');p.textContent='Признаки от A: '+(c.A||0)+' · от Б: '+(c.B||0)+' · смешанные: '+(c.AB||0);view.append(p);
 if(s.v7mutations?.length){
  const m=document.createElement('p');m.textContent='Мутации: '+s.v7mutations.join('; ');view.append(m)
 }
 const kids=catalog.filter(x=>x.v7parents?.some(y=>y.id===s.id));
 if(kids.length){const d=document.createElement('p');d.textContent='Потомки: '+kids.map(x=>x.name).join(', ');view.append(d)}
}
function blendColor(a,b){
 const p=safeColor(a),q=safeColor(b);
 const pairs=[1,3,5].map(i=>Math.round((parseInt(p.slice(i,i+2),16)+parseInt(q.slice(i,i+2),16))/2).toString(16).padStart(2,'0'));
 return '#'+pairs.join('')
}
function inherit(a,b){
 const k=a.k===b.k?a.k:'custom';
 const offspring=clean({...a,k,ecotype:k==='custom'?'blank':choose([a.ecotype,b.ecotype]),v4species:k});
 delete offspring.id;
 offspring.name=('Потомок '+a.name.slice(0,17)+' и '+b.name.slice(0,17)).slice(0,48);
 offspring.v7parents=[{id:a.id,name:a.name},{id:b.id,name:b.name}];
 offspring.v7depth=Math.max(a.v7depth||0,b.v7depth||0)+1;
 offspring.v7sources={};offspring.v7mutations=[];
 offspring.generation=Math.max(a.generation||1,b.generation||1)+1;
 for(const [field,bounds] of Object.entries(numeric)){
  const va=Number(a[field]),vb=Number(b[field]);
  const av=Number.isFinite(va)?va:(bounds[0]+bounds[1])/2;
  const bv=Number.isFinite(vb)?vb:(bounds[0]+bounds[1])/2;
  offspring[field]=clamp(Math.round((av+bv)/10)*5,bounds[0],bounds[1]);
  offspring.v7sources[field]='AB'
 }
 for(const [field,values] of Object.entries(choices)){
  const source=Math.random()<.5?'A':'B';
  const val=(source==='A'?a:b)[field];
  offspring[field]=values.includes(val)?val:values[0];
  offspring.v7sources[field]=source
 }
 const possible=[...new Set([...a.features,...b.features])];
 offspring.features=possible.filter(f=>FEATURES[f]&&(a.features.includes(f)&&b.features.includes(f)||Math.random()<.5));
 offspring.v7sources.features='AB';
 offspring.env=choose([a.env,b.env]);offspring.v7sources.env='AB';
 offspring.color=blendColor(a.color,b.color);
 offspring.accent=blendColor(a.accent,b.accent);
 offspring.v7sources.color='AB';offspring.v7sources.accent='AB';
 if(k==='custom')offspring.ecotype='blank';
 else {
  const ecotypes={mermaid:['reef','abyss','lagoon'],fairy:['moth','bee','cloud'],alien:['crystal','dune','void'],dragon:['ember','frost','moss'],spirit:['oak','mushroom','willow']};
  if(!ecotypes[k]?.includes(offspring.ecotype))offspring.ecotype=ecotypes[k]?.[0]||'blank';
 }
 offspring.view='front';offspring.v4species=k;
 if(offspring.tail==='fish'||offspring.tail==='serpent')offspring.legs=0;
 if(offspring.wings==='none')offspring.features=offspring.features.filter(f=>f!=='wings');
 else if(!offspring.features.includes('wings'))offspring.features.push('wings');
 if(Math.random()*100<Number(chance.value)){
  const key=choose(mutable);
  if(numeric[key]){
   const bounds=numeric[key];
   const delta=choose([-10,-5,5,10]);
   offspring[key]=clamp(offspring[key]+delta,bounds[0],bounds[1]);
  }else{
   const options=choices[key].filter(x=>x!==offspring[key]);
   if(options.length)offspring[key]=choose(options)
  }
  offspring.v7sources[key]='M';offspring.v7mutations.push('Изменён признак: '+key);
  if(offspring.tail==='fish'||offspring.tail==='serpent')offspring.legs=0;
  if(offspring.wings==='none')offspring.features=offspring.features.filter(f=>f!=='wings');
  else if(!offspring.features.includes('wings'))offspring.features.push('wings')
 }
 offspring.v6form=offspring.tail==='fish'?'aquatic':offspring.tail==='serpent'?'serpentine':offspring.arms===4?'fourarmed':offspring.wings!=='none'?'winged':'humanoid';
 return clean(offspring)
}
btn.onclick=()=>{
 const a=find(selA.value),b=find(selB.value);
 if(!a||!b||a.id===b.id){status.textContent='Нужно выбрать двух разных сохранённых родителей.';return}
 const child=inherit(a,b);child.id=uid();
 catalog.unshift(child);catalog=catalog.slice(0,100);persist();
 s=clean(child);render();
 parentsUI();status.textContent='Потомок '+child.name+' сохранён. Открой вкладку «Существо».';
 message('Потомок создан и сохранён')
};
const exportButton=$('json');
exportButton.onclick=()=>downloadText(JSON.stringify({version:7,format:'atlas-living-worlds',catalog,selected:s},null,2),'atlas_catalog_v07.json','application/json');
const renderBefore=render;
render=function(sync=true){renderBefore(sync);parentsUI();familyUI()};
const catalogBefore=renderCatalog;
renderCatalog=function(){catalogBefore();parentsUI();familyUI()};
render();
})();