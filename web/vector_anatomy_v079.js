/* Atlas of Living Worlds v0.7.9 — one anatomical rig for three projections.
 * Only runtime SVG geometry: no character rasters and no external dependencies.
 * Restores editable arm/leg counts, horns, eye forms, skin markings, side girth.
 */
(function(){
'use strict';
const previousCreature=creature;
const $n=(x,min,max,fallback=min)=>Math.max(min,Math.min(max,Number.isFinite(+x)?+x:fallback));
const f=x=>Math.round(x*10)/10;
const P=(d,fill,stroke='#163745',width=2.8,op=1,ext='')=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+width+'" opacity="'+op+'" stroke-linecap="round" stroke-linejoin="round" '+ext+'/ >'.replace('/ >','/>');
const L=(d,color,width=1.4,op=.5)=>P(d,'none',color,width,op);
const dot=(x,y,r,fill,op=.8)=>'<circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(r)+'" fill="'+fill+'" opacity="'+op+'"/>';
const palette={humanoid:['#b99585','#f2d4bb','#60494a'],aquatic:['#398e9c','#bdf5ea','#1f5368'],fae:['#b29acb','#ebd5ff','#645477'],draconic:['#ae6559','#f1c795','#5d3e48'],alien:['#8b93c6','#d6e6ff','#4c507d'],arboreal:['#5b906b','#d6e8a8','#354f45']};
const raceShape={humanoid:[1,1,1],aquatic:[.91,.85,1.06],fae:[.75,.75,.91],draconic:[1.35,1.24,1.14],alien:[.76,.81,1.3],arboreal:[1.05,.9,1.08]};
function colors(v){const c=palette[v.spriteTorso]||palette.humanoid;return v.spriteCustomColor?[safeColor(v.color),safeColor(v.accent),c[2]]:c}
function model(v){
 const race=raceShape[v.spriteTorso]||raceShape.humanoid,bulge=1+($n(v.build,0,100,40)-40)/460;
 const arms=[0,2,4].includes(+v.arms)?+v.arms:2,legs=[0,2,4].includes(+v.legs)?+v.legs:2;
 const face=String(v.view||'front'),s=face==='side'?'side':face==='back'?'back':'front';
 const waist=$n(v.waistWidth,65,145,100)/100*race[1],shoulder=$n(v.shoulderWidth,65,145,100)/100*race[0];
 return {view:s,arms,legs,hasTail:v.spriteLower==='tail',horns:v.horns||'none',skin:v.skin||'smooth',eyes:v.eyes||'standard',
   shoulders:52*shoulder*bulge,waist:39*waist*(1+($n(v.build,0,100,40)-40)/850),
   depthShoulder:22+29*shoulder,depthWaist:19+24*waist,
   head:$n(v.headWidth,65,145,100)/100*race[2],armLen:$n(v.armLength,65,140,100)/100,
   size:$n(v.size,60,190,110)/110,detail:$n(v.detailLevel,0,100,85)/100,
   shoulderY:294,hipsY:472,neckY:236-$n(v.neckLen,0,65,18)*.35,
   colors:colors(v)}
}
function appendSVG(parent,markup,prepend=false){
 const parsed=new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">'+markup+'</svg>','image/svg+xml');
 if(parsed.querySelector('parsererror'))return;
 const ref=prepend?parent.firstChild:null;
 for(const child of Array.from(parsed.documentElement.childNodes))parent.insertBefore(parent.ownerDocument.importNode(child,true),ref)
}
function arm(v,m,dir,index){
 const [base,light,dark]=m.colors;
 const side=m.view==='side',far=side&&index%2===0;
 const lane=index>=2?1:0,localSign=side?1:dir;
 const atX=side?(far?300+lane*8:326+lane*10):310+dir*(m.shoulders*.94-lane*9);
 const y=m.shoulderY+lane*63;
 const length=m.armLen*(lane?.92:1),strong=v.spriteArms==='strong',thin=v.spriteTorso==='fae';
 const thick=(strong?18:thin?11.5:14)*(lane?.88:1);
 const slant=m.view==='back'?4:m.view==='side'?1:7;
 const pose=v.vectorPose==='swim'?-26:v.vectorPose==='display'?23:slant;
 let g='<g data-rig-part="arm" data-rig-index="'+index+'" opacity="'+(far?.66:1)+'" transform="translate('+f(atX)+' '+f(y)+') rotate('+f(localSign*pose)+') scale('+localSign+' '+f(length)+')">';
 const w=thick;
 // Single continuous volume from deltoid to wrist: no detached ball joints.
 g+=P('M'+f(-w*.80)+' -7Q'+f(-w-6)+' 9 1 38Q10 60 20 78Q27 91 24 99Q25 124 40 161Q42 176 54 173Q67 168 57 147Q48 117 45 86Q43 75 37 67Q29 48 '+f(w)+' 12Q'+f(w)+' -15 '+f(-w*.8)+' -7Z','url(#v78body)',dark,3.1,.98);
 g+=L('M-3 7Q19 35 29 66Q34 76 32 90',light,2,.36);
 g+=L('M30 95Q43 126 48 150','#eafff7',1.6,.25);
 g+=L('M25 82Q32 79 40 86',dark,1.35,.29);
 if(v.spriteArms==='finned'||v.hands==='webbed'){
  g+=P('M36 112Q67 107 85 122Q70 152 43 156Z','url(#v78fin)',light,1.9,.80);
  for(let i=0;i<5;i++)g+=L('M39 '+(117+i*7)+'l'+(40-i*4)+' '+(i*4),light,1,.46)
 }
 if(v.hands==='pincers'){
  g+=P('M43 166Q72 160 80 185Q66 181 58 190Q81 207 55 217Q34 206 43 166Z','url(#v78edge)',light,2.6);
 }else{
  g+=P('M43 162Q54 158 62 165Q69 185 61 192Q54 196 48 187Z','url(#v78body)',dark,1.8);
  for(let k=0;k<4;k++){
   const x=45+k*5;
   g+=P('M'+x+' 184Q'+(x-1)+' '+(201+k%2*3)+' '+(x+3)+' '+(207+k%2*2)+'Q'+(x+8)+' 207 '+(x+7)+' 185Z','url(#v78edge)',light,1.0,.94);
   if(v.hands==='claws')g+=P('M'+(x+2)+' 207l5 11l-9 -4Z','#f2f9e6',light,.8,.81);
  }
 }
 if(m.detail>.6){g+=L('M8 39Q24 52 22 67',light,1,.21);g+=L('M34 112Q41 128 45 140',dark,1.1,.22)}
 return g+'</g>'
}
function arms(v,m){
 if(!m.arms)return '';
 const pairs=m.arms/2;
 let result='<g data-rig-limbs="arms" data-limb-count="'+m.arms+'">';
 for(let i=pairs-1;i>=0;i--){result+=arm(v,m,-1,2*i)+arm(v,m,1,2*i+1)}
 return result+'</g>'
}
function leg(v,m,x,sign,index){
 const [base,light,dark]=m.colors,far=m.view==='side'&&index%2===0;
 const tall=m.view==='side'?.97:1,wide=v.spriteTorso==='draconic'?19:v.spriteTorso==='fae'?11:15;
 const dy=m.hipsY,stagger=m.legs===4?index%2*3:0;
 let g='<g data-rig-part="leg" data-rig-index="'+index+'" opacity="'+(far?.73:1)+'" transform="translate('+f(x)+' '+(dy+stagger)+') scale('+f(sign)+' '+f(tall)+')">';
 g+=P('M'+f(-wide)+' -11Q'+f(-wide-7)+' 29 '+f(-wide+2)+' 77Q'+f(-wide+5)+' 97 '+f(-wide+4)+' 111Q'+f(-wide+1)+' 137 '+f(-wide+1)+' 170Q'+f(-wide+1)+' 201 0 211Q16 216 '+f(wide+1)+' 198Q'+f(wide+3)+' 151 '+f(wide-1)+' 114Q'+f(wide+5)+' 96 '+f(wide+6)+' 77Q'+f(wide+8)+' 26 '+f(wide)+' -11Z','url(#v78body)',dark,3,.97);
 g+=L('M-2 14Q-6 54 -2 86Q4 114 1 149','#effff2',1.7,.30);
 g+=L('M-5 99Q2 94 9 100',dark,1.2,.34);
 if(v.feet==='hooves'||v.spriteTorso==='arboreal'){
  g+=P('M-14 196Q-23 214 -23 228L23 228Q17 212 13 196Z','url(#v78edge)',light,2.6);
  g+=L('M2 214v14',light,1.7,.50);
 }else if(v.feet==='webbed'){
  g+=P('M-11 198Q-30 208 -38 235Q-7 245 35 234Q31 216 14 198Z','url(#v78fin)',light,2.6);
  for(let j=-2;j<=2;j++)g+=L('M1 200L'+(j*13)+' '+(228+Math.abs(j)*3),light,1.2,.55)
 }else{
  g+=P('M-12 197Q-32 214 -30 225Q-17 236 27 226Q29 216 14 197Z','url(#v78body)',dark,2.3);
  for(let j=-1;j<=2;j++){
   g+=L('M'+(-17+j*12)+' 229q3 -8 9 -7',light,1.2,.48);
   if(v.feet==='claws')g+=P('M'+(-16+j*11)+' 229l8 10l-10 -4Z','#eff8e6',light,.8,.83)
  }
 }
 return g+'</g>'
}
function legs(v,m){
 if(m.hasTail||m.legs===0)return '';
 const xs=m.view==='side'?m.legs===4?[291,302,325,340]:[299,331]:m.legs===4?[310-m.waist*1.01,310-m.waist*.39,310+m.waist*.39,310+m.waist*1.01]:[310-m.waist*.66,310+m.waist*.66];
 let out='<g data-rig-limbs="legs" data-limb-count="'+m.legs+'">';
 for(let j=0;j<xs.length;j++)out+=leg(v,m,xs[j],m.view==='side'?1:xs[j]<310?-1:1,j);
 return out+'</g>'
}
function horns(v,m){
 const h=m.horns;if(!['pair','single','antlers'].includes(h))return '';
 const [base,light,dark]=m.colors,side=m.view==='side';
 let o='<g data-rig-organ="horns" data-horn-type="'+h+'">';
 if(h==='single'){
  const x=side?10:0;
  o+=P('M'+(x-13)+' -144Q'+(x-10)+' -191 '+(x+10)+' -224Q'+(x+18)+' -183 '+(x+17)+' -144Z','url(#v78edge)',light,2.3,.96);
 }else{
  for(const sign of (side?[1]:[-1,1])){
   const x=side?3:sign*36;
   o+=P('M'+f(x-12)+' -142Q'+f(x+sign*4)+' -188 '+f(x+sign*50)+' -230Q'+f(x+sign*41)+' -175 '+f(x+12)+' -139Z','url(#v78edge)',dark,2.6,.96);
   o+=L('M'+x+' -152Q'+f(x+sign*18)+' -194 '+f(x+sign*45)+' -216',light,1.3,.46);
   if(h==='antlers')for(let i=0;i<3;i++)o+=L('M'+f(x+sign*(12+i*10))+' '+(-168-i*16)+'Q'+f(x+sign*(40+i*10))+' '+(-188-i*16)+' '+f(x+sign*(50+i*9))+' '+(-213-i*13),light,3.5,.86)
  }
 }
 return o+'</g>'
}
function headAccents(v,m){
 const [base,light,dark]=m.colors,side=m.view==='side',back=m.view==='back',detail=m.detail;
 let g='<g data-rig-dermis="'+m.skin+'">';
 if(!back){
  if(side){
   const rx=m.eyes==='large'?17:13;
   g+=P('M'+(64-rx)+' -107Q64 -'+(107+rx*.82)+' '+(64+rx)+' -107Q64 -'+(107-rx*.64)+' '+(64-rx)+' -107Z',m.eyes==='blank'?'url(#v78fin)':'#eaf7e6',dark,2.3,.96);
   if(m.eyes!=='blank'){
    g+='<ellipse cx="65" cy="-107" rx="'+(m.eyes==='slit'?2.3:5.4)+'" ry="'+(m.eyes==='slit'?9:5.9)+'" fill="#26495b"/>';
    g+=dot(62,-110,2,'#fff',.9)
   }
   g+=L('M47 -124Q65 -139 85 -121',light,2.1,.52);
   if(v.mouth==='fangs'||v.spriteHead==='dragon')g+=P('M73 -31l8 12l-13 -5Z','#f2f7d8',light,.8,.86);
  }
 }else{
  g+=L('M-4 -163Q-12 -84 -2 -16',light,2.3,.25);
  for(let i=0;i<7*detail;i++)g+=L('M'+f(-32+i*10)+' '+f(-147+i%2*19)+'q3 22 1 35',light,1.0,.28)
 }
 if(m.skin==='scales'||v.spriteTorso==='draconic')for(let i=0;i<11*detail;i++){
  const x=side?(-30+i%3*20):(-34+i%5*17),y=-150+Math.floor(i/(side?3:5))*14;
  g+=L('M'+x+' '+y+'q7 9 13 0',light,1.2,.39)
 }
 if(m.skin==='bark'||v.spriteTorso==='arboreal')for(let i=0;i<9*detail;i++){
  const x=side?(-30+i%3*20):(-37+i%5*18),y=-148+Math.floor(i/(side?3:5))*22;
  g+=L('M'+x+' '+y+'q'+(i%2?5:-5)+' 19 1 27',dark,1.35,.44)
 }
 if(m.skin==='spots'||v.spriteTorso==='alien')for(let i=0;i<12*detail;i++){
  const x=side?(-16+i%4*17):(-34+i%6*13),y=-140+Math.floor(i/(side?4:6))*29;
  g+=dot(x,y,1.6+(i%3)*.45,light,.4)
 }
 return g+'</g>'
}
function sideTorso(v,m){
 const [base,light,dark]=m.colors;
 const sh=m.depthShoulder,wa=m.depthWaist,back=310-sh*.64,front=310+sh*.92;
 const wback=310-wa*.74,wfront=310+wa*.93;
 const contour='M'+f(back)+' 284Q'+f(310-sh*.9)+' 266 '+f(front-13)+' 285Q'+f(front+8)+' 307 '+f(front+9)+' 329Q'+f(front+5)+' 350 '+f(wfront)+' 379Q'+f(wfront+15)+' 411 '+f(wfront+7)+' 449Q'+f(wfront+12)+' 469 337 483Q310 490 282 474Q'+f(wback-7)+' 436 '+f(wback)+' 395Q'+f(back-15)+' 351 '+f(back-3)+' 310Z';
 let o=P(contour,'url(#v78body)',dark,4.2);
 o+=L('M'+f(back+8)+' 302Q'+f(front-10)+' 319 '+f(front-3)+' 351Q'+f(front-9)+' 375 '+f(wfront)+' 392',light,2.0,.38);
 o+=L('M'+f(back)+' 317Q'+f(back-6)+' 397 '+f(wback+5)+' 444',dark,2,.38);
 o+='<defs><clipPath id="v79SideTorso"><path d="'+contour+'"/></clipPath></defs><g clip-path="url(#v79SideTorso)">';
 if(m.skin==='scales'||v.spriteTorso==='aquatic'||v.spriteTorso==='draconic'){
  for(let row=0;row<13*m.detail;row++)for(let col=0;col<5;col++){
   const x=280+col*16+(row%2)*7,y=301+row*12;
   o+=L('M'+x+' '+f(y)+'q7 11 15 0',light,1.25,.34)
  }
 }else if(m.skin==='bark'||v.spriteTorso==='arboreal')for(let i=0;i<18*m.detail;i++){
  const x=289+(i*17)%61,y=312+(i*23)%127;
  o+=L('M'+x+' '+y+'q'+(i%2?7:-5)+' 12 2 29',light,1.3,.41)
 }else if(m.skin==='spots'||v.spriteTorso==='alien')for(let i=0;i<14*m.detail;i++){
  const x=294+(i*17)%45,y=310+(i*31)%132;o+=dot(x,y,2.1,light,.35)
 }
 o+='</g>';
 return o
}
function viewPaint(markup,m){
 if(m.view!=='front')return markup;
 return markup.replace(/url\(#v78body\)/g,'url(#a76skin)')
              .replace(/url\(#v78edge\)/g,'url(#a76edge)')
              .replace(/url\(#v78fin\)/g,'url(#a76fin)');
}
function replaceGroups(root,v,m){
 const rig=root.querySelector('[data-vector-renderer]');if(!rig)return false;
 const side=m.view==='side';
 rig.setAttribute('data-anatomy-rig','v079');rig.setAttribute('data-rig-view',m.view);
 const oldArms=Array.from(rig.querySelectorAll('[data-vector-piece^="arm-"]'));
 const oldLegs=Array.from(rig.querySelectorAll('[data-vector-piece="legs"]'));
 const frontLower=rig.querySelector('[data-vector-piece="lower-body"]');
 const backTorso=rig.querySelector('[data-vector-piece="torso"]');
 const head=rig.querySelector('[data-vector-piece="head"]');
 oldArms.forEach(x=>x.remove());oldLegs.forEach(x=>x.remove());
 if(frontLower&&!m.hasTail)frontLower.remove();
 appendSVG(rig,viewPaint(arms(v,m),m),true);
 if(!m.hasTail)appendSVG(rig,viewPaint(legs(v,m),m),true);
 if(side&&backTorso)backTorso.innerHTML=sideTorso(v,m);
 if(head){
  appendSVG(head,viewPaint(horns(v,m),m),true);
  appendSVG(head,viewPaint(headAccents(v,m),m));
 }
 return true
}
creature=function(v){
 const out=previousCreature(v);
 if(!v?.spriteMode)return out;
 let doc;
 try{doc=new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 780">'+out+'</svg>','image/svg+xml')}
 catch(e){return out}
 const root=doc.documentElement;
 if(root.querySelector('parsererror'))return out;
 const m=model(v);
 try{if(!replaceGroups(root,v,m))return out;return root.innerHTML}catch(err){return out}
};
const meta=document.querySelector('#modular73 .m73note');
if(meta)meta.textContent='Три согласованных SVG-ракурса. Число рук и ног, рога, пропорции плеч и талии, глаза и кожа влияют на рисунок; все части создаются программно.';
const stageLabel=document.querySelector('.atlas76status');
if(stageLabel)stageLabel.textContent='Векторный рисунок · общий каркас · v0.7.9';
const previousRender=render;
render=function(sync=true){
 previousRender(sync);
 const status=document.getElementById('m73status');
 if(status&&s.spriteMode){const m=model(s);status.textContent='Каркас: '+m.arms+' рук, '+(m.hasTail?'рыбий хвост':m.legs+' ног')+', '+({front:'спереди',side:'сбоку',back:'сзади'}[m.view]);}
};
render();
window.AtlasAnatomy079={version:'0.7.9',getModel:()=>model(s),preview:()=>render(false)};
})();