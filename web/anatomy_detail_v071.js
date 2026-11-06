/* Atlas v0.7.1 — procedural anatomy enhancement. No premade character pictures. */
(function(){
'use strict';
const priorCreature=creature,priorClean=clean,priorRender=render;
let comparing=false;
const safe=(x,a,b)=>Math.max(a,Math.min(b,Number(x)||a));
const f=x=>Number(x).toFixed(1);
const A=v=>safeColor(v.accent||'#cee4d2');
const line=(d,c,w=1.5,o=.5)=>'<path d="'+d+'" stroke="'+c+'" stroke-width="'+w+'" opacity="'+o+'" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
const circ=(x,y,r,col,o=.5)=>'<circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(r)+'" fill="'+col+'" opacity="'+o+'"/>';
const shape=(d,fill,stroke,opacity=.5)=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1.2" opacity="'+opacity+'"/>';
function head(v){
 const w=49*safe(v.headWidth,65,145)/100+(v.head==='wide'?13:0);
 const cy=159-safe(v.neckLen,0,65)*.44,top=cy-(v.head==='long'?88:75),end=cy+72;
 return {cy,w,d:'M310 '+f(top)+'Q'+f(295-w)+' '+f(top+8)+' '+f(310-w)+' '+f(cy+13)+'Q'+f(313-w)+' '+f(end-13)+' 310 '+f(end)+'Q'+f(307+w)+' '+f(end-13)+' '+f(310+w)+' '+f(cy+13)+'Q'+f(325+w)+' '+f(top+8)+' 310 '+f(top)+'Z'};
}
function torso(v){
 const s=42+safe(v.shoulderWidth,65,145)*.21,w=26+safe(v.waistWidth,65,145)*.17;
 return 'M'+f(310-s)+' 273Q310 253 '+f(310+s)+' 273Q'+f(320+s)+' 333 '+f(310+w)+' 391Q'+f(300+w)+' 420 362 454Q310 473 258 454Q'+f(320-w)+' 420 '+f(310-w)+' 391Q'+f(300-s)+' 333 '+f(310-s)+' 273Z';
}
function overlay(v){
 const amount=comparing?0:safe(v.detailLevel??85,0,100)/100;if(amount===0)return '';
 const accent=A(v),base=safeColor(v.color),h=head(v),side=v.view==='side';
 let out='<defs><linearGradient id="atlasDetailShade" x1="0" x2="1"><stop stop-color="#061421" stop-opacity=".60"/><stop offset=".24" stop-color="'+base+'" stop-opacity=".10"/><stop offset=".52" stop-color="#f7fff2" stop-opacity=".26"/><stop offset=".84" stop-color="'+base+'" stop-opacity=".04"/><stop offset="1" stop-color="#04101d" stop-opacity=".62"/></linearGradient>'+
 '<linearGradient id="atlasDetailPlate" x1="0" x2=".75" y1="0" y2="1"><stop stop-color="#f0fff7" stop-opacity=".7"/><stop offset=".29" stop-color="'+accent+'" stop-opacity=".65"/><stop offset=".75" stop-color="'+base+'" stop-opacity=".18"/><stop offset="1" stop-color="#08212a" stop-opacity=".69"/></linearGradient>'+
 '<clipPath id="atlasDetailHead"><path d="'+h.d+'"/></clipPath><clipPath id="atlasDetailTorso"><path d="'+torso(v)+'"/></clipPath>'+
 '<clipPath id="atlasDetailFin"><path d="M263 444Q246 522 282 593Q299 640 310 675Q326 637 341 594Q376 517 357 444Z"/></clipPath></defs>';
 out+='<g transform="translate(310 392) scale('+f(safe(v.size/110,.58,1.65))+') translate(-310 -392)" pointer-events="none" opacity="'+f(.40+amount*.60)+'">';
 if(v.wings!=='none'){
  for(const dir of [-1,1]){
   const sx=310+dir*69;
   for(let i=0;i<Math.round(5+amount*9);i++){
    const x=310+dir*(118+i*8),y=171+i*22;
    out+=line('M'+sx+' 326Q'+f(310+dir*153)+' '+f(y-44)+' '+f(x)+' '+f(y),accent,1.15,.24+amount*.22)
   }
   if(v.wings==='insect')for(let i=0;i<4;i++)out+=shape('M'+f(310+dir*178)+' '+(192+i*60)+'q'+(dir*15)+' -14 '+(dir*22)+' 1q'+(-dir*15)+' 22 '+(-dir*22)+' -1Z','none',accent,.35);
   if(v.wings==='feather')for(let i=0;i<8;i++)out+=line('M'+f(310+dir*(164+i*5))+' '+f(180+i*22)+'l'+(dir*13)+' 9',accent,1.2,.40)
  }
 }
 if(v.tail==='fish'){
  out+='<g clip-path="url(#atlasDetailFin)"><path d="M263 444Q246 522 282 593Q299 640 310 675Q326 637 341 594Q376 517 357 444Z" fill="url(#atlasDetailShade)" opacity=".7"/>';
  for(let i=0;i<Math.round(12+amount*12);i++){
   const y=465+i*8.4,spread=30-Math.max(0,i-13)*1.15;
   if(y>670)break;
   for(let j=-2;j<=2;j++){
    const x=310+j*12+(i%2)*6;if(Math.abs(x-310)>spread+10)continue;
    out+=shape('M'+f(x-8)+' '+f(y)+'q8 11 16 0q-8 3 -16 0Z','url(#atlasDetailPlate)',accent,.37+amount*.24)
   }
  }
  out+='</g>';
  for(let i=-9;i<=9;i++)out+=line('M310 676Q'+(310+i*7)+' 702 '+(310+i*14)+' '+f(721+10*Math.sin(i*.5)),accent,i%4?1:1.8,.39);
 }else if(v.tail==='reptile')for(let i=0;i<12;i++)out+=line('M'+(359+i*11)+' '+(481+i*15)+'q14 -7 20 -2',accent,1.7,.34);
 else if(v.tail==='serpent')for(let i=0;i<13;i++)out+=line('M'+(284+i%2*19)+' '+(480+i*11)+'q9 8 17 0',accent,1.6,.38);
 else if(v.tail==='feather')for(let i=0;i<8;i++)out+=line('M331 478Q'+(364+i*6)+' 536 '+(402+i*10)+' '+(620+i*8),accent,1.3,.32);
 if(side){
  out+=line('M289 289Q318 360 299 433','#ecfff7',2.2,.33);
  for(let i=0;i<10;i++)out+=v.skin==='scales'?line('M'+(295+i%3*14)+' '+(293+i*14)+'q9 10 17 0',accent,1.5,.47):circ(306+i%3*9,299+i*14,2.2,accent,.35);
  const cy=151-safe(v.neckLen,0,65)*.44;
  out+=line('M324 '+f(cy-34)+'Q344 '+f(cy-46)+' 363 '+f(cy-30),accent,2.5,.45);
  out+=line('M363 '+f(cy+38)+'q-6 12 -19 14',accent,1.7,.43);
 }else{
  out+='<g clip-path="url(#atlasDetailTorso)"><path d="'+torso(v)+'" fill="url(#atlasDetailShade)" opacity=".77"/>';
  out+=line('M267 302Q285 319 307 337',accent,1.7,.39)+line('M353 302Q335 319 313 337',accent,1.7,.39);
  out+=line('M310 336Q302 374 310 428','#e4fff5',1.6,.27);
  if(v.build>60){out+=line('M290 348q-8 22 -1 36',accent,2,.35)+line('M331 348q8 22 1 36',accent,2,.35)}
  const rows=Math.round(8+amount*10);
  for(let row=0;row<rows;row++)for(let j=-3;j<=3;j++){
   const xx=310+j*17+(row%2)*8,yy=296+row*10;
   if(yy>457)continue;
   if(v.skin==='scales'||v.markings==='scales'||v.k==='dragon')out+=shape('M'+f(xx-9)+' '+f(yy)+'q9 12 18 0q-9 4 -18 0Z','url(#atlasDetailPlate)',accent,.27+amount*.19);
   else if(v.skin==='bark')out+=((row+j)%2===0?line('M'+f(xx)+' '+f(yy)+'q-5 14 3 22',accent,2,.34):'');
   else if(v.skin==='stripes')out+=((row+j)%3===0?line('M'+f(xx)+' '+f(yy)+'q8 14 -4 25',accent,3,.28):'');
   else if(v.skin==='spots'||v.markings==='dots')out+=((row+j)%3===0?circ(xx,yy,2.5,accent,.39):'');
   else if(v.markings==='runes')out+=((row+j)%4===0?shape('M'+xx+' '+yy+'l5 -7l5 7l-5 8Z','none',accent,.35):'');
  }
  if(v.k==='dragon'||v.armor>75)for(let k=0;k<4;k++){
   const y=296+k*34;out+=shape('M'+(276+k*5)+' '+y+'Q310 '+(y-13)+' '+(344-k*5)+' '+y+'Q310 '+(y+21)+' '+(276+k*5)+' '+y+'Z','url(#atlasDetailPlate)',accent,.47);
  }
  if(v.k==='spirit')for(let k=0;k<8;k++){
   const x=278+(k*17)%61,y=292+(k*29)%130;
   out+=line('M'+x+' '+y+'q'+(k%2?6:-6)+' 28 4 46',accent,1.5,.40)
  }
  if(v.k==='alien')for(let k=0;k<12;k++)out+=shape('M'+(280+k%5*14)+' '+(310+Math.floor(k/5)*44)+'l6 -8l5 8l-5 9Z','none',accent,.29);
  out+='</g>';
  out+='<g clip-path="url(#atlasDetailHead)"><path d="'+h.d+'" fill="url(#atlasDetailShade)" opacity=".68"/>';
  if(v.view==='front'){
   const eyes=Number(v.eyeCount)===1?[310]:Number(v.eyeCount)===4?[310-h.w*.52,310-h.w*.21,310+h.w*.21,310+h.w*.52]:[310-h.w*.37,310+h.w*.37];
   for(let i=0;i<eyes.length;i++){
    const x=eyes[i],y=h.cy-5+(eyes.length===4?i%2*17:0),r=eyes.length===4?7:v.eyes==='large'?13:10;
    out+=line('M'+f(x-r-3)+' '+f(y-11)+'Q'+f(x)+' '+f(y-17)+' '+f(x+r+3)+' '+f(y-10),accent,1.8,.58);
    out+=circ(x-r*.33,y-r*.31,1.7,'#fff',.66)
   }
   out+=line('M310 '+f(h.cy+6)+'q-5 12 -2 18q3 4 8 0','#17383d',1.8,.44);
   out+=line('M'+f(310-h.w*.26)+' '+f(h.cy+54)+'Q310 '+f(h.cy+63)+' '+f(310+h.w*.26)+' '+f(h.cy+54),accent,1.6,.43);
   if(v.features.includes('gills')||v.k==='mermaid')for(const d of [-1,1])for(let i=0;i<4;i++)out+=line('M'+f(310+d*h.w*.73)+' '+f(h.cy+13+i*10)+'l'+(d*11)+' -4',accent,1.7,.56);
   if(v.k==='alien')for(let i=0;i<7;i++)out+=circ(283+i*9,h.cy-44+i%2*6,2.1,accent,.4);
   if(v.k==='spirit')for(let i=0;i<6;i++)out+=line('M'+(288+i*9)+' '+f(h.cy-49)+'q4 18 -3 27',accent,1.2,.36);
  }else out+=line('M310 '+f(h.cy-60)+'Q304 '+f(h.cy-2)+' 310 '+f(h.cy+56),accent,2,.43);
  out+='</g>';
 }
 for(let i=0;i<Number(v.arms)/2;i++)for(const d of [-1,1]){
  const sx=310+d*(51+i*15),ex=310+d*(111+i*20),y=279+i*64,fy=y+110*safe(v.armLength,65,140)/100+24;
  out+=line('M'+f(sx+d*5)+' '+(y+18)+'Q'+f(sx+d*42)+' '+(y+62)+' '+f(ex-d*10)+' '+f(fy-20),'#f0fff4',1.7,.26)
 }
 if(v.tail!=='fish'&&v.tail!=='serpent')for(const x of Number(v.legs)===4?[247,283,337,373]:Number(v.legs)===2?[280,340]:[])
  out+=line('M'+(x-7)+' 482Q'+(x-13)+' 555 '+(x-6)+' 620','#f1fff6',1.6,.29);
 return out+'</g>'
}
creature=function(v){
 const base=priorCreature(v),part=overlay(v);
 if(base.includes('id="plateBg"')){
  const i=base.indexOf('<path d="M22 22h65');
  if(i>=0)return base.slice(0,i)+part+base.slice(i)
 }
 return base+part
};
clean=function(o){const x=priorClean(o);x.detailLevel=safe(o?.detailLevel??85,0,100);return x};
const stage=document.getElementById('stage');
const control=document.createElement('div');control.id='detail71';
control.innerHTML='<div class="detail71top"><label for="detail71slider">Проработка анатомии</label><output id="detail71out">85%</output></div><div class="detail71row"><input type="range" min="0" max="100" step="5" id="detail71slider" value="85"><button type="button" id="detail71compare">Сравнить</button></div><p>Прорисовка лица, текстуры покровов, пластин, плавников и крыльев.</p>';
const css=document.createElement('style');
css.textContent=['#detail71{margin:8px 0 16px;padding:13px;border:1px solid var(--ui-gold-deep,#8c7750);border-radius:10px;background:var(--ui-card,#19353c)}',
'#detail71 .detail71top,#detail71 .detail71row{display:flex;align-items:center;gap:9px}',
'#detail71 .detail71top{justify-content:space-between;margin-bottom:8px}',
'#detail71 label{font:600 15px Georgia,serif;color:var(--ui-gold,#ecd399)}',
'#detail71 output{color:var(--ui-accent,#a3e3d3)}',
'#detail71 input{flex:1;min-width:0;accent-color:var(--ui-gold,#e8c47c)}',
'#detail71 button{padding:7px 10px;border-color:var(--ui-gold-deep,#8c7750)}',
'#detail71 button[aria-pressed=true]{color:var(--ui-gold,#e8c47c);border-color:var(--ui-gold,#e8c47c)}',
'#detail71 p{font-size:11px;line-height:1.4;color:var(--ui-muted,#adbec3);margin:8px 0 0}'].join('\n');
document.head.append(css);if(stage)stage.parentNode.insertBefore(control,stage);
const slide=document.getElementById('detail71slider'),output=document.getElementById('detail71out'),button=document.getElementById('detail71compare');
render=function(sync=true){
 if(s.detailLevel==null)s.detailLevel=85;
 priorRender(sync);
 slide.value=comparing?0:s.detailLevel;output.textContent=Math.round(comparing?0:s.detailLevel)+'%';
 button.setAttribute('aria-pressed',String(comparing));
 button.textContent=comparing?'Вернуть детали':'Сравнить';
 try{localStorage.setItem('atlas_draft_v071',JSON.stringify(s))}catch(e){}
};
slide.oninput=()=>{comparing=false;s.detailLevel=Number(slide.value);render(false)};
button.onclick=()=>{comparing=!comparing;render(false)};
const originalSave=document.getElementById('save').onclick;
document.getElementById('save').onclick=()=>{
 if(comparing){comparing=false;render(false)}
 originalSave()
};
try{const draft=JSON.parse(localStorage.getItem('atlas_draft_v071')||'null');if(valid(draft))s=clean(draft)}catch(e){}
render();
})();