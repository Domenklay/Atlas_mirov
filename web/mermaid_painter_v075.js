/* Atlas v0.7.5 — artistic modular mermaid sprites.
 * Nine true independent transparent WebP game parts; the old vector mode remains.
 * Front-facing proof of concept, not the final polished skeletal rig.
 */
(function(){
'use strict';
const oldCreature=creature,oldRender=render,oldClean=clean;
const PACK='mermaid_v075';
const parts={
 torso:['torso_pearl','torso_aqua'],
 head:['head_silver','head_deep'],
 tail:['tail_lagoon','tail_amethyst']
};
const defaults={spriteArtSet:'',paintTorso:'torso_pearl',paintHead:'head_silver',paintTail:'tail_lagoon',paintArmTint:'pearl'};
const elbows=[{x:215,y:380},{x:405,y:380}];
const BASE={
 torso_pearl:[208,232,204,308],torso_aqua:[208,232,204,308],
 head_silver:[222,76,174,185],head_deep:[224,79,167,181],
 upper_arm:[200,289,88,133],forearm:[150,350,110,132],
 hand:[137,443,72,118],tail_lagoon:[228,465,164,284],tail_amethyst:[230,465,157,286]
};
const srcPrefix='sprites/mermaid_v075/';
const imageFiles={};
function clamp(x,a,b){const n=Number(x);return Math.max(a,Math.min(b,Number.isFinite(n)?n:(a+b)/2))}
function normalized(o){
 const result=oldClean(o);
 const v=o&&typeof o==='object'?o:{};
 result.spriteArtSet=v.spriteArtSet===PACK?PACK:'';
 for(const key of ['Torso','Head','Tail']){
  const k='paint'+key,t=key.toLowerCase();
  result[k]=parts[t].includes(v[k])?v[k]:defaults[k];
 }
 result.paintArmTint=v.paintArmTint==='aqua'?'aqua':'pearl';
 return result
}
clean=normalized;
function recover(){
 const before=window.__AtlasCatalogBeforeStartup;
 try{
  const raw=JSON.parse(before||'null');
  if(Array.isArray(raw)){
   const byId=new Map(raw.filter(o=>o&&typeof o.id==='string').map(o=>[o.id,o]));
   catalog=catalog.map((record,i)=>{
    const rawRec=byId.get(record.id)||raw[i];
    if(!rawRec||rawRec.spriteArtSet!==PACK)return record;
    return normalized({...record,spriteArtSet:PACK,paintTorso:rawRec.paintTorso,
      paintHead:rawRec.paintHead,paintTail:rawRec.paintTail,paintArmTint:rawRec.paintArmTint})
   });
   persist();
  }
 }catch(e){}
 try{
  const draft=JSON.parse(localStorage.getItem('atlas_draft_v075')||'null');
  if(draft&&valid(draft))s=normalized(draft)
 }catch(e){}
}
recover();
const manifest=window.AtlasMermaidPaintManifest;
const fallback={assets:Object.fromEntries(Object.entries(BASE).map(([name,box])=>[name,{src:name+'.webp',box}]))};
const meta=manifest&&manifest.assets?manifest:fallback;
let loading=false;
const loaded=Object.assign({},window.AtlasPaintedMermaidAssets||{});
function safeUri(name){
 if(!Object.prototype.hasOwnProperty.call(BASE,name))return '';
 const raw=loaded[name];
 return raw?'data:image/webp;base64,'+raw:srcPrefix+name+'.webp';
}
function layer(name,extra='',op=1){
 const box=meta.assets[name]?.box||BASE[name];
 const [x,y,w,h]=box;
 return '<image data-paint-part="'+name+'" href="'+safeUri(name)+'" x="'+x+'" y="'+y+
 '" width="'+w+'" height="'+h+'" preserveAspectRatio="none" opacity="'+op+'" '+extra+'/>';
}
function mirrored(name){
 return '<g data-paint-side="right" transform="translate(620 0) scale(-1 1)">'+layer(name)+'</g>';
}
function left(name){return '<g data-paint-side="left">'+layer(name)+'</g>'}
function hue(hex){
 const str=String(hex||'#b6dacc').replace('#','');
 if(!/^[\da-fA-F]{6}$/.test(str))return 0;
 const r=parseInt(str.slice(0,2),16)/255,g=parseInt(str.slice(2,4),16)/255,b=parseInt(str.slice(4,6),16)/255;
 const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;
 if(!d)return 0;
 let h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;
 return (h*60+360)%360
}
function pigment(v){
 return v.spriteCustomColor===true?'<filter id="paint75color" color-interpolation-filters="sRGB"><feColorMatrix type="hueRotate" values="'+
 Math.round(hue(v.color)-187)+'"/></filter>':'';
}
function decorations(v){
 const accent=v.paintTorso==='torso_aqua'?'#96e5eb':'#e9d4a3';
 let out='<defs><radialGradient id="paint75join" cx="32%" cy="22%" r="79%"><stop stop-color="#fff5de"/>'+
 '<stop offset=".35" stop-color="'+(v.paintTorso==='torso_aqua'?'#9bd9e3':'#e5c9c8')+'"/>'+
 '<stop offset="1" stop-color="#6d7884"/></radialGradient>'+
 '<radialGradient id="paint75halo"><stop stop-color="'+accent+'" stop-opacity=".15"/><stop offset="1" stop-color="'+accent+'" stop-opacity="0"/></radialGradient>'+
 '</defs><ellipse cx="310" cy="415" rx="214" ry="293" fill="url(#paint75halo)"/>';
 return out
}
function joints(){
 let out='';
 for(const sign of [-1,1]){
  const elbow=310+sign*95;
  const wrist=310+sign*145;
  out+='<ellipse cx="'+elbow+'" cy="385" rx="11" ry="13" fill="url(#paint75join)" opacity=".93"/>';
  out+='<path d="M'+(elbow-10)+' 381Q'+elbow+' 372 '+(elbow+10)+' 381" fill="none" stroke="#e0c894" stroke-width="3" opacity=".82"/>';
  out+='<ellipse cx="'+wrist+'" cy="485" rx="8" ry="12" fill="url(#paint75join)" opacity=".89"/>';
  out+='<path d="M'+(wrist-7)+' 479Q'+wrist+' 474 '+(wrist+7)+' 479" stroke="#d1b17d" fill="none" stroke-width="2.5" opacity=".84"/>';
 }
 return out
}
function assembled(v){
 let markup=decorations(v);
 const head=v.paintHead||defaults.paintHead,torso=v.paintTorso||defaults.paintTorso,tail=v.paintTail||defaults.paintTail;
 const size=clamp(v.size||110,60,190)/110;
 const sh=clamp(v.shoulderWidth||100,65,145)/100;
 const waist=clamp(v.waistWidth||100,65,145)/100;
 const headW=clamp(v.headWidth||100,65,145)/100;
 const armsY=clamp(v.armLength||100,65,140)/100;
 const figureTransform='translate(310 392) scale('+size.toFixed(3)+') translate(-310 -392)';
 markup+='<g data-painted-mermaid="v075" transform="'+figureTransform+'"'+(v.spriteCustomColor?' filter="url(#paint75color)"':'')+'>';
 // Back-to-front arrangement: tail -> shoulder arms -> forearms/hands -> torso -> face.
 markup+='<g data-paint-slot="tail" transform="translate(310 490) scale('+waist.toFixed(3)+' 1) translate(-310 -490)">'+layer(tail)+'</g>';
 const armTransform='translate(310 305) scale('+sh.toFixed(3)+' '+armsY.toFixed(3)+') translate(-310 -305)';
 markup+='<g data-paint-slot="arms" transform="'+armTransform+'">'+
 left('upper_arm')+mirrored('upper_arm')+left('forearm')+mirrored('forearm')+
 left('hand')+mirrored('hand')+joints()+'</g>';
 const bodyScale=((sh+waist)/2).toFixed(3);
 markup+='<g data-paint-slot="torso" transform="translate(310 360) scale('+bodyScale+' 1) translate(-310 -360)">'+layer(torso)+'</g>';
 markup+='<g data-paint-slot="head" transform="translate(310 242) scale('+headW.toFixed(3)+' 1) translate(-310 -242)">'+layer(head)+'</g>';
 markup+='</g>';
 if(document.getElementById('m74anchors')?.checked){
  for(const [name,x,y] of [['neck',310,244],['shoulder L',255,306],['shoulder R',365,306],['tail',310,475]]){
   markup+='<circle cx="'+x+'" cy="'+y+'" r="5" fill="#ffe8b6" stroke="#1b3841" stroke-width="2"/>'+
   '<text x="'+(x+7)+'" y="'+(y-5)+'" font-family="sans-serif" font-size="12" fill="#ffe1a7">'+name+'</text>';
  }
 }
 return pigment(v)+markup;
}
creature=function(v){
 if(v&&v.spriteMode===true&&v.spriteArtSet===PACK&&v.view==='front')return assembled(v);
 return oldCreature(v)
};
const host=document.querySelector('#modular73');
if(!host)return;
const section=document.createElement('div');section.id='paint75';
section.innerHTML='<div class="caps">Художественный набор · Русалка</div>'+
 '<p>Отдельные живописные части с прозрачным фоном. Пробная сборка в одном ракурсе.</p>'+
 '<button id="paint75enable" type="button">Включить художественную русалку</button>'+
 '<div id="paint75fields" hidden>'+
 '<label for="paint75torso">Туловище</label><select id="paint75torso"><option value="torso_pearl">Жемчужная чешуя</option><option value="torso_aqua">Лазурная чешуя</option></select>'+
 '<label for="paint75head">Голова</label><select id="paint75head"><option value="head_silver">Серебряная сирена</option><option value="head_deep">Глубоководная</option></select>'+
 '<label for="paint75tail">Хвост</label><select id="paint75tail"><option value="tail_lagoon">Лагунный</option><option value="tail_amethyst">Аметистовый</option></select>'+
 '<button type="button" id="paint75disable">Вернуться к обычному конструктору</button>'+
 '<span class="paint75note">Голова, туловище, плечо, предплечье, кисть и хвост — самостоятельные спрайты. Ракурс пока только спереди.</span>'+
 '</div>';
host.appendChild(section);
const css=document.createElement('style');
css.textContent='#paint75{padding:12px;margin-top:13px;border:1px solid var(--ui-gold-deep,#8e7555);border-radius:9px;background:radial-gradient(circle at 17% 0,#2a595865,transparent 65%),var(--ui-pane,#152c35)}'+
 '#paint75 .caps{color:var(--ui-gold,#e6ce98);font-size:11px}'+
 '#paint75 p,#paint75 .paint75note{color:var(--ui-muted,#a6c5c5);font-size:12px;line-height:1.5}'+
 '#paint75 button{width:100%;padding:10px;border:1px solid var(--ui-gold-deep,#987b56);border-radius:8px;margin-top:9px}'+
 '#paint75enable{background:linear-gradient(140deg,#f4ddb0,#d1b57c);color:#2d2315;font-weight:750}'+
 '#paint75disable{background:var(--ui-card,#204048);color:var(--ui-gold,#e8c996)}'+
 '#paint75 label{display:block;color:var(--ui-gold,#e8c996);font-size:12px;margin:10px 0 5px}'+
 '#paint75 select{width:100%;padding:9px;background:var(--ui-pane,#17313d);color:var(--ui-ink,#f4f4f5);border:1px solid var(--ui-gold-deep,#987b56);border-radius:7px}'+
 '#paint75 .paint75note{display:block;margin-top:10px}'+
 '@media(max-width:690px){#paint75{margin:11px 0}}';
document.head.appendChild(css);
const enable=document.getElementById('paint75enable'),disable=document.getElementById('paint75disable'),fields=document.getElementById('paint75fields');
enable.onclick=()=>{
 s.spriteMode=true;s.spriteArtSet=PACK;s.k='mermaid';
 s.paintTorso=parts.torso.includes(s.paintTorso)?s.paintTorso:defaults.paintTorso;
 s.paintHead=parts.head.includes(s.paintHead)?s.paintHead:defaults.paintHead;
 s.paintTail=parts.tail.includes(s.paintTail)?s.paintTail:defaults.paintTail;
 s.view='front';render();
};
disable.onclick=()=>{s.spriteArtSet='';render()};
for(const [id,field] of [['paint75torso','paintTorso'],['paint75head','paintHead'],['paint75tail','paintTail']]){
 document.getElementById(id).onchange=e=>{s[field]=e.target.value;render(false)}
}
const oldRender2=render;
render=function(sync=true){
 oldRender2(sync);
 const active=s.spriteMode===true&&s.spriteArtSet===PACK;
 fields.hidden=!active;
 enable.textContent=active?'Художественный комплект включён':'Включить художественную русалку';
 enable.disabled=active;
 for(const [id,field] of [['paint75torso','paintTorso'],['paint75head','paintHead'],['paint75tail','paintTail']]){
  document.getElementById(id).value=s[field]||defaults[field]
 }
 try{localStorage.setItem('atlas_draft_v075',JSON.stringify(s))}catch(e){}
};
if(!window.AtlasPaintedMermaidAssets&&!loading){
 loading=true;
 Promise.all(Object.keys(BASE).map(async name=>{
  try{
   const response=await fetch(srcPrefix+name+'.webp');
   if(!response.ok)return;
   const blob=await response.blob();
   const data=await new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(String(reader.result).split(',')[1]);
    reader.onerror=reject;
    reader.readAsDataURL(blob)
   });
   loaded[name]=data
  }catch(e){}
 })).then(()=>{loading=false;if(s.spriteMode&&s.spriteArtSet===PACK)render(false)})
}
renderCatalog();render();
window.AtlasMermaidArt={assets:Object.keys(BASE),active:()=>s.spriteArtSet===PACK,render:()=>render(false)};
})();