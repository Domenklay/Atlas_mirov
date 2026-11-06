/* Atlas Living Worlds 0.7.6 — fully procedural vector character painter.
   All body parts are drawn as editable SVG paths at runtime. No painted image layers.
   Works in offline Android WebView and the web editor. */
(function(){
'use strict';
const previousCreature=creature, previousClean=clean, previousRender=render;
const HEX=s=>safeColor(s||'#75b9b8');
const n=(x,a,b,f=a)=>Math.max(a,Math.min(b,Number.isFinite(Number(x))?Number(x):f));
const z=x=>Math.round(x*10)/10;
const P=(d,fill,stroke='#133747',w=2.5,opacity=1,extra='')=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+w+'" opacity="'+opacity+'" stroke-linecap="round" stroke-linejoin="round" '+extra+'/>';
const L=(d,c,w=1.5,opacity=.5)=>P(d,'none',c,w,opacity);
const C=(x,y,r,c,opacity=.8)=>'<circle cx="'+z(x)+'" cy="'+z(y)+'" r="'+z(r)+'" fill="'+c+'" opacity="'+opacity+'"/>';
const O=(x,y,rx,ry,c,opacity=.7)=>'<ellipse cx="'+z(x)+'" cy="'+z(y)+'" rx="'+z(rx)+'" ry="'+z(ry)+'" fill="'+c+'" opacity="'+opacity+'"/>';
const palettes={
 humanoid:['#b99585','#f2d4bb','#60494a'],aquatic:['#398e9c','#bdf5ea','#1f5368'],
 fae:['#b29acb','#ebd5ff','#645477'],draconic:['#ae6559','#f1c795','#5d3e48'],
 alien:['#8b93c6','#d6e6ff','#4c507d'],arboreal:['#5b906b','#d6e8a8','#354f45']
};
const anchors={
 neck:[310,244],shoulderLeft:[255,306],shoulderRight:[365,306],
 hipLeft:[283,478],hipRight:[337,478],tail:[310,475]
};
function pal(v){
 const colors=palettes[v.spriteTorso]||palettes.humanoid;
 return v.spriteCustomColor?[HEX(v.color),HEX(v.accent),colors[2]]:colors
}
function gradients(c){
 return '<defs id="atlas76defs">'+
 '<radialGradient id="a76skin" cx=".31" cy=".19" r=".87"><stop stop-color="#f9fff2"/><stop offset=".17" stop-color="'+c[1]+'"/><stop offset=".46" stop-color="'+c[0]+'"/><stop offset=".83" stop-color="'+c[0]+'"/><stop offset="1" stop-color="'+c[2]+'"/></radialGradient>'+
 '<linearGradient id="a76edge" x1="0" y1="0" x2="1" y2=".2"><stop stop-color="'+c[2]+'"/><stop offset=".21" stop-color="'+c[0]+'"/><stop offset=".48" stop-color="'+c[1]+'"/><stop offset=".82" stop-color="'+c[0]+'"/><stop offset="1" stop-color="'+c[2]+'"/></linearGradient>'+
 '<linearGradient id="a76pearl" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#f6fff6" stop-opacity=".85"/><stop offset=".33" stop-color="'+c[1]+'" stop-opacity=".8"/><stop offset=".71" stop-color="'+c[0]+'" stop-opacity=".5"/><stop offset="1" stop-color="'+c[2]+'" stop-opacity=".7"/></linearGradient>'+
 '<linearGradient id="a76fin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+c[1]+'" stop-opacity=".87"/><stop offset=".38" stop-color="'+c[0]+'" stop-opacity=".57"/><stop offset=".8" stop-color="'+c[1]+'" stop-opacity=".32"/><stop offset="1" stop-color="'+c[2]+'" stop-opacity=".45"/></linearGradient>'+
 '<radialGradient id="a76glow"><stop stop-color="#ffffff" stop-opacity=".96"/><stop offset=".24" stop-color="'+c[1]+'" stop-opacity=".72"/><stop offset="1" stop-color="'+c[0]+'" stop-opacity="0"/></radialGradient>'+
 '</defs>';
}
function scaleData(v){
 const shoulder=n(v.shoulderWidth,65,145,100)/100,waist=n(v.waistWidth,65,145,100)/100;
 const build=n(v.build,0,100,40),detail=n(v.detailLevel,0,100,85)/100;
 const sw=54*shoulder*(1+(build-40)/450);
 const ww=39*waist*(1+(build-40)/700);
 return {sw,ww,detail,armLen:n(v.armLength,65,140,100)/100,headW:n(v.headWidth,65,145,100)/100,
  total:n(v.size,60,190,110)/110,neck:n(v.neckLen,0,65,18)};
}
function wings(v,c,d){
 if(!v.wings||v.wings==='none')return '';
 const a=c[1];let out='<g data-vector-piece="wings">';
 for(const sign of [-1,1]){
  const root=310+sign*(d.sw*.73);
  if(v.wings==='insect'){
   out+=P('M'+z(root)+' 313Q'+(310+sign*169)+' 83 '+(310+sign*241)+' 128Q'+(310+sign*299)+' 225 '+(310+sign*154)+' 337Q'+(310+sign*252)+' 350 '+(310+sign*216)+' 435Q'+(310+sign*92)+' 466 '+z(root)+' 373Z','url(#a76fin)',a,2.7,.79);
   for(let i=0;i<8;i++)out+=L('M'+z(root)+' 335Q'+(310+sign*160)+' '+(166+i*25)+' '+(310+sign*(220-i*2))+' '+(144+i*37),a,1.3,.37);
  }else{
   out+=P('M'+z(root)+' 316Q'+(310+sign*155)+' 173 '+(310+sign*218)+' 108L'+(310+sign*213)+' 235L'+(310+sign*253)+' 298L'+(310+sign*195)+' 336L'+(310+sign*205)+' 416L'+z(root)+' 376Z','url(#a76fin)',a,3,.81);
   for(let i=0;i<5;i++)out+=L('M'+z(root)+' 340Q'+(310+sign*(119+i*12))+' '+(203+i*34)+' '+(310+sign*(218+i*6))+' '+(108+i*68),a,1.6,.52);
  }
 }
 return out+'</g>'
}
function arm(v,c,d,sign){
 const a=c[1],s=c[2],u=v.spriteArms,big=u==='strong',fin=u==='finned';
 const k=big?1.3:u==='slender'?.83:1,scale=n(d.armLen,.65,1.4,1);
 const point=sign<0?anchors.shoulderLeft:anchors.shoulderRight;
 const shoulderX=310+sign*d.sw*.98;
 let out='<g data-vector-piece="arm-'+(sign<0?'left':'right')+'" transform="translate('+z(shoulderX)+' '+point[1]+') scale('+sign+' '+z(scale)+')">';
 // local coordinates; soft hands, rounded elbow, separate forearm and anatomically attached fingers
 out+=P('M-10 -10Q14 -18 25 9Q50 43 49 77Q43 93 29 94Q20 87 14 69Q-6 29 -10 -10Z','url(#a76skin)',s,3.2);
 out+=P('M29 83Q42 78 49 87Q65 115 69 151Q70 173 53 178Q43 171 40 155Q36 121 29 83Z','url(#a76edge)',s,2.9);
 out+=O(40,84,12,11,'url(#a76pearl)',.67);
 out+=L('M0 2Q30 28 38 69',a,2.2,.52);
 out+=L('M42 103Q58 135 55 162','#f3fff5',1.8,.32);
 if(fin){
  out+=P('M42 117Q78 112 93 130Q77 158 62 165Z','url(#a76fin)',a,2.3,.84);
  for(let i=0;i<4;i++)out+=L('M46 '+(124+i*9)+'L'+(80-i*4)+' '+(132+i*8),a,1.25,.62);
 }
 out+=P('M43 165Q52 158 64 167Q77 182 70 195Q59 205 45 195Q38 184 43 165Z','url(#a76skin)',s,2.4);
 for(let i=0;i<4;i++){
  const x=45+i*7;
  out+=P('M'+x+' 186Q'+(x+2)+' '+(210+(i%2)*3)+' '+(x+7)+' '+(211+i%2*3)+'Q'+(x+12)+' 204 '+(x+8)+' 187Z','url(#a76edge)',s,1.2,.96);
  if(big||v.hands==='claws')out+=P('M'+(x+3)+' '+(210+i%2*3)+'l6 8l-9 -2Z','#e8f6e1',a,.85,.82)
 }
 if(fin)out+=L('M42 180Q63 188 72 180',a,1.3,.48);
 if(d.detail>.55)for(let i=0;i<7;i++){
  const x=8+(i%3)*8,y=15+i*9;
  out+=L('M'+x+' '+y+'q8 8 13 0',a,1,.29);
 }
 out+='</g>';
 return out
}
function lower(v,c,d){
 const a=c[1],s=c[2],fin=v.spriteLower==='tail';
 let out='<g data-vector-piece="lower-body">';
 if(fin){
  const w=d.ww*.85;
  const path='M'+z(310-w)+' 469Q249 514 277 592Q289 644 310 677Q327 647 344 590Q373 515 '+z(310+w)+' 469Z';
  out+=P(path,'url(#a76skin)',s,4);
  out+=P('M310 647Q253 692 168 723Q226 752 293 727Q310 744 327 727Q390 756 452 723Q368 688 310 647Z','url(#a76fin)',a,3.2,.94);
  out+=L('M310 482Q300 569 311 655','#f8fff1',2.6,.28);
  const rows=Math.round(5+d.detail*14);
  for(let r=0;r<rows;r++)for(let j=-2;j<=2;j++){
   const yy=485+r*10.2,x=310+j*13+(r%2)*7;
   if(yy>657)continue;
   out+=P('M'+z(x-8)+' '+z(yy)+'q8 12 16 0q-8 4 -16 0Z','url(#a76pearl)',a,.92,.24+d.detail*.29)
  }
  for(let j=-10;j<=10;j++)out+=L('M310 668Q'+(310+j*6)+' 701 '+(310+j*13)+' '+(730+Math.sin(j*.6)*8),a,1.05,.35);
  if(v.features?.includes('fins'))for(const dir of [-1,1]){
   out+=P('M'+(310+dir*31)+' 494Q'+(310+dir*89)+' 467 '+(310+dir*104)+' 526L'+(310+dir*33)+' 553Z','url(#a76fin)',a,1.9,.77);
   for(let i=0;i<5;i++)out+=L('M'+(310+dir*30)+' '+(503+i*10)+'l'+dir*(40+i*3)+' '+(-14+i*6),a,1,.47)
  }
 }else{
  for(const sign of [-1,1]){
   const hx=sign<0?anchors.hipLeft[0]:anchors.hipRight[0];
   out+='<g data-vector-piece="leg-'+(sign<0?'left':'right')+'" transform="translate('+hx+' 477) scale('+sign+' 1)">';
   out+=P('M-17 -10Q-22 36 -17 79Q-15 102 -3 104Q14 103 19 83Q20 33 16 -10Z','url(#a76skin)',s,3);
   out+=O(2,101,12,11,'url(#a76pearl)',.61);
   out+=P('M-9 108Q-14 152 -13 189Q-11 209 2 211Q16 209 18 189Q12 143 12 108Z','url(#a76edge)',s,3);
   out+=P('M-10 195Q-26 210 -31 221Q-22 235 15 228Q25 221 14 197Z','url(#a76skin)',s,2.8);
   out+=L('M-6 8Q5 51 4 85','#f7fff4',2,.28);
   if(v.feet==='claws')for(let j=-1;j<=1;j++)out+=P('M'+(-15+j*12)+' 225l8 11l-10 -2Z','#f3f4e2',a,.9,.85);
   if(v.feet==='webbed')out+=P('M-30 216Q-45 242 0 246Q36 242 18 216Z','url(#a76fin)',a,2,.75);
   out+='</g>'
  }
 }
 return out+'</g>'
}
function torso(v,c,d){
 const a=c[1],sh=d.sw,wa=d.ww,s=c[2],kind=v.spriteTorso;
 const shape='M'+z(310-sh*.85)+' 274Q310 255 '+z(310+sh*.85)+' 274Q'+z(310+sh+12)+' 295 '+z(310+sh)+' 332Q'+z(310+wa+14)+' 379 '+z(310+wa)+' 416Q'+z(310+wa+21)+' 455 344 485Q310 502 276 485Q'+z(310-wa-21)+' 455 '+z(310-wa)+' 416Q'+z(310-wa-14)+' 379 '+z(310-sh)+' 332Q'+z(310-sh-12)+' 295 '+z(310-sh*.85)+' 274Z';
 let out='<g data-vector-piece="torso"><defs><clipPath id="a76torso"><path d="'+shape+'"/></clipPath></defs>';
 out+=P(shape,'url(#a76skin)',s,4);
 out+='<g clip-path="url(#a76torso)">';
 out+=P('M254 273Q289 268 310 279Q340 266 365 273Q337 306 310 334Q274 305 254 273Z','url(#a76pearl)',a,1,.17);
 out+=L('M'+z(310-sh*.76)+' 311Q282 331 309 338Q338 331 '+z(310+sh*.76)+' 311',a,2,.41);
 out+=L('M310 343Q306 376 310 431','#f2fff5',2.2,.27);
 if(kind==='aquatic'||v.k==='mermaid'){
  // Iridescent scales: staggered rows in the clipped torso.
  for(let row=0;row<Math.round(5+d.detail*9);row++)for(let i=-3;i<=3;i++){
   const x=310+i*16+(row%2)*8,y=314+row*13;
   out+=P('M'+(x-9)+' '+y+'q9 12 18 0q-9 3 -18 0Z','url(#a76pearl)',a,.9,.16+.32*d.detail);
  }
  out+=P('M'+z(310-sh*.75)+' 304Q'+z(310-sh-15)+' 287 '+z(310-sh-20)+' 337L'+z(310-sh*.64)+' 333Z','url(#a76fin)',a,2,.66);
  out+=P('M'+z(310+sh*.75)+' 304Q'+z(310+sh+15)+' 287 '+z(310+sh+20)+' 337L'+z(310+sh*.64)+' 333Z','url(#a76fin)',a,2,.66);
 }else if(kind==='draconic'||v.skin==='scales'){
  for(let row=0;row<5;row++){
   const y=294+row*31,w=37-row*3;
   out+=P('M'+(310-w)+' '+y+'Q310 '+(y-17)+' '+(310+w)+' '+y+'Q310 '+(y+20)+' '+(310-w)+' '+y+'Z','url(#a76pearl)',a,1.7,.44)
  }
 }else if(kind==='arboreal'||v.skin==='bark'){
  for(let i=0;i<18;i++){
   const x=272+(i*17)%76,y=282+(i*27)%160;
   out+=L('M'+x+' '+y+'q'+(i%2?6:-6)+' 18 3 31',a,1.5,.42)
  }
 }else if(kind==='fae'){
  for(let i=0;i<21;i++){let x=279+(i*17)%61,y=294+(i*31)%148;out+=C(x,y,1.4+i%3*.6,'url(#a76glow)',.72)}
 }else if(kind==='alien'){
  for(let i=0;i<15;i++){let x=274+(i*19)%70,y=289+(i*23)%148;out+=P('M'+x+' '+y+'l4 -9l6 9l-6 10Z','url(#a76pearl)',a,1,.41)}
 }else if(d.detail>.4){
  for(let i=0;i<8;i++){let x=284+i%4*16,y=355+Math.floor(i/4)*23;out+=L('M'+x+' '+y+'q6 9 12 0',a,1.1,.24)}
 }
 out+='</g>';
 out+=L('M'+z(310-wa*.72)+' 427Q310 438 '+z(310+wa*.72)+' 427',a,1.6,.33);
 out+='</g>';
 return out
}
function head(v,c,d){
 const kind=v.spriteHead,a=c[1],s=c[2],width=d.headW*(kind==='dragon'?1.09:kind==='aquatic'?1.03:1);
 let out='<g data-vector-piece="head" transform="translate(310 242) scale('+z(width)+' '+z(.95+(width-1)*.18)+')">';
 const dragon=kind==='dragon',aquatic=kind==='aquatic';
 // Head silhouette from neck at y=0, up to cranium at -168
 const outline=dragon?
 'M0 -168Q-48 -164 -54 -121L-57 -56Q-53 -13 -30 -11L-24 5Q0 18 24 5L30 -11Q53 -13 57 -56L54 -121Q48 -164 0 -168Z':
 aquatic?
 'M0 -167Q-53 -160 -52 -112Q-54 -54 -32 -18Q-18 6 0 9Q18 6 32 -18Q54 -54 52 -112Q53 -160 0 -167Z':
 'M0 -164Q-53 -154 -51 -114Q-51 -56 -33 -19Q-15 9 0 12Q15 9 33 -19Q51 -56 51 -114Q53 -154 0 -164Z';
 if(!dragon)for(const dir of [-1,1]){
   const x=dir*43;
   if(aquatic){
    out+=P('M'+x+' -92Q'+(x+dir*54)+' -143 '+(x+dir*69)+' -113L'+(x+dir*30)+' -44Z','url(#a76fin)',a,2.1,.86);
    for(let i=0;i<4;i++)out+=L('M'+x+' '+(-91+i*10)+'L'+(x+dir*(35+i*6))+' '+(-119+i*14),a,1.2,.56);
   }else{
    out+=P('M'+x+' -102Q'+(x+dir*41)+' -151 '+(x+dir*64)+' -165Q'+(x+dir*46)+' -75 '+x+' -52Z','url(#a76edge)',s,2.2,.93);
    out+=L('M'+x+' -77Q'+(x+dir*37)+' -132 '+(x+dir*55)+' -150',a,1.3,.5);
   }
 }
 if(dragon)for(const dir of [-1,1]){
  out+=P('M'+(dir*28)+' -143Q'+(dir*40)+' -196 '+(dir*73)+' -221Q'+(dir*70)+' -157 '+(dir*47)+' -125Z','url(#a76edge)',s,2.8,.92);
 }
 out+=P(outline,'url(#a76skin)',s,3.8);
 // Eyebrows, cornea, iris and tiny specular glints.
 const eyes=Number(v.eyeCount)===1?[0]:Number(v.eyeCount)===4?[-35,-13,13,35]:[-24,24];
 for(let i=0;i<eyes.length;i++){
  const x=eyes[i],y=eyes.length===4?-97+(i%2)*17:-97,rx=eyes.length===4?9:dragon?13:14;
  out+=P('M'+(x-rx-3)+' '+y+'Q'+x+' '+(y-11)+' '+(x+rx+3)+' '+y+'Q'+x+' '+(y+10)+' '+(x-rx-3)+' '+y+'Z','#eaffeb',s,1.7);
  if(v.eyes!=='blank'){
   const slit=dragon||v.eyes==='slit';out+=O(x,y,slit?2.6:5,slit?8:5,'#20484e',.96);
   out+=C(x-2,y-3,2,'#fff',.94)
  }
  out+=L('M'+(x-rx-6)+' '+(y-12)+'q'+(rx+7)+' -10 '+(2*rx+7)+' 1',a,1.9,.55);
 }
 if(dragon){
  out+=P('M-38 -54Q0 -47 38 -54L48 -26Q0 17 -48 -26Z','url(#a76edge)',s,2.1);
  for(let i=-2;i<=2;i++)out+=P('M'+(i*14-4)+' -15l8 0l-4 13Z','#f9fff0',a,.6,.8)
 }else{
  out+=L('M0 -74q-7 17 0 22q7 3 12 0',s,1.7,.45);
  out+=L('M-15 -25Q0 -17 15 -25',s,2.4,.69);
  if(aquatic)for(const dir of [-1,1])for(let i=0;i<4;i++)out+=L('M'+(dir*42)+' '+(-63+i*11)+'l'+(dir*13)+' -4',a,1.8,.55)
 }
 if(v.skin==='bark')for(let i=0;i<7;i++)out+=L('M'+(-30+i*10)+' -140q'+(i%2?4:-4)+' 19 0 33',a,1.1,.38);
 if(d.detail>.65)for(let i=0;i<12;i++)out+=C(-35+i%5*17,-57+Math.floor(i/5)*11,1.3,a,.23);
 // Neck hides under torso seam.
 out+=P('M-14 -5Q0 -1 14 -5L18 30L-18 30Z','url(#a76edge)',s,2,.74);
 out+='</g>';
 return out
}
function body(v){
 const c=pal(v),d=scaleData(v);
 const scale=n(d.total,.58,1.65,1);
 const aura='<ellipse cx="310" cy="397" rx="211" ry="286" fill="url(#a76glow)" opacity=".14"/>';
 let out=gradients(c)+aura+'<g data-vector-renderer="v076" transform="translate(310 390) scale('+z(scale)+') translate(-310 -390)">';
 out+=wings(v,c,d);
 out+=lower(v,c,d);
 out+=arm(v,c,d,-1)+arm(v,c,d,1);
 out+=torso(v,c,d);
 out+=head(v,c,d);
 if(d.detail>.55&&v.glow>45)for(let i=0;i<12;i++)out+=C(280+(i*37)%67,318+(i*29)%132,1.4+(i%3)*.7,'url(#a76glow)',.5);
 return out+'</g>'
}
creature=function(v){
 if(v?.spriteMode===true&&v.view==='front')return body(v);
 return previousCreature(v)
};
const previousValidClean=clean;
clean=function(o){
 const data=previousValidClean(o);
 // Convert formerly painted mermaids to fully procedural aquatic forms.
 if(o?.spriteArtSet==='mermaid_v075'){
  data.spriteMode=true;
  data.spriteTorso='aquatic';
  data.spriteHead=o.paintHead==='head_deep'?'aquatic':'elven';
  data.spriteLower='tail';
  data.spriteArms='finned';
 }
 return data
};
function migrate(){
 let changed=false;
 try{
  const raw=JSON.parse(window.__AtlasCatalogBeforeStartup||'null');
  if(Array.isArray(raw)){
   const idMap=new Map(raw.filter(x=>x&&x.id).map(x=>[x.id,x]));
   catalog=catalog.map((record,i)=>{
    const former=idMap.get(record.id)||raw[i];
    if(former&&former.spriteArtSet==='mermaid_v075'){
     changed=true;return clean({...record,spriteArtSet:'mermaid_v075',paintHead:former.paintHead})
    }
    return record
   });
  }
  if(changed)persist()
 }catch(e){}
 try{
  const raw=JSON.parse(localStorage.getItem('atlas_draft_v075')||'null');
  if(raw?.spriteArtSet==='mermaid_v075'&&valid(raw))s=clean(raw)
 }catch(e){}
}
migrate();
const section=document.getElementById('modular73');
if(section){
 const lead=section.querySelector('.m73lead');
 if(lead)lead.textContent='Все части теперь рисуются программно: голова, шея, туловище, руки, ноги, хвост, чешуя и плавники. Готовые изображения не используются.';
 const note=section.querySelector('.m73note');
 if(note)note.textContent='Создано на SVG без художественных PNG. В модульном режиме меняются формы, пропорции и цвет; боковой и задний ракурсы пока используют прежний рисунок.';
 const heading=section.querySelector('h3');if(heading)heading.textContent='Векторный конструктор существ';
 const messageBox=document.getElementById('m73status');
 if(messageBox)messageBox.title='Каждая часть фигуры создаётся SVG-командами при изменении настроек';
}
const badge=document.createElement('div');
badge.className='atlas76status';
badge.textContent='Векторная прорисовка · без изображений';
const css=document.createElement('style');
css.textContent='.atlas76status{font:600 11px system-ui,sans-serif;color:var(--ui-gold,#e6c58c);text-align:center;letter-spacing:.05em;margin:0 0 10px;opacity:.9}';
document.head.appendChild(css);
const stage=document.getElementById('stage');if(stage)stage.insertAdjacentElement('beforebegin',badge);
const oldRender=render;
render=function(sync=true){
 oldRender(sync);
 try{localStorage.setItem('atlas_draft_v076',JSON.stringify(s))}catch(e){}
};
renderCatalog();render();
window.AtlasVectorRenderer={version:'0.7.6',source:'procedural-svg',parts:['head','torso','arm-left','arm-right','lower-body','wings'],render:()=>render(false)};
})();