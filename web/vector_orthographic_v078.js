/* Atlas v0.7.8: three independent views, procedurally drawn SVG anatomy.
   No character pictures. All features depend on editor data. */
(function(){
'use strict';
const prev=creature;
const F=x=>Math.round(Number(x)*10)/10;
const cap=(x,a,b,d=a)=>Math.max(a,Math.min(b,Number.isFinite(Number(x))?Number(x):d));
const P=(d,fill,stroke='#193745',w=2.8,o=1)=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round" opacity="'+o+'"/>';
const L=(d,c,w=1.4,o=.5)=>P(d,'none',c,w,o);
const E=(x,y,rx,ry,fill,o=1)=>'<ellipse cx="'+F(x)+'" cy="'+F(y)+'" rx="'+F(rx)+'" ry="'+F(ry)+'" fill="'+fill+'" opacity="'+o+'"/>';
const D=(x,y,r,fill,o=.7)=>'<circle cx="'+F(x)+'" cy="'+F(y)+'" r="'+F(r)+'" fill="'+fill+'" opacity="'+o+'"/>';
const R={
 humanoid:[1,1,1,1],aquatic:[.91,.85,1.06,1.06],fae:[.75,.75,.91,1.13],
 draconic:[1.35,1.24,1.14,1.05],alien:[.76,.81,1.3,1.28],arboreal:[1.05,.9,1.08,1.12]
};
const PALETTE={
 humanoid:['#b99585','#f2d4bb','#60494a'],aquatic:['#398e9c','#bdf5ea','#1f5368'],
 fae:['#b29acb','#ebd5ff','#645477'],draconic:['#ae6559','#f1c795','#5d3e48'],
 alien:['#8b93c6','#d6e6ff','#4c507d'],arboreal:['#5b906b','#d6e8a8','#354f45']
};
function palette(v){const c=PALETTE[v.spriteTorso]||PALETTE.humanoid;return v.spriteCustomColor?[safeColor(v.color),safeColor(v.accent),c[2]]:c}
function dims(v){const r=R[v.spriteTorso]||R.humanoid,b=(cap(v.build,0,100,40)-40)/450;
 return {r,sh:52*cap(v.shoulderWidth,65,145,100)/100*r[0]*(1+b),
 waist:38*cap(v.waistWidth,65,145,100)/100*r[1]*(1+b*.55),
 head:cap(v.headWidth,65,145,100)/100*r[2],arm:cap(v.armLength,65,140,100)/100*r[3],
 neck:cap(v.neckLen,0,65,18)/65,scale:cap(v.size,60,190,110)/110,
 detail:cap(v.detailLevel,0,100,85)/100}
}
function defs(v){
 const [c,a,b]=palette(v);
 return '<defs id="atlas78">'+
 '<radialGradient id="v78body" cx=".35" cy=".18" r=".92"><stop stop-color="#f9fff5"/><stop offset=".2" stop-color="'+a+'"/><stop offset=".56" stop-color="'+c+'"/><stop offset=".88" stop-color="'+c+'"/><stop offset="1" stop-color="'+b+'"/></radialGradient>'+
 '<linearGradient id="v78edge" x1="0" x2="1" y1="0" y2=".3"><stop stop-color="'+b+'"/><stop offset=".27" stop-color="'+c+'"/><stop offset=".61" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></linearGradient>'+
 '<linearGradient id="v78fin" x1="0" x2="1" y1="0" y2="1"><stop stop-color="'+a+'" stop-opacity=".87"/><stop offset=".5" stop-color="'+c+'" stop-opacity=".58"/><stop offset="1" stop-color="'+b+'" stop-opacity=".32"/></linearGradient>'+
 '<radialGradient id="v78halo"><stop stop-color="'+a+'" stop-opacity=".31"/><stop offset="1" stop-color="'+c+'" stop-opacity="0"/></radialGradient>'+
 '</defs>';
}
function wing(v,m,side){
 if(!v.wings||v.wings==='none')return '';
 const a=palette(v)[1];let g='<g data-vector-piece="wings">';
 const signs=side?[1]:[-1,1];
 for(const s of signs){const x=310+s*m.sh*.8;
  if(v.wings==='insect'){
   g+=P('M'+F(x)+' 315Q'+(310+s*184)+' 72 '+(310+s*257)+' 124Q'+(310+s*287)+' 238 '+(310+s*138)+' 344Q'+(310+s*245)+' 399 '+F(x)+' 384Z','url(#v78fin)',a,2.7,.78)
  }else{
   g+=P('M'+F(x)+' 314Q'+(310+s*154)+' 171 '+(310+s*231)+' 104L'+(310+s*208)+' 227L'+(310+s*265)+' 290L'+(310+s*180)+' 339L'+(310+s*205)+' 417L'+F(x)+' 383Z','url(#v78fin)',a,2.9,.79)
  }
  for(let i=0;i<5;i++)g+=L('M'+F(x)+' 344Q'+(310+s*132)+' '+(207+i*28)+' '+(310+s*(206+i*7))+' '+(134+i*57),a,1.3,.4)
 }
 return g+'</g>';
}
function fish(v,m,side){
 const [c,a,b]=palette(v);let o='<g data-vector-piece="lower-body">';
 if(side){
  o+=P('M300 452Q277 513 329 551Q390 586 386 619Q382 647 345 653Q311 656 304 626Q312 673 350 681Q433 676 428 625Q422 576 374 548Q333 507 350 463Z','url(#v78body)',b,4);
  o+=P('M363 632Q413 641 491 610Q476 669 446 689Q486 708 523 727Q465 760 407 705Q378 691 351 676Z','url(#v78fin)',a,3.6,.92);
  for(let i=0;i<17*m.detail;i++)o+=L('M'+F(304+i*4)+' '+F(479+i*9)+'q11 12 20 0',a,1.2,.35)
 }else{
  o+=P('M'+F(310-m.waist*.85)+' 456Q250 530 280 605Q298 666 310 678Q326 661 342 604Q366 526 '+F(310+m.waist*.85)+' 456Z','url(#v78body)',b,4);
  o+=P('M310 654Q245 688 162 720Q231 768 310 727Q389 771 456 720Q370 686 310 654Z','url(#v78fin)',a,3.8,.95);
  for(let i=0;i<16*m.detail;i++)for(let j=-2;j<=2;j++){
   let x=310+j*13+i%2*7,y=470+i*10;
   o+=L('M'+(x-8)+' '+F(y)+'q8 12 17 0',a,1.15,.38)
  }
 }
 for(let i=-9;i<=9;i++)o+=L('M310 670Q'+(310+i*6)+' 692 '+(310+i*15)+' '+F(720+Math.sin(i*.5)*9),a,1.1,.35);
 return o+'</g>'
}
function tail(v,side){
 const t=v.tail;if(t==='none'||!t||t==='fish')return '';
 const [c,a,b]=palette(v);let o='<g data-vector-piece="tail">';
 if(t==='reptile'){
  o+=side?P('M328 466Q400 464 451 545Q478 598 532 578Q509 649 463 626Q420 600 395 551Q359 506 327 492Z','url(#v78edge)',b,3.5,.9):
   P('M303 458Q349 496 391 564Q429 650 491 626Q455 699 412 657Q357 603 330 553Q307 496 290 468Z','url(#v78edge)',b,3.7,.9);
  for(let i=0;i<12;i++)o+=L('M'+(356+i*10)+' '+(494+i*9)+'q13 -7 22 0',a,1.3,.32)
 }else if(t==='serpent'){
  o+=P(side?'M320 457Q396 492 423 561Q442 622 398 658Q366 676 338 646Q372 674 405 636Q424 573 367 530Q333 505 320 457Z':
   'M302 458Q260 520 274 588Q301 648 353 616Q375 596 342 581Q397 591 381 630Q358 676 306 641Q252 603 260 544Q268 486 302 458Z','url(#v78edge)',b,3.5,.91)
 }else if(t==='feather')for(let i=0;i<9;i++){
  const dx=side?371+i*12:276+i*10;
  o+=P('M312 457Q'+(side?362+i*5:270+i*6)+' '+(536+i*12)+' '+dx+' '+(617+i*10)+'Q'+(side?343+i*2:308+i*3)+' '+(565+i*6)+' 312 457Z','url(#v78fin)',a,1.4,.63)
 }
 return o+'</g>'
}
function legs(v,m,side){
 const [c,a,b]=palette(v);
 const pts=side?[289,327]:[310-m.waist*.66,310+m.waist*.66];
 let g='<g data-vector-piece="legs">';
 pts.forEach((x,i)=>{
  const op=side&&i===0?.66:1,dx=side?12:0;
  g+='<g opacity="'+op+'">';
  g+=P('M'+F(x-16)+' 459Q'+F(x-27)+' 518 '+F(x-17+dx)+' 561Q'+F(x-9+dx)+' 581 '+F(x+12+dx)+' 564Q'+F(x+23+dx)+' 513 '+F(x+18)+' 459Z','url(#v78body)',b,3.2);
  g+=E(x+dx,566,12,12,'url(#v78edge)',.58);
  g+=P('M'+F(x-11+dx)+' 578Q'+F(x-16+dx)+' 629 '+F(x-12+dx)+' 666Q'+F(x+3+dx)+' 683 '+F(x+14+dx)+' 669Q'+F(x+20+dx)+' 629 '+F(x+12+dx)+' 578Z','url(#v78edge)',b,2.9);
  g+=P('M'+F(x-14+dx)+' 662Q'+F(x-30+dx)+' 679 '+F(x-29+dx)+' 696Q'+F(x+2+dx)+' 710 '+F(x+28+dx)+' 694L'+F(x+16+dx)+' 662Z','url(#v78body)',b,2.4);
  if(v.feet==='claws')for(let j=-1;j<=1;j++)g+=P('M'+F(x+dx+j*12)+' 697l7 10l-8 -2Z','#eff8e2',a,1,.84);
  g+='</g>'
 });
 return g+'</g>'
}
function arm(v,m,side,far){
 const [c,a,b]=palette(v),A=m.arm,w=v.spriteArms==='strong'?19:13;
 let g='<g data-vector-piece="arm-'+(side?(far?'far':'near'):(far?'left':'right'))+'" opacity="'+(far&&side?.64:1)+'"';
 const px=side?(far?288:329):310+(far?-1:1)*m.sh*.83;
 const angle=v.vectorPose==='swim'?(side?-35:far?-26:26):v.vectorPose==='display'?(side?-16:far?-20:20):(side?0:far?-5:5);
 g+=' transform="translate('+F(px)+' '+(side?306:291)+') rotate('+angle+') scale('+(side?1:far?-1:1)+' '+F(A)+')">';
 g+=P('M-12 -9Q14 -13 23 20Q40 56 32 76Q26 94 15 86Q-1 62 -12 -9Z','url(#v78body)',b,3.1);
 g+=E(20,78,11,12,'url(#v78edge)',.58);
 g+=P('M15 79Q30 75 34 92Q47 124 46 155Q44 170 30 172Q22 156 20 130Q14 94 15 79Z','url(#v78edge)',b,2.8);
 g+=L('M0 11Q17 42 23 68Q34 115 34 149',a,1.8,.34);
 g+=P('M26 158Q20 171 27 185Q33 199 45 191Q54 179 43 161Z','url(#v78body)',b,2.4);
 for(let j=0;j<4;j++)g+=P('M'+(28+j*5)+' 182q-2 13 3 19q6 0 6 -16Z','url(#v78edge)',a,1.2,.93);
 if(v.spriteArms==='finned')g+=P('M21 111Q54 101 68 122L38 148Z','url(#v78fin)',a,2,.77);
 return g+'</g>'
}
function torso(v,m,side){
 const [c,a,b]=palette(v);let o='<g data-vector-piece="torso">';
 if(side){
  const extra=v.spriteTorso==='draconic'?13:v.spriteTorso==='fae'?-8:0;
  const d='M302 270Q'+(335+extra)+' 266 '+(348+extra)+' 301Q'+(368+extra)+' 335 '+(357+extra)+' 389Q330 419 351 465Q323 487 292 465Q279 424 285 385Q275 320 285 291Z';
  o+=P(d,'url(#v78body)',b,4.2);
  o+=L('M298 290Q'+(343+extra)+' 306 '+(341+extra)+' 341Q'+(338+extra)+' 368 324 387',a,2.3,.4);
  o+=L('M288 311Q281 393 299 442',b,3,.41);
 }else{
  const sh=m.sh,wa=m.waist;
  const d='M'+F(310-sh)+' 275Q310 251 '+F(310+sh)+' 275Q'+F(320+sh)+' 309 '+F(310+sh*.82)+' 350Q'+F(316+wa)+' 385 '+F(310+wa)+' 426Q'+F(322+wa)+' 459 349 481Q310 500 271 481Q'+F(298-wa)+' 459 '+F(310-wa)+' 426Q'+F(304-wa)+' 385 '+F(310-sh*.82)+' 350Q'+F(300-sh)+' 309 '+F(310-sh)+' 275Z';
  o+=P(d,'url(#v78body)',b,4.3);
  o+=L('M310 294Q303 361 310 449',a,2.5,.52);
  o+=L('M'+F(310-sh*.81)+' 302Q280 321 301 354M'+F(310+sh*.81)+' 302Q340 321 319 354',a,2,.45);
 }
 const kind=v.spriteTorso;
 if(kind==='aquatic'||kind==='draconic'||v.skin==='scales'){
  for(let row=0;row<13*m.detail;row++)for(let j=(side?0:-3);j<=(side?3:3);j++){
   const xx=(side?292:310)+j*15+(row%2)*7,yy=310+row*12;
   o+=L('M'+F(xx-9)+' '+F(yy)+'q9 12 18 0',a,1.3,.39);
  }
 }else if(kind==='arboreal'){
  for(let j=0;j<20*m.detail;j++){
   const x=(side?295:274)+(j*17)%(side?49:75),y=302+(j*29)%144;
   o+=L('M'+x+' '+y+'q'+(j%2?7:-6)+' 14 2 29',b,1.5,.4)
  }
 }else if(kind==='fae'){
  for(let j=0;j<20*m.detail;j++)o+=D((side?298:282)+(j*13)%(side?45:60),311+(j*27)%134,1.8,'url(#v78halo)',.85)
 }else if(kind==='alien'){
  for(let j=0;j<18*m.detail;j++){const x=(side?300:281)+(j*17)%(side?41:62),y=311+(j*29)%132;o+=P('M'+x+' '+y+'l5 -8l5 8l-5 9Z','none',a,1.1,.38)}
 }
 return o+'</g>'
}
function head(v,m,side){
 const [c,a,b]=palette(v),dragon=v.spriteHead==='dragon',water=v.spriteHead==='aquatic',y=242-m.neck*33;
 let g='<g data-vector-piece="head" transform="translate('+(side?310:310)+' '+F(y)+') scale('+F(m.head)+' 1)">';
 if(side){
  const nose=dragon?110:water?93:80;
  if(dragon)g+=P('M-20 -140Q-60 -209 -12 -229L17 -156Z','url(#v78edge)',a,2.8,.91);
  else if(water)g+=P('M-35 -108Q-91 -161 -105 -82Q-95 -36 -31 -47Z','url(#v78fin)',a,2.4,.79);
  else g+=P('M-45 -105Q-91 -165 -106 -190Q-101 -108 -54 -51Z','url(#v78edge)',a,2.1,.8);
  g+=P('M-17 -17Q-66 -45 -63 -98Q-64 -154 -19 -175Q40 -192 69 -142Q85 -105 '+nose+' -86Q'+(nose+7)+' -66 '+(nose-14)+' -52Q73 -22 48 -14Q12 6 -17 -17Z','url(#v78body)',b,4);
  g+=P('M44 -116Q64 -129 79 -106Q68 -90 45 -100Z','#ebf8e8',b,1.9);
  g+=E(64,-106,4,7,'#1d4250',.96)+D(62,-109,2,'#fff',.9);
  g+=L('M45 -124Q66 -138 82 -119',a,2.5,.63);
  if(dragon){
   g+=P('M61 -41Q84 -48 '+nose+' -54Q'+(nose+8)+' -18 63 -14Z','url(#v78edge)',b,2.4,.9);
   for(let i=0;i<3;i++)g+=P('M'+(77+i*9)+' -22l5 0l-3 11Z','#f2fbea',a,.8,.86)
  }else g+=L('M60 -36Q76 -26 '+(nose-5)+' -36',b,2.2,.67);
  if(water)for(let i=0;i<4;i++)g+=L('M-24 '+(-62+i*12)+'q-14 5 -18 20',a,1.5,.52);
 }else{
  if(dragon)for(let s of [-1,1])g+=P('M'+(s*34)+' -139Q'+(s*48)+' -215 '+(s*78)+' -221Q'+(s*55)+' -151 '+(s*35)+' -111Z','url(#v78edge)',a,2.7,.88);
  else if(water)for(let s of [-1,1])g+=P('M'+(s*38)+' -104Q'+(s*89)+' -158 '+(s*106)+' -147Q'+(s*93)+' -97 '+(s*44)+' -41Z','url(#v78fin)',a,2.4,.76);
  else for(let s of [-1,1])g+=P('M'+(s*42)+' -110Q'+(s*95)+' -174 '+(s*103)+' -188Q'+(s*100)+' -102 '+(s*45)+' -53Z','url(#v78edge)',a,2.5,.82);
  g+=P('M0 -181Q-67 -178 -66 -125Q-67 -78 -49 -38Q-30 1 0 11Q30 1 49 -38Q67 -78 66 -125Q67 -178 0 -181Z','url(#v78body)',b,4.4);
  g+=L('M0 -164Q-13 -96 0 -17',a,2.5,.37);
  for(let i=0;i<9*m.detail;i++)g+=L('M-45 '+(-162+i*15)+'Q0 '+(-148+i*15)+' 45 '+(-162+i*15),a,1.5,.33);
 }
 g+=P('M-15 -10Q-17 20 -13 31Q0 41 13 31Q17 20 15 -10Z','url(#v78edge)',b,2,.82);
 return g+'</g>'
}
function side(v){
 const m=dims(v),[c,a,b]=palette(v);
 let o=defs(v)+E(310,390,200,275,'url(#v78halo)',.5);
 o+='<g data-vector-renderer="v078" data-view="side" transform="translate(310 392) scale('+F(m.scale)+') translate(-310 -392)">';
 o+=wing(v,m,true)+tail(v,true);
 if(v.spriteLower==='tail')o+=fish(v,m,true);else o+=legs(v,m,true);
 o+=arm(v,m,true,true)+torso(v,m,true);
 o+=P('M298 278Q302 252 289 '+(218-m.neck*19)+'L321 '+(218-m.neck*19)+'Q325 258 330 283Z','url(#v78body)',b,2.7);
 o+=head(v,m,true)+arm(v,m,true,false);
 o+='</g>';return o
}
function back(v){
 const m=dims(v),[c,a,b]=palette(v);
 let o=defs(v)+E(310,390,200,275,'url(#v78halo)',.5);
 o+='<g data-vector-renderer="v078" data-view="back" transform="translate(310 392) scale('+F(m.scale)+') translate(-310 -392)">';
 o+=wing(v,m,false)+tail(v,false);
 o+=v.spriteLower==='tail'?fish(v,m,false):legs(v,m,false);
 o+=arm(v,m,false,true)+arm(v,m,false,false);
 o+=torso(v,m,false);
 o+=P('M293 279Q299 254 298 '+(220-m.neck*21)+'L322 '+(220-m.neck*21)+'Q318 254 327 279Z','url(#v78body)',b,2.7);
 o+=head(v,m,false);
 o+='</g>';return o
}
function front(v,svg){
 const r=(R[v.spriteTorso]||R.humanoid),ratio=r[0],headRatio=r[2]/Math.sqrt(ratio);
 let doc;
 try{doc=new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">'+svg+'</svg>','image/svg+xml')}
 catch(e){return svg}
 const root=doc.documentElement,rig=root.querySelector('[data-vector-renderer="v076"]');
 if(!rig||root.querySelector('parsererror'))return svg;
 if(Math.abs(ratio-1)>.02){
  const tf=rig.getAttribute('transform')||'';
  rig.setAttribute('transform','translate(310 390) scale('+F(ratio)+' 1) translate(-310 -390) '+tf)
 }
 const h=rig.querySelector('[data-vector-piece="head"]');
 if(h&&Math.abs(headRatio-1)>.03)h.setAttribute('transform',(h.getAttribute('transform')||'')+' scale('+F(headRatio)+' 1)');
 return root.innerHTML
}
creature=function(v){
 if(v&&v.spriteMode){
  if(v.view==='side')return side(v);
  if(v.view==='back')return back(v);
  return front(v,prev(v))
 }
 return prev(v)
};
const style=document.createElement('style');
style.textContent='body[data-modular="true"] #stage #art{width:100%!important;height:100%!important;max-height:100%!important;max-width:100%!important;display:block!important;overflow:visible!important}';
document.head.appendChild(style);
const prior=render;
render=function(sync=true){
 prior(sync);
 document.body.setAttribute('data-modular',String(!!s.spriteMode));
 const label=document.getElementById('m73status');
 if(label&&s.spriteMode)label.textContent='Полностью векторная анатомия · '+({front:'спереди',side:'сбоку',back:'сзади'}[s.view]||'спереди');
 const art=document.getElementById('art');
 if(art&&s.spriteMode)art.setAttribute('aria-label','SVG вид '+s.view+' — '+s.name)
};
const hint=document.querySelector('#modular73 .m73note');
if(hint)hint.textContent='Персонажи программно рисуются в трёх ракурсах. Все виды реагируют на изменение частей и пропорций, без растровых изображений.';
const badge=document.querySelector('.atlas76status');
if(badge)badge.textContent='SVG-персонаж · 3 ракурса · v0.7.8';
render();
window.AtlasThreeView={version:'0.7.8',views:['front','side','back'],render:()=>render(false)};
})();