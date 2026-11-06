/* Atlas of Living Worlds v0.7.2 — anatomical silhouettes.
 * Replaces the ORIGINAL procedural figure group, preserving terrain, specimen
 * frames, the v0.7.1 detail layer, editor, genetics, export and all views.
 * No rasterized creatures or fixed assets. */
(function(){
'use strict';
const previousCreature=creature;
const N=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(Number(v))?Number(v):a));
const F=n=>Math.round(Number(n)*10)/10;
const escAttr=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const path=(d,fill,stroke='#1b3643',w=3,opacity=1,extra='')=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round" opacity="'+opacity+'" '+extra+'/>';
const line=(d,c,w=2,opacity=.6)=>path(d,'none',c,w,opacity);
const spot=(x,y,r,color,opacity=.65)=>'<circle cx="'+F(x)+'" cy="'+F(y)+'" r="'+F(r)+'" fill="'+color+'" opacity="'+opacity+'"/>';
const spec=v=>({mermaid:{shoulder:.94,waist:.83,skull:1.02,chin:1.04,body:'athletic'},fairy:{shoulder:.79,waist:.78,skull:.93,chin:.78,body:'delicate'},alien:{shoulder:.83,waist:.89,skull:1.22,chin:.69,body:'elongate'},dragon:{shoulder:1.27,waist:1.09,skull:1.10,chin:1.26,body:'armored'},spirit:{shoulder:.92,waist:.82,skull:1.03,chin:1.10,body:'woodland'},custom:{shoulder:1,waist:1,skull:1,chin:1,body:'neutral'}}[v.k]||{shoulder:1,waist:1,skull:1,chin:1,body:'neutral'});
const A=v=>safeColor(v.accent||'#bce4d5'),C=v=>safeColor(v.color||'#77aab8');
function metrics(v){
 const p=spec(v),build=Number(v.build||40),shoulder=N(v.shoulderWidth,65,145),waist=N(v.waistWidth,65,145);
 const sw=(36+shoulder*.27)*p.shoulder*(1+(build-40)/550);
 const ww=(29+waist*.18)*p.waist*(1+(build-40)/950);
 const cy=158-N(v.neckLen,0,65)*.44;
 const hw=(48*N(v.headWidth,65,145)/100+(v.head==='wide'?11:0))*p.skull;
 const top=cy-(v.head==='long'?90:p.body==='elongate'?93:76);
 return {p,sw,ww,hw,cy,top,ch:cy+72*p.chin};
}
function gradients(v){
 const c=C(v),a=A(v);
 return '<defs id="atlas72defs">'+
 '<radialGradient id="atlas72flesh" cx="40%" cy="21%" r="89%"><stop stop-color="#e9fff9" stop-opacity=".84"/><stop offset=".19" stop-color="'+a+'" stop-opacity=".87"/><stop offset=".36" stop-color="'+c+'"/><stop offset=".73" stop-color="'+c+'"/><stop offset="1" stop-color="#143139"/></radialGradient>'+
 '<linearGradient id="atlas72edge" x1="0" x2="1" y1="0" y2=".25"><stop stop-color="#09222b"/><stop offset=".22" stop-color="'+c+'"/><stop offset=".5" stop-color="'+a+'"/><stop offset=".8" stop-color="'+c+'"/><stop offset="1" stop-color="#071e2d"/></linearGradient>'+
 '<linearGradient id="atlas72shine" x1=".1" x2="1" y1="0" y2="1"><stop stop-color="#f3fff7" stop-opacity=".72"/><stop offset=".34" stop-color="'+a+'" stop-opacity=".75"/><stop offset="1" stop-color="'+c+'" stop-opacity=".24"/></linearGradient>'+
 '<linearGradient id="atlas72membrane" x1="0" x2="1" y1="0" y2="1"><stop stop-color="'+a+'" stop-opacity=".72"/><stop offset=".48" stop-color="'+c+'" stop-opacity=".39"/><stop offset="1" stop-color="#243e58" stop-opacity=".76"/></linearGradient>'+
 '<radialGradient id="atlas72eye"><stop stop-color="#fcfff2"/><stop offset=".24" stop-color="'+a+'"/><stop offset=".8" stop-color="'+c+'"/><stop offset="1" stop-color="#042b36"/></radialGradient>'+
 '</defs>';
}
function wing(v,dir,m){
 const type=v.wings,a=A(v),x=310+dir*(m.sw*.83),out=[];
 if(type==='none')return '';
 const t=dir;
 if(type==='membrane'){
  out.push(path('M'+F(x)+' 308Q'+F(310+t*125)+' 217 '+F(310+t*223)+' 86L'+F(310+t*206)+' 223L'+F(310+t*271)+' 285L'+F(310+t*194)+' 306L'+F(310+t*225)+' 438L'+F(x)+' 382Z','url(#atlas72membrane)',a,3.4,.9));
  const pts=[[223,87],[206,224],[271,285],[225,437]];
  pts.forEach(([xx,yy],i)=>{
   out.push(line('M'+F(x)+' 342Q'+F(310+t*(120+i*8))+' '+F(223+i*24)+' '+F(310+t*xx)+' '+yy,a,2.5,.7));
  });
  for(let i=0;i<5;i++)out.push(line('M'+F(310+t*(141+i*12))+' '+(226+i*27)+'q'+(t*15)+' -8 '+(t*19)+' -2','#dbfff0',1.15,.29));
 }else if(type==='insect'){
  out.push(path('M'+F(x)+' 315Q'+F(310+t*177)+' 61 '+F(310+t*262)+' 134Q'+F(310+t*301)+' 226 '+F(310+t*131)+' 335Q'+F(310+t*277)+' 326 '+F(310+t*227)+' 467Q'+F(310+t*105)+' 476 '+F(x)+' 366Z','url(#atlas72membrane)',a,3,.83));
  for(let i=0;i<10;i++){
   const yy=143+i*30,xx=310+t*(220-(i>6?(i-6)*15:0));
   out.push(line('M'+F(x)+' 345Q'+F(310+t*(168+i*3))+' '+(200+i*14)+' '+F(xx)+' '+yy,a,1.35,.48));
  }
  [215,315,406].forEach((yy,i)=>out.push(path('M'+F(310+t*(195-i*13))+' '+yy+'q'+(t*20)+' -25 '+(t*34)+' 0q'+(-t*17)+' 24 '+(-t*34)+' 0Z','url(#atlas72shine)',a,1.2,.43)));
 }else{
  out.push(path('M'+F(x)+' 310Q'+F(310+t*133)+' 188 '+F(310+t*235)+' 98Q'+F(310+t*242)+' 221 '+F(310+t*207)+' 310Q'+F(310+t*264)+' 409 '+F(x)+' 384Z','url(#atlas72edge)',a,2.9,.8));
  for(let i=0;i<13;i++){
   const py=151+i*22,ex=310+t*(235+(i%3)*7-i*1.9);
   out.push(path('M'+F(x)+' '+(314+i*2)+'Q'+F(310+t*143)+' '+(py-51)+' '+F(ex)+' '+F(py)+'Q'+F(310+t*146)+' '+(py+60)+' '+F(x)+' '+(351+i*2)+'Z',i%2?'url(#atlas72shine)':'url(#atlas72membrane)',a,1.4,.65));
   out.push(line('M'+F(x)+' 340Q'+F(310+t*140)+' '+(py-20)+' '+F(ex)+' '+F(py),a,1.1,.4));
  }
 }
 return out.join('');
}
function tail(v,m){
 const a=A(v),t=v.tail;
 if(t==='none')return '';
 if(t==='fish'){
  let out=path('M'+F(310-m.ww*.94)+' 434Q245 522 277 606Q296 659 310 685Q328 657 344 601Q374 515 '+F(310+m.ww*.94)+' 434Z','url(#atlas72flesh)','#16343a',4.5);
  out+=path('M310 645Q251 691 135 722Q214 784 310 719Q404 784 485 722Q366 690 310 645Z','url(#atlas72membrane)',a,4.6,.98);
  out+=line('M310 478Q299 566 310 662','#eefff7',2.4,.34);
  for(let i=0;i<17;i++){
   const y=474+i*11;
   for(let j=-2;j<=2;j++)out+=line('M'+(310+j*13-8+(i%2)*6)+' '+y+'q8 11 17 0',a,1.2,.4);
  }
  for(let i=-9;i<=9;i++)out+=line('M310 676Q'+F(310+i*5)+' 702 '+(310+i*17)+' '+F(730+Math.sin(i*.4)*8),'#d7fff5',1.25,.44);
  if(v.features?.includes('fins'))for(const d of [-1,1]){
   out+=path('M'+(310+d*32)+' 500Q'+(310+d*95)+' 462 '+(310+d*103)+' 520L'+(310+d*31)+' 556Z','url(#atlas72membrane)',a,2.6,.73);
   for(let i=0;i<5;i++)out+=line('M'+(310+d*30)+' 523L'+F(310+d*(61+i*9))+' '+(510+i*6),a,1.6,.6);
  }
  return out;
 }
 if(t==='serpent'){
  let g=path('M'+F(310-m.ww*.84)+' 437Q251 521 271 580Q302 637 340 595Q360 562 334 548Q311 538 310 566Q342 536 365 580Q386 648 329 682Q286 707 279 661Q258 722 309 747Q386 747 407 669Q436 593 372 529Q354 493 '+F(310+m.ww*.84)+' 438Z','url(#atlas72flesh)','#143440',4.7);
  for(let i=0;i<23;i++)g+=line('M'+(289+(i%3)*12)+' '+(492+i*10)+'q11 10 19 0',a,1.4,.36);
  return g;
 }
 if(t==='reptile'){
  let g=path('M343 447Q439 465 467 523Q504 584 488 647Q475 691 555 649Q505 714 470 700Q422 665 428 602Q401 527 328 491Z','url(#atlas72edge)','#19333a',4.5);
  for(let i=0;i<12;i++){
   const x=363+i*10,y=471+i*13;
   g+=path('M'+x+' '+y+'l'+(14+i%3*2)+' -18l6 23Z','url(#atlas72shine)',a,1.2,.65);
  }
  return g;
 }
 if(t==='feather'){
  let g='';
  for(let i=0;i<11;i++)g+=path('M326 448Q'+(364+i*7)+' '+(488+i*12)+' '+(392+i*12)+' '+(608+i*9)+'Q'+(312+i*4)+' '+(578+i*6)+' 312 471Z',i%2?'url(#atlas72membrane)':'url(#atlas72shine)',a,1.4,.71);
  return g;
 }
 return '';
}
function leg(v,m,x,idx,total){
 const dir=x<310?-1:1,c=A(v),far=total===4&&(idx===0||idx===3),digit=v.k==='dragon',hoof=v.feet==='hooves'||v.k==='spirit',thin=v.k==='fairy';
 const w=(thin?12:digit?19:16)*(1+(N(v.build,0,100)-45)/400);
 const kneeX=x+(far?dir*9:dir*5),kneeY=digit?535:547,ankleX=digit?x-dir*4:x+dir*8,ankleY=661;
 let g='<g opacity="'+(far?.74:1)+'">';
 g+=path('M'+F(x-w)+' 443Q'+F(x-w-8)+' 495 '+F(kneeX-w*.8)+' '+kneeY+
 'Q'+F(kneeX-w*.7)+' '+(kneeY+15)+' '+F(kneeX-2)+' '+(kneeY+20)+'Q'+F(kneeX+w)+' '+(kneeY+12)+' '+F(kneeX+w*.75)+' '+kneeY+
 'Q'+F(x+w+9)+' 491 '+F(x+w)+' 443Z','url(#atlas72flesh)','#173c44',3.4);
 g+=spot(kneeX,kneeY+4,thin?6:9,'url(#atlas72shine)',.65);
 if(digit){
  const hockX=x+dir*20;
  g+=path('M'+F(kneeX-w*.62)+' '+(kneeY+13)+'Q'+F(hockX-w)+' 603 '+F(hockX-2)+' 614Q'+F(ankleX-18)+' 644 '+F(ankleX-12)+' '+ankleY+
  'L'+F(ankleX+14)+' '+ankleY+'Q'+F(hockX+16)+' 615 '+F(hockX+7)+' 602Q'+F(kneeX+w*.68)+' '+(kneeY+9)+' '+F(kneeX-w*.62)+' '+(kneeY+13)+'Z','url(#atlas72edge)','#17323f',3.4);
  g+=line('M'+F(kneeX)+' '+(kneeY+28)+'Q'+F(hockX+5)+' 597 '+F(hockX)+' 615','#e0fff0',1.6,.27);
 }else{
  g+=path('M'+F(kneeX-w*.7)+' '+(kneeY+14)+'Q'+F(ankleX-20)+' 609 '+F(ankleX-13)+' '+ankleY+
  'L'+F(ankleX+14)+' '+ankleY+'Q'+F(ankleX+23)+' 609 '+F(kneeX+w*.7)+' '+(kneeY+15)+'Z','url(#atlas72edge)','#123844',3.3);
  g+=line('M'+F(kneeX-5)+' '+(kneeY+27)+'Q'+F(ankleX-13)+' 610 '+F(ankleX-5)+' 647','#e5fff2',1.5,.29);
 }
 if(hoof){
  g+=path('M'+F(ankleX-15)+' 658L'+F(ankleX-25)+' 689L'+F(ankleX+23)+' 688L'+F(ankleX+16)+' 656Z','#24313b',c,2.5);
  g+=line('M'+F(ankleX)+' 670l-2 19','#b6d2cb',1.9,.6);
 }else if(v.feet==='webbed'){
  g+=path('M'+F(ankleX-12)+' 660Q'+F(ankleX-40)+' 683 '+F(ankleX-44)+' 702Q'+F(ankleX-15)+' 715 '+F(ankleX+39)+' 697L'+F(ankleX+13)+' 660Z','url(#atlas72membrane)',c,2.9);
  for(let k=-2;k<=2;k++)g+=line('M'+ankleX+' 664l'+(k*13)+' 32',c,1.2,.6);
 }else{
  g+=path('M'+F(ankleX-13)+' 657Q'+F(ankleX-34)+' 681 '+F(ankleX-28)+' 690Q'+F(ankleX+4)+' 700 '+F(ankleX+31)+' 687L'+F(ankleX+13)+' 657Z','url(#atlas72flesh)','#173c44',2.7);
  for(let k=-1;k<=2;k++){
   g+=line('M'+F(ankleX-18+k*10)+' 689l'+(k*2+2)+' -7',c,1.4,.54);
   if(v.feet==='claws'||digit)g+=path('M'+F(ankleX-17+k*10)+' 685l8 0l'+(k*2)+' 11Z','#e0f7d9',c,.9,.85);
  }
 }
 return g+'</g>';
}
function limbs(v,m,back=false){
 if(v.tail==='fish'||v.tail==='serpent'||Number(v.legs)===0)return '';
 const n=Number(v.legs);
 const centers=n===4?[250,284,336,370]:[310-m.ww*.65,310+m.ww*.65];
 return centers.map((x,i)=>leg(v,m,F(x),i,centers.length)).join('');
}
function arm(v,m,side,layer){
 const a=A(v),sw=m.sw,dir=side,p=layer,thin=v.k==='fairy',thick=v.k==='dragon',w=(thin?10:thick?20:15)*(1+N(v.build,0,100)/430);
 const sx=310+dir*(sw-5+p*10),sy=292+p*66,L=N(v.armLength,65,140)/100;
 const elbowX=310+dir*(sw+43+p*16),elbowY=sy+75*L;
 const wristX=310+dir*(sw+62+p*22),wristY=sy+151*L;
 let g=path('M'+F(sx-dir*w)+' '+sy+'Q'+F(sx+dir*(w+12))+' '+(sy-12)+' '+F(elbowX+dir*w)+' '+(elbowY-7)+
 'Q'+F(elbowX+dir*(w+5))+' '+(elbowY+15)+' '+F(elbowX-dir*4)+' '+(elbowY+19)+
 'Q'+F(sx-dir*(w+18))+' '+(sy+42)+' '+F(sx-dir*w)+' '+sy+'Z','url(#atlas72flesh)','#183a43',3.3);
 g+=spot(elbowX,elbowY+4,thick?11:8,'url(#atlas72shine)',.53);
 g+=path('M'+F(elbowX-dir*(w*.6))+' '+(elbowY+12)+'Q'+F(wristX-dir*(w+5))+' '+(wristY-12)+' '+F(wristX-dir*w*.56)+' '+wristY+
 'Q'+F(wristX+dir*(w*.68))+' '+(wristY+11)+' '+F(wristX+dir*w*.9)+' '+(wristY-9)+
 'Q'+F(elbowX+dir*w*.7)+' '+(elbowY+5)+' '+F(elbowX-dir*w*.6)+' '+(elbowY+12)+'Z','url(#atlas72edge)','#17323f',3.2);
 g+=line('M'+F(sx+dir*w*.4)+' '+(sy+13)+'Q'+F(elbowX+dir*(w*.4))+' '+(elbowY-9)+' '+F(elbowX)+' '+(elbowY-1),'#dffff4',1.7,.28);
 const handX=wristX,hy=wristY+7;
 if(v.hands==='pincers'){
  g+=path('M'+F(handX-dir*12)+' '+hy+'Q'+F(handX+dir*31)+' '+(hy-4)+' '+F(handX+dir*34)+' '+(hy+27)+'Q'+F(handX+dir*19)+' '+(hy+20)+' '+F(handX+dir*14)+' '+(hy+12)+'Q'+F(handX+dir*22)+' '+(hy+37)+' '+F(handX-dir*16)+' '+(hy+36)+'Z','url(#atlas72shine)',a,3);
 }else if(v.hands==='webbed'){
  g+=path('M'+F(handX-15)+' '+hy+'Q'+F(handX-41)+' '+(hy+19)+' '+F(handX-32)+' '+(hy+36)+'Q'+handX+' '+(hy+45)+' '+F(handX+31)+' '+(hy+34)+'Q'+F(handX+41)+' '+(hy+14)+' '+F(handX+14)+' '+hy+'Z','url(#atlas72membrane)',a,2.6);
  for(let k=-2;k<=2;k++)g+=line('M'+handX+' '+(hy+2)+'l'+(k*12)+' 31',a,1.2,.46);
 }else{
  g+=path('M'+F(handX-14)+' '+hy+'Q'+F(handX-21)+' '+(hy+22)+' '+F(handX-9)+' '+(hy+31)+'L'+F(handX+14)+' '+(hy+29)+'Q'+F(handX+23)+' '+(hy+15)+' '+F(handX+12)+' '+hy+'Z','url(#atlas72flesh)','#173b44',2.5);
  for(let k=-1;k<=2;k++){
   const xx=handX-11+k*8;
   g+=path('M'+F(xx-3)+' '+(hy+23)+'q-2 13 5 '+(v.hands==='claws'?22:14)+'q7 -4 4 -'+(v.hands==='claws'?22:15)+'Z','url(#atlas72edge)',a,1.5,.87);
   if(v.hands==='claws'||v.k==='dragon')g+=path('M'+F(xx)+' '+(hy+(v.hands==='claws'?42:39))+'l7 12l-12 -2Z','#eefce1',a,1.0,.85);
  }
 }
 return g
}
function arms(v,m){
 const pairs=Math.max(0,Math.min(2,Number(v.arms)/2)),out=[];
 for(let p=pairs-1;p>=0;p--)for(const d of [-1,1])out.push(arm(v,m,d,p));
 return out.join('')
}
function torso(v,m){
 const sw=m.sw,wa=m.ww,a=A(v),upper=273,build=N(v.build,0,100);
 const l=310-sw,r=310+sw,w1=310-wa,w2=310+wa;
 let d='M'+F(l)+' 277Q310 '+(m.p.body==='armored'?250:257)+' '+F(r)+' 277'+
  'Q'+F(r+18)+' 304 '+F(r+3)+' 350Q'+F(w2+13)+' 387 '+F(w2+12)+' 415'+
  'Q'+F(w2+23)+' 447 348 467Q310 487 272 467Q'+F(w1-23)+' 447 '+F(w1-12)+' 415'+
  'Q'+F(w1-13)+' 387 '+F(l-3)+' 350Q'+F(l-18)+' 304 '+F(l)+' 277Z';
 let g=path(d,'url(#atlas72flesh)','#173947',4.2);
 g+=line('M'+F(l+14)+' 298Q'+F(310-sw*.4)+' 311 310 328Q'+F(310+sw*.4)+' 311 '+F(r-14)+' 298',a,2,.41);
 if(m.p.body==='armored'){
  for(let row=0;row<4;row++){
   const y=305+row*31,half=sw*.70-row*5;
   g+=path('M'+F(310-half)+' '+y+'Q310 '+(y-19)+' '+F(310+half)+' '+y+'Q310 '+(y+19)+' '+F(310-half)+' '+y+'Z','url(#atlas72shine)',a,1.6,.64);
   g+=line('M310 '+(y-12)+'v24','#17333c',2,.42);
  }
 }else if(m.p.body==='delicate'){
  g+=line('M'+F(310-sw*.68)+' 316Q310 344 '+F(310+sw*.68)+' 316',a,1.5,.32);
  g+=line('M310 334Q305 383 310 438','#f1fff7',1.5,.28);
 }else{
  g+=line('M'+F(310-sw*.65)+' 334Q310 357 '+F(310+sw*.65)+' 334',a,2,.36);
  if(build>45){
   g+=line('M286 361q-7 16 2 30M334 361q7 16 -2 30',a,2.5,.44);
  }
  g+=line('M'+F(310-wa*.65)+' 409Q310 423 '+F(310+wa*.65)+' 409',a,1.5,.34);
 }
 if(v.skin==='bark'||v.k==='spirit')for(let i=0;i<9;i++){
  const x=310-sw*.55+(i*19)%(sw*1.1),y=295+(i*27)%125;
  g+=line('M'+F(x)+' '+y+'q'+(i%2?6:-6)+' 12 '+(i%2?3:-3)+' 27',a,1.5,.42);
 }
 if(v.skin==='scales'||v.markings==='scales'){
  for(let row=0;row<8;row++)for(let j=-2;j<=2;j++){
   const x=310+j*(sw*.21)+(row%2)*7,y=317+row*15;
   g+=line('M'+F(x-9)+' '+y+'q9 12 18 0',a,1.05,.37)
  }
 }
 if(v.k==='alien')for(let i=0;i<8;i++)g+=spot(287+i%4*15,309+Math.floor(i/4)*72,3,'url(#atlas72eye)',.59);
 if(v.glow>20){
  for(let i=0;i<Math.round(N(v.glow,0,100)/15);i++)g+=spot(310+(i%2?1:-1)*((i*17)%47),321+i*20,3,'url(#atlas72eye)',.46);
 }
 return g
}
function neck(v,m){
 const cy=m.cy,len=N(v.neckLen,0,65),nw=m.p.body==='armored'?28:20;
 const y0=cy+55,y1=281,a=A(v);
 let d='M'+F(310-nw)+' '+y1+'Q'+F(310-nw*.9)+' '+F((y1+y0)/2)+' '+F(310-nw*.57)+' '+F(y0)+
 'L'+F(310+nw*.57)+' '+F(y0)+'Q'+F(310+nw*.9)+' '+F((y1+y0)/2)+' '+F(310+nw)+' '+y1+'Z';
 let g=path(d,'url(#atlas72edge)','#183842',3.4);
 g+=line('M310 '+(cy+72)+'Q307 '+(cy+99)+' 310 273','#eafff2',1.4,.27);
 if(v.k==='dragon'||v.k==='mermaid')for(let i=0;i<4;i++)g+=line('M'+(310-nw*.62)+' '+(cy+83+i*11)+'q'+F(nw*.62)+' 7 '+F(nw*1.24)+' 0',a,1.5,.38);
 return g
}
function ears(v,m){
 const a=A(v),w=m.hw,y=m.cy,t=v.ears;
 if(t==='none')return '';
 let g='';
 for(const dir of [-1,1]){
  const x=310+dir*w;
  if(t==='point'){
   g+=path('M'+F(x-dir*3)+' '+F(y+3)+'Q'+F(x+dir*34)+' '+F(y-29)+' '+F(x+dir*57)+' '+F(y-54)+'Q'+F(x+dir*46)+' '+F(y+14)+' '+F(x+dir*4)+' '+F(y+41)+'Z','url(#atlas72edge)',a,2.5);
   g+=line('M'+F(x+dir*4)+' '+F(y+15)+'Q'+F(x+dir*32)+' '+F(y-22)+' '+F(x+dir*46)+' '+F(y-38),a,1.6,.5)
  }else if(t==='fin'){
   g+=path('M'+x+' '+F(y+5)+'Q'+F(x+dir*41)+' '+F(y-31)+' '+F(x+dir*72)+' '+F(y-6)+'L'+F(x+dir*38)+' '+F(y+42)+'Z','url(#atlas72membrane)',a,3);
   for(let i=0;i<5;i++)g+=line('M'+x+' '+F(y+12)+'L'+F(x+dir*(38+i*7))+' '+F(y-15+i*10),a,1.2,.46)
  }else{
   for(let i=0;i<4;i++)g+=path('M'+x+' '+F(y+i*10)+'Q'+F(x+dir*51)+' '+F(y-37+i*5)+' '+F(x+dir*(62-i*8))+' '+F(y-10+i*13)+'Z','url(#atlas72shine)',a,1.5,.82)
  }
 }
 return g
}
function horns(v,m){
 const t=v.horns;if(t==='none')return '';
 const a=A(v),cy=m.cy,top=m.top;
 let g='';
 if(t==='single'){
  g+=path('M296 '+F(top+30)+'Q294 '+F(top-29)+' 314 '+F(top-65)+'Q328 '+F(top-10)+' 325 '+F(top+30)+'Z','url(#atlas72shine)',a,2.4);
 }else for(const dir of [-1,1]){
  const x=310+dir*m.hw*.51;
  g+=path('M'+F(x-dir*12)+' '+F(top+38)+'Q'+F(x+dir*7)+' '+F(top-29)+' '+F(x+dir*48)+' '+F(top-71)+
  'Q'+F(x+dir*42)+' '+F(top+13)+' '+F(x+dir*15)+' '+F(top+42)+'Z','url(#atlas72edge)',a,2.8);
  if(t==='antlers')for(let i=0;i<4;i++)g+=line('M'+F(x+dir*(23+i*2))+' '+F(top-11-i*12)+'q'+(dir*34)+' -'+(17+i*7)+' '+(dir*41)+' -'+(29+i*10),a,5,.83);
 }
 return g
}
function head(v,m){
 const a=A(v),c=C(v),cy=m.cy,hw=m.hw,ch=m.ch,top=m.top,back=v.view==='back',side=v.view==='side';
 if(side)return sideHead(v,m);
 const dragon=v.k==='dragon',fae=v.k==='fairy',alien=v.k==='alien',water=v.k==='mermaid',spirit=v.k==='spirit';
 let g=ears(v,m);
 let d;
 if(dragon||v.head==='spike'){
  d='M310 '+F(top)+'Q'+F(310-hw*.82)+' '+F(top-4)+' '+F(310-hw)+' '+F(cy-32)+
    'L'+F(310-hw*1.09)+' '+F(cy+6)+'Q'+F(310-hw*1.02)+' '+F(cy+48)+' '+F(310-hw*.49)+' '+F(cy+55)+
    'L'+F(310-hw*.52)+' '+F(ch-2)+'Q310 '+F(ch+12)+' '+F(310+hw*.52)+' '+F(ch-2)+
    'L'+F(310+hw*.49)+' '+F(cy+55)+'Q'+F(310+hw*1.02)+' '+F(cy+48)+' '+F(310+hw*1.09)+' '+F(cy+6)+
    'L'+F(310+hw)+' '+F(cy-32)+'Q'+F(310+hw*.82)+' '+F(top-4)+' 310 '+F(top)+'Z';
 }else if(alien||v.head==='wide'){
  d='M310 '+F(top-9)+'C'+F(310-hw*1.38)+' '+F(top-13)+' '+F(310-hw*1.50)+' '+F(cy-10)+' '+F(310-hw*.88)+' '+F(cy+24)+
    'Q'+F(310-hw*.68)+' '+F(cy+66)+' 310 '+F(ch+1)+'Q'+F(310+hw*.68)+' '+F(cy+66)+' '+F(310+hw*.88)+' '+F(cy+24)+
    'C'+F(310+hw*1.50)+' '+F(cy-10)+' '+F(310+hw*1.38)+' '+F(top-13)+' 310 '+F(top-9)+'Z';
 }else if(fae){
  d='M310 '+F(top)+'Q'+F(310-hw*1.06)+' '+F(top+12)+' '+F(310-hw*.90)+' '+F(cy+11)+
    'Q'+F(310-hw*.82)+' '+F(cy+52)+' 310 '+F(ch+6)+'Q'+F(310+hw*.82)+' '+F(cy+52)+' '+F(310+hw*.90)+' '+F(cy+11)+
    'Q'+F(310+hw*1.06)+' '+F(top+12)+' 310 '+F(top)+'Z';
 }else if(water){
  d='M310 '+F(top)+'Q'+F(310-hw*1.07)+' '+F(top+1)+' '+F(310-hw*.98)+' '+F(cy+18)+
   'Q'+F(310-hw*.98)+' '+F(cy+62)+' 310 '+F(ch+2)+'Q'+F(310+hw*.98)+' '+F(cy+62)+' '+F(310+hw*.98)+' '+F(cy+18)+
   'Q'+F(310+hw*1.07)+' '+F(top+1)+' 310 '+F(top)+'Z';
 }else{
  d='M310 '+F(top)+'Q'+F(310-hw*1.14)+' '+F(top+11)+' '+F(310-hw)+' '+F(cy+16)+
   'Q'+F(310-hw*.91)+' '+F(cy+59)+' 310 '+F(ch)+'Q'+F(310+hw*.91)+' '+F(cy+59)+' '+F(310+hw)+' '+F(cy+16)+
   'Q'+F(310+hw*1.14)+' '+F(top+11)+' 310 '+F(top)+'Z';
 }
 g+=path(d,'url(#atlas72flesh)','#153846',4.4);
 g+=path('M310 '+F(top+14)+'Q'+F(310-hw*.4)+' '+F(top+12)+' '+F(310-hw*.65)+' '+F(cy-18)+'Q310 '+F(cy-39)+' '+F(310+hw*.65)+' '+F(cy-18)+'Q'+F(310+hw*.4)+' '+F(top+12)+' 310 '+F(top+14)+'Z','url(#atlas72shine)',a,1,.20);
 if(v.head==='spike'||dragon)for(let i=-2;i<=2;i++){
  const x=310+i*hw*.26;
  g+=path('M'+F(x-7)+' '+F(top+17)+'l6 -'+(28+(2-Math.abs(i))*6)+'l12 29Z','url(#atlas72shine)',a,1.9,.86);
 }
 g+=horns(v,m);
 if(back){
  g+=line('M310 '+F(top+18)+'Q303 '+F(cy-16)+' 310 '+F(ch-8),a,2,.42);
  for(let i=0;i<5;i++)g+=line('M'+(286+i*12)+' '+F(cy+17)+'q6 18 13 0',a,1.4,.38);
  return g;
 }
 const count=Number(v.eyeCount)||2;
 const xs=count===1?[310]:count===4?[310-hw*.62,310-hw*.25,310+hw*.25,310+hw*.62]:[310-hw*.42,310+hw*.42];
 for(let i=0;i<xs.length;i++){
  const x=xs[i],y=cy-8+(count===4?(i%2)*16:0),rx=count===4?7:v.eyes==='large'?15:dragon?11:alien?15:10;
  g+=path('M'+F(x-rx-5)+' '+F(y)+'Q'+F(x)+' '+F(y-rx*.85)+' '+F(x+rx+5)+' '+F(y)+
   'Q'+F(x)+' '+F(y+rx*.75)+' '+F(x-rx-5)+' '+F(y)+'Z',v.eyes==='blank'?'url(#atlas72eye)':'#e9f6e9','#143a40',2.1);
  if(v.eyes!=='blank'){
   const slit=v.eyes==='slit'||dragon;
   g+='<ellipse cx="'+F(x)+'" cy="'+F(y)+'" rx="'+(slit?2.8:5)+'" ry="'+(slit?rx*.68:5.4)+'" fill="#163645"/>';
   g+=spot(x-2,y-3,2.15,'#fff',.84);
  }
  g+=line('M'+F(x-rx-8)+' '+F(y-rx*.90)+'Q'+F(x)+' '+F(y-rx*1.28)+' '+F(x+rx+6)+' '+F(y-rx*.85),a,2.1,.48);
 }
 if(dragon||v.mouth==='fangs'){
  g+=path('M'+F(310-hw*.36)+' '+F(cy+28)+'Q310 '+F(cy+16)+' '+F(310+hw*.36)+' '+F(cy+28)+
   'L'+F(310+hw*.29)+' '+F(cy+54)+'Q310 '+F(cy+78)+' '+F(310-hw*.29)+' '+F(cy+54)+'Z','url(#atlas72edge)','#193840',2.8,.9);
  g+=line('M'+F(310-hw*.24)+' '+F(cy+56)+'Q310 '+F(cy+67)+' '+F(310+hw*.24)+' '+F(cy+56),a,1.4,.54);
  for(const sign of [-1,1])for(let j=0;j<2;j++){
   const x=310+sign*(hw*.19+j*hw*.13);
   g+=path('M'+F(x-4)+' '+F(cy+52)+'l8 0l-4 '+(10+j*5)+'Z','#e6fae8',a,1.1,.91);
  }
 }else if(v.mouth==='beak'||v.head==='beak'){
  g+=path('M294 '+F(cy+36)+'Q310 '+F(cy+28)+' 326 '+F(cy+36)+'L310 '+F(cy+82)+'Z','url(#atlas72shine)','#274148',2.3);
 }else{
  g+=line('M'+F(310-hw*.24)+' '+F(cy+49)+'Q310 '+F(cy+56)+' '+F(310+hw*.24)+' '+F(cy+49),'#1b4044',2.5,.77);
  g+=line('M310 '+F(cy+16)+'q-6 12 0 19q6 5 11 0',a,1.5,.32);
 }
 if(v.mouth==='mandible')for(const sign of [-1,1])
  g+=path('M'+F(310+sign*hw*.34)+' '+F(cy+32)+'Q'+F(310+sign*hw*.9)+' '+F(cy+61)+' '+F(310+sign*hw*.22)+' '+F(cy+74),'none',a,4.2,.8);
 if(v.features?.includes('gills')||water)for(const sign of [-1,1])for(let i=0;i<5;i++)
  g+=line('M'+F(310+sign*hw*.83)+' '+F(cy+5+i*10)+'l'+F(sign*14)+' -5',a,2.2,.48);
 if(spirit||v.skin==='bark')for(let i=0;i<8;i++)
  g+=line('M'+F(310-hw*.55+i*hw*.16)+' '+F(cy-44)+'q'+(i%2?-6:6)+' 17 1 28',a,1.5,.36);
 if(fae){
  for(const sign of [-1,1])g+=line('M'+F(310+sign*hw*.73)+' '+F(cy-19)+'q'+F(sign*16)+' -17 '+F(sign*23)+' -19',a,1.7,.39);
 }
 if(alien)for(let i=0;i<9;i++)g+=spot(310+(i%2?1:-1)*(hw*.43+i%3*5),cy+18+i*5,2.2,'url(#atlas72eye)',.5);
 return g;
}
function sideHead(v,m){
 const a=A(v),cy=m.cy,top=m.top,hw=m.hw,dragon=v.k==='dragon',fae=v.k==='fairy',alien=v.k==='alien';
 const tip=dragon?423:alien?402:fae?378:395;
 let g='';
 const d='M300 '+F(top)+'Q'+F(270-hw*.38)+' '+F(top+4)+' '+F(266-hw*.32)+' '+F(cy-10)+
 'Q'+F(268-hw*.20)+' '+F(cy+37)+' 310 '+F(cy+69)+
 'Q348 '+F(cy+65)+' '+F(tip-24)+' '+F(cy+34)+'L'+F(tip)+' '+F(cy+26)+
 'Q'+F(tip-15)+' '+F(cy+3)+' '+F(tip-38)+' '+F(cy+2)+'Q'+F(tip-39)+' '+F(top+12)+' 300 '+F(top)+'Z';
 g+=path(d,'url(#atlas72flesh)','#153846',4.4);
 if(v.ears!=='none')g+=path('M289 '+F(cy+9)+'Q'+F(264-hw*.14)+' '+F(cy-31)+' '+F(262-hw*.10)+' '+F(cy-42)+'Q261 '+F(cy+25)+' 293 '+F(cy+36)+'Z',v.ears==='fin'?'url(#atlas72membrane)':'url(#atlas72shine)',a,2.4);
 g+=spot(344,cy-11,v.eyes==='large'?16:12,v.eyes==='blank'?'url(#atlas72eye)':'#eaf5e2',.9);
 if(v.eyes!=='blank')g+=spot(348,cy-12,dragon?3:5,'#20383d',.94);
 g+=line('M333 '+F(cy-26)+'q15 -10 28 0',a,2,.61);
 g+=line('M'+(tip-33)+' '+F(cy+40)+'q16 6 25 -5','#25434a',2.4,.69);
 if(dragon)for(let i=0;i<3;i++)g+=path('M'+(tip-63+i*9)+' '+F(cy+33)+'l9 3l-4 12Z','#e7fbe3',a,1.0);
 if(v.features?.includes('gills'))for(let i=0;i<4;i++)g+=line('M285 '+F(cy+8+i*12)+'l-13 7',a,2.1,.63);
 if(v.horns==='pair'||v.horns==='antlers')g+=path('M278 '+F(top+21)+'Q260 '+F(top-27)+' 279 '+F(top-71)+'Q298 '+F(top-12)+' 300 '+F(top+24)+'Z','url(#atlas72edge)',a,2.8);
 if(v.horns==='single')g+=path('M315 '+F(top+13)+'Q303 '+F(top-47)+' 324 '+F(top-68)+'Q338 '+F(top-6)+' 336 '+F(top+12)+'Z','url(#atlas72shine)',a,2.4);
 return g;
}
function figure(v){
 const m=metrics(v),sz=N(v.size,60,190),scale=N(sz/110,.58,1.65);
 let g=gradients(v)+'<g transform="translate(310 392) scale('+F(scale)+') translate(-310 -392)" data-anatomy="v072">';
 if(v.wings!=='none')g+=wing(v,-1,m)+wing(v,1,m);
 g+=tail(v,m);
 if(v.tail!=='fish'&&v.tail!=='serpent')g+=limbs(v,m);
 // Two visibly articulated joints per arm; arm count is respected.
 g+=arms(v,m);
 g+=torso(v,m);
 g+=neck(v,m);
 g+=head(v,m);
 if(v.view==='back'&&v.spine!=='none')for(let i=0;i<8;i++){
  const y=300+i*38;
  g+=path('M310 '+y+'q-27 -18 -15 17l20 9Z','url(#atlas72shine)',A(v),1.8,.55);
 }
 // Small anatomical high-lights remain attached to the figure, not the environment.
 if(v.glow>55)for(let i=0;i<12;i++){
  const x=280+(i*37)%62,y=300+(i*53)%155;
  g+=spot(x,y,1.5+i%3,'url(#atlas72eye)',.39);
 }
 return g+'</g>';
}
function replacedFigure(svg,newFigure){
 const marker='<g transform="translate(310 392) scale(';
 const start=svg.indexOf(marker);
 if(start<0)return null;
 const re=/<\/?g(?:\s[^>]*?)?>/g;
 re.lastIndex=start;
 let depth=0,found=false,end=-1,match;
 while((match=re.exec(svg))){
  if(match.index===start)found=true;
  if(!found)continue;
  if(match[0].startsWith('</g'))depth--;
  else depth++;
  if(depth===0){end=re.lastIndex;break}
 }
 return end>=0?svg.slice(0,start)+newFigure+svg.slice(end):null
}
creature=function(v){
 const old=previousCreature(v);
 const updated=replacedFigure(old,figure(v));
 return updated||old;
};
const oldRender=render;
render=function(sync=true){
 oldRender(sync);
 const art=document.getElementById('art');
 if(art)art.setAttribute('aria-label','Обновлённая анатомическая форма существа: '+s.name+', '+(s.view||'front'));
};
render();
})();