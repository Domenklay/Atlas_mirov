/* Atlas v0.7.4 — modular editor foundation: data restoration + real anchor geometry.
   This patch deliberately keeps the v0.7.3 sprite art and the classic renderer. */
(function(){
'use strict';
const originalCreature=creature,originalClean=clean,originalRender=render;
const FALLBACK={
 neck:{x:310,y:244},shoulderLeft:{x:255,y:306},shoulderRight:{x:365,y:306},
 hipLeft:{x:283,y:478},hipRight:{x:337,y:478},
 wingLeft:{x:277,y:310},wingRight:{x:343,y:310},tail:{x:310,y:475}
};
const SOURCE=window.AtlasTorsoManifest&&window.AtlasTorsoManifest.fixedAnchors;
const attrs=['spriteMode','spriteTorso','spriteHead','spriteArms','spriteLower'];
const faceFields=['size','build','shoulderWidth','waistWidth','headWidth','neckLen','armLength','color','accent'];
const finite=(n,d)=>Number.isFinite(Number(n))?Number(n):d;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const nr=n=>Math.round(n*1000)/1000;
let showAnchors=false;
let anchors=normalizeAnchors(SOURCE);
function normalizeAnchors(input){
 const out={};
 for(const [key,point] of Object.entries(FALLBACK)){
  const found=input&&input[key];
  out[key]={
   x:clamp(finite(found&&found.x,point.x),0,620),
   y:clamp(finite(found&&found.y,point.y),0,780)
  };
 }
 return out
}
clean=function(raw){const obj=raw&&typeof raw==='object'?raw:{};return originalClean(obj)};
function restoreCatalog(){
 // Old startup scripts cleaned the catalog before modular metadata was registered.
 // Recover the raw records from the original persistent store rather than
 // resaving those shortened records (which would destroy sprite selections).
 try{
  const raw=JSON.parse(window.__AtlasCatalogBeforeStartup||localStorage.getItem('atlas_catalog_v1')||'null');
  if(!Array.isArray(raw))return false;
  const validRecords=raw.filter(valid).slice(0,100);
  if(validRecords.length===0)return false;
  const mapped=validRecords.map((entry,index)=>{
   const item=clean(entry);
   if(!item.id){
    const earlier=catalog[index];
    item.id=earlier&&earlier.id?earlier.id:'sp-v74-'+Date.now().toString(36)+'-'+index;
   }
   return item
  });
  catalog=mapped;
  persist();
  return true
 }catch(err){return false}
}
function restoreDraft(){
 // Version-specific snapshot is independent of the historic draft formats.
 try{
  const draft=JSON.parse(localStorage.getItem('atlas_draft_v074')||'null');
  if(draft&&valid(draft)){s=clean(draft);return true}
 }catch(err){}
 return false
}
restoreCatalog();
restoreDraft();
const target=(a,sw,sh)=>{
 const p=anchors[a];
 return {x:310+(p.x-310)*sw,y:375+(p.y-375)*sh}
};
function balanced(v){
 // Scale proportions gently so different heads, limbs and torsos stay connected.
 const sw=clamp((finite(v.shoulderWidth,100)+finite(v.waistWidth,100))/200,.74,1.28);
 const sh=clamp(1+(finite(v.build,40)-40)/420,.90,1.16);
 return {sw,sh};
}
const tx=(p,q,sx,sy,fromX,fromY)=>'translate('+nr(p.x)+' '+nr(p.y)+') scale('+nr(sx)+' '+nr(sy)+') translate('+(-fromX)+' '+(-fromY)+')';
function applyGroupTransform(svg,part,transform){
 const selector='g[data-part="'+part+'"]';
 const node=svg.querySelector(selector);
 if(!node)return false;
 node.setAttribute('transform',transform);
 return true
}
function makeDebugAnchors(v,sw,sh){
 if(!showAnchors)return '';
 let out='<g data-debug-anchors="manifest" pointer-events="none" font-family="sans-serif" font-size="9">';
 for(const [id] of Object.entries(anchors)){
  const p=target(id,sw,sh);
  out+='<circle cx="'+nr(p.x)+'" cy="'+nr(p.y)+'" r="5" fill="#ffe1a1" stroke="#24333b" stroke-width="1.5"/>';
  out+='<text x="'+nr(p.x+8)+'" y="'+nr(p.y-8)+'" fill="#ffe1a1" stroke="#122333" stroke-width="2" paint-order="stroke">'+id+'</text>'
 }
 return out+'</g>'
}
function enhanceSVG(v,markup){
 // Android and the web use the same SVG DOM parser; no network and no eval.
 let parsed;
 try{parsed=new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 780">'+markup+'</svg>','image/svg+xml')}
 catch(err){return markup}
 const root=parsed.documentElement;
 if(root.querySelector('parsererror')||!root.querySelector('[data-atlas-modular]'))return markup;
 const {sw,sh}=balanced(v);
 const headX=clamp(finite(v.headWidth,100)/100,.68,1.45),headY=clamp(.98+(headX-1)*.28,.86,1.15);
 const armsY=clamp(finite(v.armLength,100)/100,.65,1.4);
 const waistX=clamp(finite(v.waistWidth,100)/100,.70,1.40);
 const torso=centerTransform(sw,sh);
 const neck=target('neck',sw,sh);
 const left=target('shoulderLeft',sw,sh),right=target('shoulderRight',sw,sh);
 const shoulders={x:(left.x+right.x)/2,y:(left.y+right.y)/2};
 const leftHip=target('hipLeft',sw,sh),rightHip=target('hipRight',sw,sh);
 const hips={x:(leftHip.x+rightHip.x)/2,y:(leftHip.y+rightHip.y)/2};
 const tail=target('tail',sw,sh);
 applyGroupTransform(root,'torso',torso);
 applyGroupTransform(root,'head',tx(neck,neck,headX,headY,310,244));
 applyGroupTransform(root,'arms',tx(shoulders,shoulders,sw,armsY,310,297));
 const baseLowerY=v.spriteLower==='tail'?470:465;
 applyGroupTransform(root,'legs',tx(v.spriteLower==='tail'?tail:hips,hips,waistX,sh,310,baseLowerY));
 const rootPart=root.querySelector('[data-atlas-modular]');
 if(rootPart){
  rootPart.setAttribute('data-anchor-source',SOURCE?'manifest':'fallback');
  // One group wraps ALL modules; grows/shrinks the organism with the old size control.
  const overall=clamp(finite(v.size,110)/110,.58,1.65);
  rootPart.setAttribute('transform','translate(310 392) scale('+nr(overall)+') translate(-310 -392)');
  if(showAnchors){
   const frag=new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">'+makeDebugAnchors(v,sw,sh)+'</svg>','image/svg+xml');
   const debug=frag.documentElement.firstElementChild;
   if(debug)rootPart.appendChild(parsed.importNode(debug,true))
  }
 }
 // Recolor torso without flattening its patterns or modifying separate body parts.
 const torsoGroup=root.querySelector('g[data-part="torso"]');
 if(torsoGroup){
  const available=['humanoid','aquatic','fae','draconic','alien','arboreal'];
  const originalPalette={
   humanoid:['#ba8978','#f6d7ac'],aquatic:['#2a91a0','#b5faeb'],
   fae:['#9880bf','#f0d5ff'],draconic:['#ae644b','#f9c680'],
   alien:['#747bb6','#d4edff'],arboreal:['#587e5c','#c8edab']
  };
  if(available.includes(v.spriteTorso)){
   const [base,highlight]=originalPalette[v.spriteTorso];
   const newBase=safeColor(v.color||base),newHighlight=safeColor(v.accent||highlight);
   if(v.spriteCustomColor===true){
    const it=torsoGroup.querySelectorAll('[fill],[stroke],[stop-color]');
    for(const node of it){
     for(const att of ['fill','stroke','stop-color']){
      const hex=node.getAttribute(att);
      if(hex===base)node.setAttribute(att,newBase);
      if(hex===highlight)node.setAttribute(att,newHighlight)
     }
    }
   }
  }
 }
 return root.innerHTML
}
function centerTransform(sx,sy){
 return 'translate(310 375) scale('+nr(sx)+' '+nr(sy)+') translate(-310 -375)'
}
creature=function(v){
 const generated=originalCreature(v);
 if(!v.spriteMode||v.view!=='front')return generated;
 return enhanceSVG(v,generated)
};
const panel=document.getElementById('modular73');
const controls=document.getElementById('m73controls');
if(!panel||!controls)return;
const mini=document.createElement('div');
mini.className='m74diagnostics';
mini.innerHTML='<label class="m74check"><input type="checkbox" id="m74customColor"> Использовать выбранную окраску существа</label>'+
 '<label class="m74check"><input type="checkbox" id="m74anchors"> Показать точки крепления</label>'+
 '<p id="m74note">Ориентиры из манифеста. Изменения анатомии учитываются в масштабе частей.</p>';
controls.appendChild(mini);
const title=panel.querySelector('h3');if(title)title.textContent='Сборный 2D-конструктор';
const note=panel.querySelector('.m73note');
if(note)note.textContent='Прототип: шесть SVG-туловищ, отдельные варианты головы, рук и ног. Настройки сохраняются при повторном открытии. Новый режим пока поддерживает только вид спереди.';
const style=document.createElement('style');
style.textContent='#modular73 .m74diagnostics{margin:12px 0 0;padding:10px;border:1px solid var(--ui-gold-deep,#78694c);border-radius:9px;background:var(--ui-pane,#132c32)}'+
 '#modular73 .m74check{display:flex;align-items:center;gap:8px;padding:6px 0;color:var(--ui-accent,#a6d1c4);font-size:12px}'+
 '#modular73 .m74check input{width:16px;height:16px;accent-color:var(--ui-gold,#e6c993)}'+
 '#m74note{font-size:11px;color:var(--ui-muted,#a8b8b1);line-height:1.45;margin:6px 0 0}';
document.head.appendChild(style);
const colorCheckbox=document.getElementById('m74customColor'),debugCheckbox=document.getElementById('m74anchors');
const previousCleaner=clean;
clean=function(raw){const obj=raw&&typeof raw==='object'?raw:{};const v=previousCleaner(obj);v.spriteCustomColor=obj.spriteCustomColor===true;return v};
colorCheckbox.onchange=()=>{s.spriteCustomColor=colorCheckbox.checked;render(false)};
debugCheckbox.onchange=()=>{showAnchors=debugCheckbox.checked;render(false)};
const ancestorRender=render;
render=function(sync=true){
 if(s.spriteCustomColor==null)s.spriteCustomColor=false;
 ancestorRender(sync);
 colorCheckbox.checked=!!s.spriteCustomColor;
 debugCheckbox.checked=showAnchors;
 try{localStorage.setItem('atlas_draft_v074',JSON.stringify(s))}catch(e){}
};
renderCatalog();
render();
window.AtlasModularDebug={
 getAnchors:()=>JSON.parse(JSON.stringify(anchors)),
 getCurrent:()=>({spriteMode:s.spriteMode,spriteTorso:s.spriteTorso,spriteHead:s.spriteHead,spriteArms:s.spriteArms,spriteLower:s.spriteLower}),
 getCatalog:()=>catalog.map(x=>({id:x.id,name:x.name,spriteMode:x.spriteMode,spriteTorso:x.spriteTorso,spriteHead:x.spriteHead,spriteArms:x.spriteArms,spriteLower:x.spriteLower})),
 restoreCatalog,
 switchAnchors:on=>{showAnchors=!!on;render(false)}
};
if(!SOURCE){
 // Web project loads manifest asynchronously; bundled APK embeds it synchronously.
 fetch('sprites/manifest_v080.json').then(r=>r.ok?r.json():null).then(data=>{
  if(data&&data.fixedAnchors){anchors=normalizeAnchors(data.fixedAnchors);render(false)}
 }).catch(()=>{})
}
})();