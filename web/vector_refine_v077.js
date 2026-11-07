/* Atlas of Living Worlds 0.7.7 — vector anatomy and portrait refinement.
 * Generated with paths, gradients, masks and curves: NO bitmap or image assets.
 * Keeps the v0.7.6 model, modular body selectors, saving and export.
 */
(function(){
'use strict';
const oldCreature=creature,oldClean=clean,oldRender=render;
const clamp=(x,a,b,def=a)=>Math.min(b,Math.max(a,Number.isFinite(Number(x))?Number(x):def));
const f=x=>Math.round(x*100)/100;
const colors=v=>{
 const p={humanoid:['#b99585','#f2d4bb','#60494a'],aquatic:['#398e9c','#bdf5ea','#1f5368'],fae:['#b29acb','#ebd5ff','#645477'],draconic:['#ae6559','#f1c795','#5d3e48'],alien:['#8b93c6','#d6e6ff','#4c507d'],arboreal:['#5b906b','#d6e8a8','#354f45']};
 const base=p[v.spriteTorso]||p.humanoid;
 return v.spriteCustomColor?[safeColor(v.color),safeColor(v.accent),base[2]]:base
};
const path=(d,fill,stroke='#143845',w=1.6,opacity=1)=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+w+'" opacity="'+opacity+'" stroke-linecap="round" stroke-linejoin="round"/>';
const line=(d,c,w=1.5,opacity=.5)=>path(d,'none',c,w,opacity);
const ellipse=(x,y,rx,ry,fill,opacity=1,stroke='none',width=0)=>'<ellipse cx="'+f(x)+'" cy="'+f(y)+'" rx="'+f(rx)+'" ry="'+f(ry)+'" fill="'+fill+'" opacity="'+opacity+'" stroke="'+stroke+'" stroke-width="'+width+'"/>';
const dot=(x,y,r,fill,op=.8)=>'<circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(r)+'" fill="'+fill+'" opacity="'+op+'"/>';
const req=(v,a)=>Array.isArray(v?.features)&&v.features.includes(a);
const masks=v=>n(v.detailLevel,0,100,85);
function n(x,a,b,d){return clamp(x,a,b,d)}
function headArt(v,cs){
 const col=cs[0],light=cs[1],dark=cs[2],fin=v.spriteHead==='aquatic',drake=v.spriteHead==='dragon';
 const alien=v.spriteTorso==='alien',fae=v.spriteTorso==='fae',wood=v.spriteTorso==='arboreal';
 const h=Math.max(0,masks(v)/100);
 const hw=(drake?63:alien?68:fin?63:fae?56:61);
 const crown=drake?-181:alien?-178:-177;
 let g='<g data-vector-face="v077">';
 g+='<defs><linearGradient id="a77cheek" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+light+'" stop-opacity=".59"/><stop offset=".48" stop-color="'+col+'" stop-opacity=".21"/><stop offset="1" stop-color="'+dark+'" stop-opacity=".56"/></linearGradient>'+
 '<radialGradient id="a77iris"><stop stop-color="#112e3a"/><stop offset=".24" stop-color="#294d60"/><stop offset=".61" stop-color="'+light+'"/><stop offset="1" stop-color="'+dark+'"/></radialGradient>'+
 '<linearGradient id="a77lip" x1="0" y1="0" x2=".4" y2="1"><stop stop-color="'+light+'"/><stop offset=".65" stop-color="'+col+'"/><stop offset="1" stop-color="'+dark+'"/></linearGradient>'+
 '<radialGradient id="a77ear"><stop stop-color="'+light+'" stop-opacity=".90"/><stop offset=".85" stop-color="'+col+'"/><stop offset="1" stop-color="'+dark+'"/></radialGradient></defs>';
 // Ears and frills must be behind facial contour, not pasted onto cheeks.
 for(const side of [-1,1]){
  const x=side*hw*.87;
  if(fin||v.ears==='fin'){
   g+=path('M'+f(x-side*6)+' -111Q'+f(x+side*39)+' -158 '+f(x+side*82)+' -153Q'+f(x+side*56)+' -91 '+f(x+side*96)+' -67Q'+f(x+side*45)+' -31 '+f(x+side*5)+' -47Z','url(#a76fin)',light,2.4,.88);
   for(let i=0;i<7;i++){
    g+=line('M'+f(x)+' '+f(-108+i*7)+'Q'+f(x+side*(37+i*5))+' '+f(-137+i*10)+' '+f(x+side*(67+i*3))+' '+f(-145+i*14),light,1.25,.39)
   }
  }else if(drake){
   g+=path('M'+f(x-side*6)+' -125Q'+f(x+side*44)+' -183 '+f(x+side*89)+' -174Q'+f(x+side*68)+' -117 '+f(x+side*11)+' -83Z','url(#a76edge)',dark,3,.86);
   for(let i=0;i<3;i++)g+=path('M'+f(x+side*(21+i*11))+' '+f(-138+i*15)+'l'+(side*19)+' -16l'+(-side*8)+' 27Z','url(#a76pearl)',light,1.3,.77)
  }else{
   const k=fae?1.3:alien?.88:1;
   g+=path('M'+f(x-side*4)+' -110Q'+f(x+side*36*k)+' -153 '+f(x+side*76*k)+' -178Q'+f(x+side*56*k)+' -82 '+f(x+side*6)+' -53Z','url(#a77ear)',dark,2.4,.94);
   g+=line('M'+f(x+side*4)+' -83Q'+f(x+side*38*k)+' -139 '+f(x+side*64*k)+' -160',light,2.2,.43)
  }
 }
 // Cranial and jaw outline with cheekbones and chin; avoids the former cylinder.
 const headShape=drake?
 'M0 '+crown+'Q-65 -175 -66 -123Q-64 -88 -58 -53Q-61 -37 -53 -19L-43 -3Q-28 5 -24 12Q0 28 24 12Q28 5 43 -3L53 -19Q61 -37 58 -53Q64 -88 66 -123Q65 -175 0 '+crown+'Z':
 alien?
 'M0 '+crown+'Q-82 -185 -83 -126Q-83 -77 -61 -53Q-48 -24 -29 -11Q-10 8 0 12Q10 8 29 -11Q48 -24 61 -53Q83 -77 83 -126Q82 -185 0 '+crown+'Z':
 'M0 '+crown+'Q-61 -180 -65 -132Q-69 -107 -59 -78Q-58 -50 -48 -36Q-46 -16 -31 -5Q-20 11 0 17Q20 11 31 -5Q46 -16 48 -36Q58 -50 59 -78Q69 -107 65 -132Q61 -180 0 '+crown+'Z';
 g+=path(headShape,'url(#a76skin)',dark,4.5,.98);
 // Tapered sculptural forehead and contrasting cheek mass.
 g+=path('M-47 -147Q0 -175 47 -147Q45 -125 38 -110Q0 -125 -38 -110Q-45 -125 -47 -147Z','url(#a77cheek)',light,1.1,.20);
 for(const side of [-1,1]){
  g+=path('M'+(-side*10)+' -104Q'+f(side*53)+' -101 '+f(side*49)+' -72Q'+f(side*44)+' -46 '+f(side*19)+' -36Q'+f(side*36)+' -73 '+(-side*10)+' -104Z','url(#a77cheek)',light,.8,.26);
  g+=line('M'+f(side*53)+' -72Q'+f(side*44)+' -52 '+f(side*28)+' -39',light,1.5,.27);
 }
 // Sculptural nose bridge and tip.
 g+=line('M-1 -99Q-7 -75 -4 -58Q-10 -41 -3 -39Q5 -36 13 -42',dark,2.1,.35);
 g+=line('M1 -95Q5 -69 4 -51','#f5fff2',1.6,.3);
 g+=ellipse(6,-39,9,3.4,'url(#a77cheek)',.35);
 // Eyes: whites, layered irises, inner light and eyelids. Eye count is preserved.
 const eyes=Number(v.eyeCount)===1?[0]:Number(v.eyeCount)===4?[-41,-15,15,41]:[-29,29];
 for(let i=0;i<eyes.length;i++){
  const x=eyes[i],y=eyes.length===4?-95+(i%2)*23:-97,wide=v.eyes==='large'?20:eyes.length===4?10:drake?16:18;
  const half=wide;
  const lid='M'+f(x-half)+' '+y+'Q'+f(x-5)+' '+f(y-10)+' '+x+' '+f(y-10)+'Q'+f(x+10)+' '+f(y-8)+' '+f(x+half)+' '+y+'Q'+x+' '+f(y+11)+' '+f(x-half)+' '+y+'Z';
  g+=path(lid,v.eyes==='blank'?'url(#a77iris)':'#e8f8e9',dark,2.1,.97);
  if(v.eyes!=='blank'){
   let ry=v.eyes==='slit'||drake?9:7,rx=v.eyes==='slit'||drake?3.4:7;
   g+=ellipse(x,y-1,rx+2,ry+1,'url(#a77iris)',.96);
   g+=ellipse(x+.5,y-1,rx*.4,ry*.8,dark,.98);
   g+=dot(x-3,y-4,2.3,'#fff',.96);
   g+=dot(x+4,y+4,1,'#ddfff8',.79);
  }
  g+=line('M'+f(x-half-2)+' '+f(y-3)+'Q'+x+' '+f(y-17)+' '+f(x+half+2)+' '+f(y-3),dark,2.6,.66);
  g+=line('M'+f(x-half-4)+' '+f(y-18)+'Q'+x+' '+f(y-25)+' '+f(x+half+4)+' '+f(y-16),light,2,.47);
  if(fae||fin){
   for(let q=0;q<3;q++){
    let lx=x-half-1;
    g+=line('M'+lx+' '+f(y-4)+'l'+(-4-q*2)+' '+(-7+q*3),dark,1.2,.46)
   }
  }
 }
 // Mouth has actual lips and avoids a tiny detached dash.
 if(drake||v.mouth==='fangs'){
  g+=path('M-30 -25Q0 -13 30 -25L40 -9Q0 11 -40 -9Z','url(#a76edge)',dark,2.7,.95);
  g+=line('M-31 -12Q0 -7 31 -12','#1a3d42',2,.62);
  for(const side of [-1,1])for(let i=0;i<2;i++)g+=path('M'+f(side*(13+i*13)-5)+' -7l10 0l-5 '+(11+i*2)+'Z','#fffde7',light,1,.85);
 }else if(v.mouth==='beak'){
  g+=path('M-21 -25Q0 -33 21 -25L0 10Z','url(#a77lip)',dark,2.2,.98);
 }else{
  g+=path('M-21 -24Q-10 -28 0 -23Q10 -28 21 -24Q11 -14 0 -14Q-11 -14 -21 -24Z','url(#a77lip)',dark,1.6,.62);
  g+=line('M-16 -20Q0 -12 16 -20',dark,1.8,.5);
  g+=line('M-8 -7Q0 -5 8 -7',light,1,.36);
 }
 // Organic, clipped markings per ancestry.
 if(fin||v.spriteTorso==='aquatic'||req(v,'gills')){
  for(const side of [-1,1]){
   g+=path('M'+f(side*37)+' -68Q'+f(side*60)+' -46 '+f(side*54)+' -17Q'+f(side*77)+' -43 '+f(side*59)+' -78Z','url(#a76fin)',light,1.8,.70);
   for(let j=0;j<5;j++)g+=line('M'+f(side*(43+j%2*3))+' '+f(-64+j*10)+'q'+(side*13)+' -4 '+(side*18)+' -1',light,1.5,.55);
  }
  if(h>.4)for(let row=0;row<3;row++)for(let j=-2;j<=2;j++){
   const x=j*15+(row%2)*7, y=-165+row*11;
   g+=path('M'+(x-6)+' '+y+'q6 9 12 0q-6 3 -12 0Z','url(#a76pearl)',light,1,.20+h*.27)
  }
 }
 if(drake||v.spriteTorso==='draconic'){
  for(let row=0;row<3;row++)for(let j=-3;j<=3;j++){
   const x=j*14+(row%2)*7,y=-165+row*13;
   g+=path('M'+(x-8)+' '+y+'q8 12 16 0q-8 3 -16 0Z','url(#a76pearl)',light,1.3,.20+h*.32)
  }
  for(const side of [-1,1])g+=path('M'+(side*47)+' -52l'+(side*14)+' -12l'+(-side*5)+' 32Z','url(#a76edge)',dark,2,.87)
 }
 if(wood||v.skin==='bark'){
  for(let i=0;i<9;i++){
   const x=-37+(i*17)%75,y=-158+i%3*21;
   g+=line('M'+x+' '+y+'q'+(i%2?6:-7)+' 18 2 31',light,1.4,.3+h*.22)
  }
 }
 if(alien)for(let i=0;i<8;i++){const x=-39+i*11,y=-150+(i%2)*9;g+=dot(x,y,2.5,'url(#a76glow)',.41+h*.18)}
 if(fae)for(const side of [-1,1])for(let i=0;i<5;i++){const x=side*(28+i*4),y=-154+i*10;g+=dot(x,y,1.3,'#fff',.42)}
 // sculpted neck, naturally joined underneath chin
 g+=path('M-17 0Q-14 16 -14 30Q0 39 14 30Q14 16 17 0Z','url(#a76edge)',dark,2,.91);
 g+=line('M0 11Q-3 22 0 31','#f2fff3',1.5,.36);
 return g+'</g>'
}
function surface(v,cs,contour){
 const light=cs[1],dark=cs[2],skin=v.skin,form=v.spriteTorso;
 const complexity=n(v.detailLevel,0,100,85)/100;
 let out='<g data-vector-surface="v077"><defs><clipPath id="a77torsoClip"><path d="'+contour+'"/></clipPath></defs><g clip-path="url(#a77torsoClip)">';
 // Natural clavicle / ribcage highlights following actual torso shape
 out+=line('M270 294Q291 313 305 321M350 294Q330 313 315 321',light,2.6,.41);
 out+=line('M276 353Q304 366 310 375Q315 366 344 353',light,1.5,.27);
 out+=line('M281 424Q310 437 339 424',dark,1.7,.27);
 out+=line('M299 359Q294 391 299 401M321 359Q326 391 321 401',light,1.45,.22);
 if(form==='aquatic'||skin==='scales'||form==='draconic'){
  const count=Math.round(8+complexity*8);
  for(let r=0;r<count;r++){
   let yy=318+r*10.2;
   for(let j=-3;j<=3;j++){
    const x=310+j*15+(r%2)*7;
    const spec=(r+j)%5===0?'.52':'.38';
    out+=path('M'+f(x-8)+' '+f(yy)+'Q'+f(x)+' '+f(yy+13)+' '+f(x+8)+' '+f(yy)+'Q'+f(x)+' '+f(yy+4)+' '+f(x-8)+' '+f(yy)+'Z','url(#a76pearl)',light,1,.22+complexity*.23);
    if(complexity>.6&&(r+j)%5===0)out+=dot(x+2,yy+3,1.3,'#f9fff7',.41);
   }
  }
 }else if(form==='arboreal'||skin==='bark'){
  for(let r=0;r<24*complexity;r++){
   const x=272+(r*19)%76,y=284+(r*31)%171;
   out+=line('M'+x+' '+y+'q'+(r%2?9:-8)+' 12 '+(r%2?3:-4)+' 35',dark,1.25,.27);
   if(r%3===0)out+=path('M'+x+' '+y+'q13 -14 20 -9q-4 14 -20 9Z','url(#a76fin)',light,1,.47)
  }
 }else if(form==='fae'){
  for(let r=0;r<27*complexity;r++){
   const x=280+(r*13)%60,y=296+(r*37)%143;
   out+=dot(x,y,1.4+(r%3)*.4,'url(#a76glow)',.75)
  }
 }else if(form==='alien'){
  for(let r=0;r<20*complexity;r++){
   const x=280+(r*17)%63,y=305+(r*29)%136;
   out+=path('M'+x+' '+y+'l4 -8l4 8l-4 10Z','none',light,1.1,.38)
  }
 }else if(complexity>.35)for(let r=0;r<10;r++){
  out+=line('M'+(276+r*7)+' '+(341+r%3*23)+'q6 10 12 2',light,.95,.21)
 }
 out+='</g></g>';
 return out
}
function smoothJoint(group,cs){
 const light=cs[1],dark=cs[2];
 const elbow=group.querySelector('ellipse');
 if(elbow)elbow.setAttribute('opacity','.13');
 // Shoulder/forearm overlap creates a smooth, continuous shape instead of a ball joint.
 const svg='<g data-vector-joint="v077">'+
 path('M23 72Q37 67 48 76Q51 85 50 99Q43 112 32 99Q25 90 23 72Z','url(#a76skin)',dark,1.6,.97)+
 line('M31 78Q43 73 47 84Q45 96 41 100',light,1.5,.32)+
 path('M35 102Q46 96 51 105Q57 124 59 138Q44 136 39 120Z','url(#a76edge)',dark,1.1,.56)+
 '</g>';
 group.insertAdjacentHTML('beforeend',svg)
}
function tailDetail(group,v,cs){
 const light=cs[1],dark=cs[2],complexity=n(v.detailLevel,0,100,85)/100;
 const contour=group.querySelector('path');
 if(!contour)return;
 const tailShape=contour.getAttribute('d');
 let out='<g data-vector-tailtexture="v077"><defs><clipPath id="a77tailClip"><path d="'+tailShape+'"/></clipPath></defs><g clip-path="url(#a77tailClip)">';
 const rows=Math.round(10+complexity*9);
 for(let r=0;r<rows;r++){
  const y=482+r*9.7,span=37-Math.max(0,r-11)*2;
  for(let j=-2;j<=2;j++){
   const x=310+j*13+(r%2)*6;if(Math.abs(x-310)>span+6)continue;
   out+=path('M'+f(x-8)+' '+f(y)+'Q'+f(x)+' '+f(y+13)+' '+f(x+8)+' '+f(y)+'Q'+f(x)+' '+f(y+4)+' '+f(x-8)+' '+f(y)+'Z','url(#a76pearl)',light,.85,.36+complexity*.28)
  }
 }
 out+=line('M291 480Q267 540 301 651',light,2,.21)+line('M329 480Q352 540 319 651',dark,2.2,.22);
 out+='</g>';
 for(let j=-10;j<=10;j++){
  const xx=310+j*12,yy=714+(j%3)*5;
  out+=line('M310 676Q'+f(310+j*5)+' 693 '+xx+' '+yy,light,1.3,.4);
 }
 out+='</g>';
 group.insertAdjacentHTML('beforeend',out)
}
function refine(v,snippet){
 let doc;
 try{doc=new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 780">'+snippet+'</svg>','image/svg+xml')}
 catch(e){return snippet}
 const root=doc.documentElement;
 if(root.querySelector('parsererror'))return snippet;
 const main=root.querySelector('[data-vector-renderer="v076"]');
 if(!main)return snippet;
 const cs=colors(v);
 const head=main.querySelector('[data-vector-piece="head"]');
 if(head){
  // Preserve the head attachment and all surrounding body-part transforms.
  head.innerHTML=headArt(v,cs)
 }
 const torso=main.querySelector('[data-vector-piece="torso"]');
 if(torso){
  const outline=torso.querySelector('path');
  if(outline)torso.insertAdjacentHTML('beforeend',surface(v,cs,outline.getAttribute('d')))
 }
 for(const arm of main.querySelectorAll('[data-vector-piece^="arm-"]'))smoothJoint(arm,cs);
 if(v.spriteLower==='tail'){
  const tail=main.querySelector('[data-vector-piece="lower-body"]');
  if(tail)tailDetail(tail,v,cs)
 }
 // Use modest asymmetric shoulder rotations for a natural relaxed silhouette,
 // anchored at each shoulder: hand-drawn appearance with consistent joints.
 const pose=v.vectorPose==='display'?'display':v.vectorPose==='swim'?'swim':'natural';
 const angle=pose==='swim'?[-11,14]:pose==='display'?[-19,19]:[-3,6];
 const left=main.querySelector('[data-vector-piece="arm-left"]'),right=main.querySelector('[data-vector-piece="arm-right"]');
 for(const [node,deg] of [[left,angle[0]],[right,angle[1]]]){
  if(!node)continue;
  const original=node.getAttribute('transform')||'';
  node.setAttribute('transform',original.replace(' scale(', ' rotate('+deg+') scale('))
 }
 return root.innerHTML
}
creature=function(v){
 const base=oldCreature(v);
 if(!v||!v.spriteMode||v.view!=='front')return base;
 try{return refine(v,base)}catch(e){return base}
};
clean=function(obj){
 const old=oldClean(obj);
 old.vectorPose=['natural','display','swim'].includes(obj?.vectorPose)?obj.vectorPose:'natural';
 return old
};
const box=document.getElementById('modular73');
if(box){
 const holder=document.createElement('div');
 holder.className='atlas77pose';
 holder.innerHTML='<label for="atlas77pose">Положение рук и тела</label><select id="atlas77pose">'+
 '<option value="natural">Естественная поза</option>'+
 '<option value="display">Расправленные руки</option>'+
 '<option value="swim">Плавание</option></select>'+
 '<p>Черты лица, суставы и фактура строятся заново для выбранной расы.</p>';
 const options=document.getElementById('m73controls');
 if(options)options.appendChild(holder);
 const css=document.createElement('style');
 css.textContent='.atlas77pose{margin:13px 0 2px;padding:11px;border:1px solid var(--ui-gold-deep,#9a805d);background:var(--ui-pane,#172f37);border-radius:10px}.atlas77pose label{display:block;color:var(--ui-gold,#e9d09f);font-size:12px;margin-bottom:6px}.atlas77pose select{width:100%;border-radius:8px;padding:8px;background:var(--ui-card,#24404a);color:var(--ui-ink,#e8f3f4)}.atlas77pose p{font-size:11px;line-height:1.4;color:var(--ui-muted,#a9c8c9);margin:8px 0 0}';
 document.head.appendChild(css);
 const control=document.getElementById('atlas77pose');
 control.onchange=()=>{s.vectorPose=control.value;render(false)};
 const oldR=render;
 render=function(sync=true){oldR(sync);control.value=s.vectorPose||'natural';try{localStorage.setItem('atlas_draft_v077',JSON.stringify(s))}catch(e){}};
}
try{
 const draft=JSON.parse(localStorage.getItem('atlas_draft_v077')||'null');
 if(draft&&valid(draft))s=clean(draft)
}catch(e){}
const badge=document.querySelector('.atlas76status');
if(badge)badge.textContent='Векторный рисунок · анатомия и лицо v0.7.7';
render();
window.AtlasVectorRefined={version:'0.7.7',source:'svg-only',render:()=>render(false)};
})();