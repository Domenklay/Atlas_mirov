/* Atlas v0.7.3 — modular sprite assembly proof.
 * Real torso sprites are stored under web/sprites/ and embedded by Android build.
 * Heads, arms and lower limbs are separate generated SVG layers on the same canvas.
 * This is a technical artwork prototype: front view only, historical renderer retained.
 */
(function(){
'use strict';
const BODY=[
 ["humanoid","Гуманоидное","#ba8978","#f6d7ac","#765258"],
 ["aquatic","Водное","#2a91a0","#b5faeb","#184c66"],
 ["fae","Фейское","#9880bf","#f0d5ff","#544977"],
 ["draconic","Драконье","#ae644b","#f9c680","#613b43"],
 ["alien","Инопланетное","#747bb6","#d4edff","#383e72"],
 ["arboreal","Растительное","#587e5c","#c8edab","#354b45"]
];
const IDS=BODY.map(x=>x[0]);
const HEADS=[["elven","Эльфийская"],["aquatic","Водная"],["dragon","Драконья"]];
const ARMS=[["slender","Тонкие руки"],["strong","Мощные руки"],["finned","Перепончатые руки"]];
const LOWER=[["legs","Ноги"],["tail","Рыбий хвост"]];
const prevCreature=creature,prevClean=clean,prevRender=render;
const color=s=>safeColor(s||"#d0b9ab");
const k=x=>String(x||"");
const ok=(options,v,fallback)=>options.some(x=>x[0]===v)?v:fallback;
const partDefaults={spriteMode:false,spriteTorso:"humanoid",spriteHead:"elven",spriteArms:"slender",spriteLower:"legs"};
clean=function(o){
 const v=prevClean(o);
 v.spriteMode=o?.spriteMode===true;
 v.spriteTorso=ok(BODY,o?.spriteTorso,"humanoid");
 v.spriteHead=ok(HEADS,o?.spriteHead,"elven");
 v.spriteArms=ok(ARMS,o?.spriteArms,"slender");
 v.spriteLower=ok(LOWER,o?.spriteLower,"legs");
 return v
};
function normalizeState(){
 for(const [key,v] of Object.entries(partDefaults))if(typeof s[key]==="undefined")s[key]=v;
 if(!IDS.includes(s.spriteTorso))s.spriteTorso="humanoid"
}
function backdrop(v){
 const c=BODY.find(x=>x[0]===v.spriteTorso)||BODY[0],accent=c[3];
 return '<defs><radialGradient id="m73halo"><stop stop-color="'+accent+'" stop-opacity=".23"/><stop offset="1" stop-color="'+accent+'" stop-opacity="0"/></radialGradient></defs>'+
 '<ellipse cx="310" cy="394" rx="213" ry="309" fill="url(#m73halo)"/>'+
 '<circle cx="310" cy="380" r="268" stroke="'+accent+'" stroke-opacity=".12" stroke-width="1.5" stroke-dasharray="3 14" fill="none"/>';
}
function defs(c){
 return '<defs><radialGradient id="m73flesh" cx="30%" cy="22%" r="86%"><stop stop-color="#f3fff2"/><stop offset=".22" stop-color="'+c[3]+'"/><stop offset=".56" stop-color="'+c[2]+'"/><stop offset="1" stop-color="'+c[4]+'"/></radialGradient>'+
 '<linearGradient id="m73edge" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+c[3]+'"/><stop offset=".45" stop-color="'+c[2]+'"/><stop offset="1" stop-color="'+c[4]+'"/></linearGradient>'+
 '<linearGradient id="m73fin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+c[3]+'" stop-opacity=".85"/><stop offset=".5" stop-color="'+c[2]+'" stop-opacity=".58"/><stop offset="1" stop-color="'+c[3]+'" stop-opacity=".15"/></linearGradient></defs>'
}
const p=(d,fill,stroke="#304550",sw=3,attr="")=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round" '+attr+'/>';
function limbs(v,c){
 const f="url(#m73flesh)",a=c[3],d=c[4];
 let out='<g data-part="legs">';
 if(v.spriteLower==="tail"){
  out+=p('M279 470Q244 516 279 604Q297 663 305 678Q322 663 341 602Q370 521 341 470Z',f,d,3.6);
  for(let i=0;i<14;i++){
   let y=486+i*12;
   out+=p('M'+(281+i%2*5)+' '+y+'q28 15 57 0','none',a,1.15,'opacity=".34"')
  }
  out+=p('M309 661Q235 696 166 728Q233 762 308 718Q388 765 454 728Q377 687 309 661Z','url(#m73fin)',a,3.8);
  for(let i=-6;i<=6;i++)out+=p('M310 669Q'+(310+i*6)+' 708 '+(310+i*20)+' '+(730+i%3*3),'none',a,1.1,'opacity=".46"');
 }else{
  for(const side of [-1,1]){
   const x=310+side*28,knee=310+side*32,foot=310+side*40;
   out+=p('M'+(x-15)+' 465Q'+(knee-23)+' 523 '+(knee-12)+' 566Q'+knee+' 587 '+(knee+12)+' 566Q'+(knee+24)+' 514 '+(x+15)+' 465Z',f,d,3.4);
   out+='<ellipse cx="'+knee+'" cy="575" rx="13" ry="11" fill="url(#m73edge)" stroke="'+d+'" stroke-width="2"/>';
   out+=p('M'+(knee-11)+' 579Q'+(foot-18)+' 619 '+(foot-14)+' 671L'+(foot+13)+' 671Q'+(foot+18)+' 621 '+(knee+11)+' 579Z','url(#m73edge)',d,3);
   out+=p('M'+(foot-15)+' 665Q'+(foot-31)+' 688 '+(foot-19)+' 697L'+(foot+21)+' 695Q'+(foot+25)+' 687 '+(foot+12)+' 665Z',f,d,2.5);
   for(let i=0;i<3;i++)out+=p('M'+(foot-12+i*11)+' 694l0 -9','none',a,1.1,'opacity=".59"');
  }
 }
 return out+'</g>'
}
function arms(v,c){
 let out='<g data-part="arms">',f="url(#m73flesh)",d=c[4],a=c[3];
 const heavy=v.spriteArms==="strong",webbed=v.spriteArms==="finned";
 for(const side of [-1,1]){
  const sx=310+side*55,ex=310+side*(heavy?112:109),w=heavy?23:15;
  const elbowX=310+side*103,elbowY=391;
  const wristX=310+side*127,wristY=502;
  out+=p('M'+(sx-side*w)+' 297Q'+(sx+side*(w+12))+' 296 '+(elbowX+side*w)+' 378Q'+(elbowX+side*w)+' 401 '+elbowX+' 407Q'+(sx-side*(w+16))+' 349 '+(sx-side*w)+' 297Z',f,d,3.1);
  out+='<ellipse cx="'+elbowX+'" cy="'+elbowY+'" rx="'+(heavy?13:10)+'" ry="'+(heavy?12:9)+'" fill="url(#m73edge)" stroke="'+d+'" stroke-width="2"/>';
  out+=p('M'+(elbowX-side*12)+' '+(elbowY+8)+'Q'+(wristX-side*(w+8))+' 463 '+(wristX-side*w)+' '+wristY+
  'Q'+(wristX+side*w)+' '+(wristY+8)+' '+(wristX+side*w)+' '+(wristY-6)+
  'Q'+(elbowX+side*10)+' 413 '+(elbowX-side*12)+' '+(elbowY+8)+'Z',f,d,3);
  out+=p('M'+(sx+side*7)+' 318Q'+(sx+side*43)+' 350 '+(elbowX+side*2)+' 385','none','#f9fff7',1.6,'opacity=".29"');
  if(webbed){
   out+=p('M'+(wristX-12)+' 495Q'+(wristX-40)+' 522 '+(wristX-32)+' 548Q'+(wristX+3)+' 565 '+(wristX+33)+' 543Q'+(wristX+42)+' 521 '+(wristX+10)+' 495Z','url(#m73fin)',a,2.2);
   for(let j=-2;j<=2;j++)out+=p('M'+wristX+' 506l'+(j*13)+' 34','none',a,1.2,'opacity=".58"');
  }else{
   out+=p('M'+(wristX-11)+' 493Q'+(wristX-20)+' 513 '+(wristX-15)+' 529Q'+wristX+' 542 '+(wristX+15)+' 529Q'+(wristX+20)+' 514 '+(wristX+11)+' 493Z',f,d,2.4);
   for(let j=-1;j<=2;j++){
    const x=wristX+j*8-4;
    out+=p('M'+(x-3)+' 525q-2 7 0 14q5 7 7 0l1 -14Z','url(#m73edge)',a,1.2);
    if(heavy)out+=p('M'+x+' 539l3 11l-7 -3Z','#f4f7da',a,.8);
   }
  }
 }
 return out+'</g>';
}
function head(v,c){
 const kind=v.spriteHead,a=c[3],dark=c[4],fill="url(#m73flesh)";
 let out='<g data-part="head">';
 const reptile=kind==="dragon",water=kind==="aquatic";
 const x1=reptile?258:water?262:270,x2=620-x1,top=reptile?75:water?91:88;
 if(water){
  for(const dir of [-1,1]){
   const x=310+dir*48;
   out+=p('M'+x+' 171Q'+(x+dir*39)+' 136 '+(x+dir*66)+' 155L'+(x+dir*36)+' 218Z','url(#m73fin)',a,2.4);
   for(let i=0;i<4;i++)out+=p('M'+x+' 181l'+(dir*(28+i*7))+' '+(-24+i*8),'none',a,1.0,'opacity=".51"');
  }
 }
 if(!water&&!reptile)for(const dir of [-1,1]){
  const x=310+dir*38;
  out+=p('M'+x+' 162Q'+(x+dir*34)+' 117 '+(x+dir*57)+' 103Q'+(x+dir*44)+' 185 '+x+' 198Z','url(#m73edge)',a,2.4);
 }
 if(reptile)for(const dir of [-1,1]){
  const x=310+dir*36;
  out+=p('M'+(x-dir*7)+' 118Q'+(x+dir*24)+' 43 '+(x+dir*48)+' 35Q'+(x+dir*51)+' 116 '+(x+dir*8)+' 146Z','url(#m73edge)',dark,3);
 }
 let d=reptile?
 'M310 78Q250 83 255 156L258 200Q271 227 286 225L284 245Q310 257 336 245L334 225Q351 226 362 201L365 156Q369 90 310 78Z':
 'M310 '+top+'Q251 '+(top+8)+' '+x1+' 164Q'+x1+' 207 291 226L296 244Q310 249 324 244L329 226Q'+x2+' 207 '+x2+' 164Q369 '+(top+8)+' 310 '+top+'Z';
 out+=p(d,fill,dark,4.2);
 out+=p('M294 233Q310 236 326 233L328 264Q310 274 292 264Z','url(#m73edge)',dark,2.3);
 for(const dir of [-1,1]){
  const x=310+dir*(reptile?24:21),y=161,ry=reptile?8:10;
  out+=p('M'+(x-13)+' '+y+'Q'+x+' '+(y-ry)+' '+(x+13)+' '+y+'Q'+x+' '+(y+ry)+' '+(x-13)+' '+y+'Z','#e7f8ef',dark,1.8);
  out+='<ellipse cx="'+x+'" cy="'+y+'" rx="'+(reptile?2.5:4)+'" ry="'+(reptile?8:5)+'" fill="#273747"/>';
  out+='<circle cx="'+(x-2)+'" cy="'+(y-3)+'" r="1.8" fill="#fff"/>';
  out+=p('M'+(x-15)+' '+(y-12)+'q15 -8 29 -1','none',a,2,'opacity=".5"');
 }
 if(reptile){
  out+=p('M289 194Q310 206 331 194L343 216Q310 239 277 216Z','url(#m73edge)',dark,2.4);
  for(const j of [-1,1])out+=p('M'+(310+j*14)+' 222l6 -9l-3 12Z','#edfce8',dark,.8);
 }else{
  out+=p('M310 183q-5 11 0 16q5 2 9 0','none',dark,1.8,'opacity=".62"');
  out+=p('M297 211Q310 216 323 211','none',dark,2.5,'opacity=".75"');
 }
 if(water)for(const dir of [-1,1])for(let i=0;i<4;i++)out+=p('M'+(310+dir*38)+' '+(188+i*10)+'l'+(dir*13)+' -4','none',a,2,'opacity=".59"');
 out+='</g>';
 return out
}
const marker= 'data-atlas-modular="v073"';
const lib={};
function asset(id){return globalThis.AtlasTorsoAssets?.[id]||lib[id]||null}
function assembled(v){
 const body=BODY.find(x=>x[0]===v.spriteTorso)||BODY[0],assetSVG=asset(body[0]);
 if(!assetSVG)return '<text x="310" y="380" fill="#f6dd9d" text-anchor="middle">Подготовка спрайтов…</text>';
 const torso='<g data-part="torso">'+assetSVG.slice(assetSVG.indexOf('>')+1,assetSVG.lastIndexOf('</svg>'))+'</g>';
 return backdrop(v)+defs(body)+'<g data-atlas-modular="v073" aria-label="Персонаж собран из независимых деталей">'+
 limbs(v,body)+arms(v,body)+torso+head(v,body)+'</g>';
}
creature=function(v){
 if(!v.spriteMode||v.view!=='front')return prevCreature(v);
 return assembled(v);
};
const editor=document.querySelector('main>.panel:not(.right)');
const panel=document.createElement('section');panel.className='section';panel.id='modular73';
panel.innerHTML='<div class="caps">07.3 · сборный персонаж</div>'+
 '<h3>Модульный 2D-конструктор</h3>'+
 '<p class="m73lead">Это настоящий прототип: туловище, голова, руки и нижняя часть тела — независимые слои с согласованными соединениями.</p>'+
 '<label class="m73toggle"><input id="m73active" type="checkbox"> Включить сборку из спрайтов</label>'+
 '<div id="m73controls"><label for="m73torso">Туловище</label><select id="m73torso"></select>'+
 '<label for="m73head">Голова</label><select id="m73head"></select>'+
 '<label for="m73arms">Руки и кисти</label><select id="m73arms"></select>'+
 '<label for="m73lower">Нижняя часть тела</label><select id="m73lower"></select>'+
 '<div class="m73status" id="m73status"></div>'+
 '<p class="m73note">В пробном наборе 6 независимых SVG-туловищ. Пока поддерживается фронтальный ракурс; другие ракурсы используют прежний редактор. Новые виды сохраняют выбор деталей.</p></div>';
const css=document.createElement('style');
css.textContent='#modular73{padding:15px!important;border:1px solid var(--ui-gold-deep,#947d53);background:linear-gradient(150deg,var(--ui-card,#264449),var(--ui-pane,#13262d));box-shadow:0 10px 30px #0005}'+
 '#modular73 h3{font:600 19px Georgia,serif;color:var(--ui-gold,#f1ce98);margin:8px 0}'+
 '#modular73 .m73lead,#modular73 .m73note{font-size:12px;line-height:1.5;color:var(--ui-muted,#b6c6c8)}'+
 '#modular73 .m73toggle{display:flex;align-items:center;gap:9px;padding:11px 8px;border:1px solid var(--ui-gold-deep,#93794e);border-radius:8px;margin:10px 0 12px;color:var(--ui-gold,#e5cb92);font-weight:650;font-size:13px}'+
 '#modular73 .m73toggle input{width:18px;height:18px;accent-color:var(--ui-gold,#e5cb92)}'+
 '#modular73 #m73controls{display:flex;flex-direction:column;gap:6px}'+
 '#modular73 label:not(.m73toggle){font-size:12px;color:var(--ui-gold,#ead7aa)}'+
 '#modular73 select{width:100%;padding:10px 8px;border:1px solid var(--ui-gold-deep,#8f7850);border-radius:7px;background:var(--ui-pane,#192f35);color:var(--ui-ink,#f4f5f2);font-size:13px}'+
 '#modular73 .m73status{font-size:12px;color:var(--ui-accent,#97e0c9);margin-top:6px}'+
 '#modular73 .m73note{margin:4px 0 0}'+
 '#modular73:not(.m73on) #m73controls{opacity:.5}'+
 '@media(max-width:690px){#modular73{margin-bottom:10px!important}}';
document.head.appendChild(css);
editor.insertBefore(panel,editor.firstChild);
function options(id,data){const el=document.getElementById(id);data.forEach(([value,label])=>{const o=document.createElement('option');o.value=value;o.textContent=label;el.appendChild(o)})}
options('m73torso',BODY.map(x=>x.slice(0,2)));options('m73head',HEADS);options('m73arms',ARMS);options('m73lower',LOWER);
const input=document.getElementById('m73active'),selectors=[['m73torso','spriteTorso'],['m73head','spriteHead'],['m73arms','spriteArms'],['m73lower','spriteLower']];
input.addEventListener('change',()=>{s.spriteMode=input.checked;render(false)});
for(const [id,field] of selectors)document.getElementById(id).addEventListener('change',e=>{s[field]=e.target.value;render(false)});
const oldRender=render;
render=function(sync=true){
 normalizeState();oldRender(sync);
 input.checked=!!s.spriteMode;panel.classList.toggle('m73on',!!s.spriteMode);
 for(const [id,field] of selectors){const el=document.getElementById(id);el.value=s[field];el.disabled=!s.spriteMode}
 document.getElementById('m73status').textContent=s.spriteMode?(s.view==='front'?'Собрано из независимых деталей':'Вид сбоку/сзади: показана прежняя векторная модель'):'Исходный генератор активен — спрайты отключены.';
};
if(!globalThis.AtlasTorsoAssets){
 const files=BODY.map(x=>x[0]);
 Promise.all(files.map(async id=>{
  try{
   const res=await fetch('sprites/torso_'+id+'.svg');
   if(res.ok)lib[id]=await res.text();
  }catch(e){}
 })).then(()=>{
  if(s.spriteMode)render(false)
 })
}
render();
})();