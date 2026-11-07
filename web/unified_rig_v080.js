/* Atlas Living Worlds 0.8.3 — unified procedural 3D landmark rig / 2D SVG renderer.
 * One skeleton for front / side / back. All artwork is SVG; no bitmaps or
 * third-party rendering dependencies. Compatible with catalog v0.6–v0.7.9.
 */
(function(){
'use strict';
const oldCreature=creature,oldRender=render;
const N=(n,lo,hi,def=lo)=>{const v=Number(n);return Math.max(lo,Math.min(hi,Number.isFinite(v)?v:def))};
const F=n=>Math.round(n*100)/100;
const css='#atlas-v80-profile{font-size:11px;color:var(--ui-muted,#aac2c0);margin:6px 0}';
const SKINS={
 humanoid:['#ad897c','#f1d7bd','#60474d'],
 aquatic:['#327f95','#b0f5e5','#194b60'],
 fae:['#b295c8','#f5dcf7','#695181'],
 draconic:['#a8584c','#efbd87','#583849'],
 alien:['#7584af','#d6e7f1','#374878'],
 arboreal:['#5c8562','#dce7af','#365448']
};
const RACES={
 humanoid:{shoulder:1,waist:1,depth:1,head:1,neck:1,leg:1},
 aquatic:{shoulder:.95,waist:.85,depth:.86,head:.94,neck:1.05,leg:1.02},
 fae:{shoulder:.78,waist:.78,depth:.76,head:.88,neck:1.18,leg:1.12},
 draconic:{shoulder:1.33,waist:1.14,depth:1.22,head:1.1,neck:.9,leg:.96},
 alien:{shoulder:.78,waist:.83,depth:.82,head:1.23,neck:1.3,leg:1.06},
 arboreal:{shoulder:1.02,waist:.94,depth:1.04,head:1.02,neck:1.08,leg:.98}
};
const sPath=(d,fill,stroke='none',width=1,opacity=1,extra='')=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+F(width)+'" stroke-linecap="round" stroke-linejoin="round" opacity="'+opacity+'" '+extra+'/>';
const ln=(d,color,width=1,opacity=.5)=>sPath(d,'none',color,width,opacity);
const ellipse=(x,y,rx,ry,fill,opacity=1)=>'<ellipse cx="'+F(x)+'" cy="'+F(y)+'" rx="'+F(rx)+'" ry="'+F(ry)+'" fill="'+fill+'" opacity="'+opacity+'"/>';
const circle=(x,y,r,fill,opacity=1)=>'<circle cx="'+F(x)+'" cy="'+F(y)+'" r="'+F(r)+'" fill="'+fill+'" opacity="'+opacity+'"/>';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
function rig(v){
 const race=RACES[v.spriteTorso]||RACES.humanoid;
 const body=N(v.build,0,100,45);
 const bulk=1+(body-45)/340;
 const sw=53*race.shoulder*N(v.shoulderWidth,65,145,100)/100*bulk;
 const hw=47*race.head*N(v.headWidth,65,145,100)/100;
 const wa=37*race.waist*N(v.waistWidth,65,145,100)/100*(1+(body-45)/650);
 const hip=wa*(v.spriteTorso==='draconic'?1.12:v.spriteTorso==='fae'?1.04:1.19);
 const depth=43*race.depth*(.92+body/640);
 const neck=17*race.neck+N(v.neckLen,0,65,18)*.26;
 const legLen=race.leg, armLen=N(v.armLength,65,140,100)/100;
 const arms=[0,2,4].includes(+v.arms)?+v.arms:2,legs=[0,2,4].includes(+v.legs)?+v.legs:2;
 const tail=v.spriteLower==='tail';
 const view=['front','side','back'].includes(v.view)?v.view:'front';
 const col=SKINS[v.spriteTorso]||SKINS.humanoid;
 const colors=v.spriteCustomColor?[safeColor(v.color||col[0]),safeColor(v.accent||col[1]),col[2]]:col;
 const headType=v.spriteHead||'elven';
 const headCenter={x:0,y:193-neck*.30,z:2};
 const neckJoint={x:0,y:250-neck*.3,z:0};
 const shoulderY=292+neck*.10,hipY=470;
 const marks={
  head:headCenter,neck:neckJoint,chest:{x:0,y:323,z:0},waist:{x:0,y:404,z:0},pelvis:{x:0,y:hipY,z:0},
  leftShoulder:{x:-sw,y:shoulderY,z:0},rightShoulder:{x:sw,y:shoulderY,z:0},
  leftHip:{x:-hip*.65,y:hipY,z:0},rightHip:{x:hip*.65,y:hipY,z:0}
 };
 for(const sign of [-1,1])for(let pair=0;pair<arms/2;pair++){
  const key=(sign<0?'left':'right')+pair;
  const y=shoulderY+pair*62;
  const x=sign*(sw-(pair?sw*.22:0));
  const z=sign*depth*.87 + (pair?sign*8:0);
  const pose=v.vectorPose==='swim'?-35:v.vectorPose==='display'?39:8;
  const ex=x+sign*(v.spriteTorso==='draconic'?45:34+pose*.38)*armLen;
  const ey=y+(pose<0?49:91)*armLen;
  const wx=ex+sign*(15+(pose>20?20:0))*armLen, wy=ey+(pose<0?80:97)*armLen;
  marks['shoulder'+key]={x,y,z};
  marks['elbow'+key]={x:ex,y:ey,z:z+(sign*11)};
  marks['wrist'+key]={x:wx,y:wy,z:z+(sign*17)};
  marks['finger'+key]={x:wx+sign*4,y:wy+33*armLen,z:z+(sign*18)}
 }
 for(let i=0;i<legs;i++){
  const positions=legs===4?[-.95,-.31,.31,.95]:[-.53,.53];
  const lateral=positions[i];
  const x=hip*lateral;
  const z=legs===4?(i%2===0?-17:17):i===0?-11:11;
  const lift=(i%2)*4,step=legLen;
  marks['hip'+i]={x,y:hipY,z};
  marks['knee'+i]={x:x*(v.spriteTorso==='draconic'?1.27:1.12),y:hipY+99*step+lift,z:z+((i%2)?8:-5)};
  marks['ankle'+i]={x:x*(v.spriteTorso==='draconic'?1.30:1.16),y:hipY+191*step+lift,z:z+5};
  marks['foot'+i]={x:x*(v.spriteTorso==='draconic'?1.48:1.26),y:hipY+222*step+lift,z:z+17}
 }
 return {view,sw,wa,hip,depth,hw,neck,armLen,legLen,arms,legs,tail,colors,headType,marks,
         detail:N(v.detailLevel,0,100,85)/100,zoom:N(v.size,60,190,110)/110,
         face:v.eyes||'standard',eyeCount:N(v.eyeCount,1,4,2),
         skin:v.skin||'smooth', horns:v.horns||'none',
         tailType:v.tail||'none',wings:v.wings||'none',race:v.spriteTorso||'humanoid',v};
}
function project(m,p){
 return {x:310+(m.view==='side'?p.z:m.view==='back'?-p.x:p.x),
         y:p.y};
}
function pt(x,y,z=0){return {x,y,z}}
const xy=p=>F(p.x)+' '+F(p.y);
function defs(m){
 const [main,light,dark]=m.colors;
 return '<defs id="v80-defs"><radialGradient id="v81iris"><stop stop-color="#ffffff"/><stop offset=".14" stop-color="#afd9d2"/><stop offset=".50" stop-color="'+light+'"/><stop offset=".92" stop-color="'+dark+'"/></radialGradient>'+
 '<radialGradient id="v80skin" cx="34%" cy="19%" r="87%"><stop stop-color="#ffffff" stop-opacity=".88"/><stop offset=".13" stop-color="'+light+'"/><stop offset=".42" stop-color="'+main+'"/><stop offset=".82" stop-color="'+main+'"/><stop offset="1" stop-color="'+dark+'"/></radialGradient>'+
 '<linearGradient id="v80edge" x1="0%" y1="0%" x2="85%" y2="100%"><stop stop-color="'+light+'"/><stop offset=".28" stop-color="'+main+'"/><stop offset=".72" stop-color="'+main+'"/><stop offset="1" stop-color="'+dark+'"/></linearGradient>'+
 '<linearGradient id="v80fin" x1="0%" y1="0%" x2="100%" y2="100%"><stop stop-color="'+light+'" stop-opacity=".8"/><stop offset=".52" stop-color="'+main+'" stop-opacity=".46"/><stop offset="1" stop-color="'+light+'" stop-opacity=".18"/></linearGradient>'+
 '<radialGradient id="v80shine"><stop stop-color="#fff" stop-opacity=".88"/><stop offset=".28" stop-color="'+light+'" stop-opacity=".48"/><stop offset="1" stop-color="'+light+'" stop-opacity="0"/></radialGradient></defs>';
}
function spineLine(points,stroke,width=1,opacity=.5){
 if(!points.length)return '';let d='M'+xy(points[0]);for(let i=1;i<points.length;i++)d+=' L'+xy(points[i]);return ln(d,stroke,width,opacity)
}
function norm(a,b){
 const dx=b.x-a.x,dy=b.y-a.y,l=Math.max(.0001,Math.hypot(dx,dy));
 return {x:-dy/l,y:dx/l}
}
function catmull(points){
 if(points.length<2)return '';let d='M'+xy(points[0]);
 for(let i=0;i<points.length-1;i++){
  const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],e=points[Math.min(points.length-1,i+2)];
  const c1={x:b.x+(c.x-a.x)/6,y:b.y+(c.y-a.y)/6},c2={x:c.x-(e.x-b.x)/6,y:c.y-(e.y-b.y)/6};
  d+=' C'+xy(c1)+' '+xy(c2)+' '+xy(c);
 }return d
}
function tube(points,radii){
 const l=[],r=[];
 for(let i=0;i<points.length;i++){
  const before=points[Math.max(0,i-1)],after=points[Math.min(points.length-1,i+1)];
  const nn=norm(before,after),width=radii[i]||radii[radii.length-1];
  l.push({x:points[i].x+nn.x*width,y:points[i].y+nn.y*width});
  r.push({x:points[i].x-nn.x*width,y:points[i].y-nn.y*width})
 }
 return catmull(l)+' L'+xy(r[r.length-1])+catmull(r.slice().reverse()).replace(/^M[\d.\s-]+/,'')+' Z'
}
function ovalPath(cx,cy,rx,ry){
 return 'M'+F(cx-rx)+' '+F(cy)+' C'+F(cx-rx)+' '+F(cy-ry*.77)+' '+F(cx-rx*.65)+' '+F(cy-ry)+' '+F(cx)+' '+F(cy-ry)+
 ' C'+F(cx+rx*.7)+' '+F(cy-ry)+' '+F(cx+rx)+' '+F(cy-ry*.65)+' '+F(cx+rx)+' '+F(cy)+
 ' C'+F(cx+rx)+' '+F(cy+ry*.72)+' '+F(cx+rx*.7)+' '+F(cy+ry)+' '+F(cx)+' '+F(cy+ry)+
 ' C'+F(cx-rx*.67)+' '+F(cy+ry)+' '+F(cx-rx)+' '+F(cy+ry*.7)+' '+F(cx-rx)+' '+F(cy)+'Z'
}
function wing(m,sign){
 const wingType=m.wings!=='none'?m.wings:(m.v.features||[]).includes('wings')?'membrane':'none';
 if(wingType==='none')return '';
 const a=m.colors[1],dark=m.colors[2];
 const front=m.view!=='side',root=project(m,pt(sign*m.sw*.73,305,-9));
 const dir=front?sign*(m.view==='back'?-1:1):sign>0?1:-1;
 const span=wingType==='insect'?198:wingType==='feather'?186:164;
 const tip={x:root.x+dir*span,y:wingType==='insect'?95:155};
 const low={x:root.x+dir*(span*.67),y:434};
 let d='M'+xy(root)+' Q'+F(root.x+dir*105)+' '+(wingType==='insect'?88:118)+' '+xy(tip)+
 ' Q'+F(root.x+dir*(span+26))+' 269 '+xy({x:root.x+dir*(span*.87),y:314})+
 ' Q'+F(root.x+dir*span)+' 392 '+xy(low)+
 ' Q'+F(root.x+dir*70)+' 450 '+xy(root)+'Z';
 let out='<g data-v80-organ="wing" data-side="'+sign+'">'+sPath(d,'url(#v80fin)',a,2.5,.83);
 for(let k=0;k<5;k++){
  let dest={x:tip.x-dir*k*21,y:tip.y+k*62};
  out+=ln('M'+xy(root)+' Q'+F(root.x+dir*82)+' '+F(197+k*13)+' '+xy(dest),a,1.15,.45)
 }
 if(wingType==='feather')for(let k=0;k<5;k++){
  const ox=root.x+dir*(38+k*27),yy=330+k*9;
  out+=sPath('M'+F(ox)+' '+yy+'q'+F(dir*31)+' 9 '+F(dir*46)+' 44q'+F(-dir*41)+' -4 '+F(-dir*46)+' -44Z','url(#v80fin)',a,1.2,.62)
 }
 return out+'</g>'
}
function otherTail(m){
 if(m.tail||m.tailType==='none'||m.tailType==='fish')return '';
 const side=m.view==='side',end=side?{x:522,y:610}:{x:m.view==='back'?159:475,y:645};
 const base=project(m,pt(0,466,-15));
 const path=[base,{x:base.x+(end.x-base.x)*.42,y:524},
                     {x:end.x-20,y:590},end];
 let out='<g data-v80-organ="tail" data-kind="'+esc(m.tailType)+'">'+sPath(tube(path,[27,22,13,2]),'url(#v80edge)',m.colors[2],2.5);
 if(m.tailType==='feather')for(let i=0;i<7;i++)out+=ln('M'+xy(path[1])+' Q'+F(end.x-31+i*4)+' '+(558+i*14)+' '+xy({x:end.x+i*5,y:end.y+i*6}),m.colors[1],2,.39);
 else for(let i=0;i<9;i++)out+=ellipse(base.x+(end.x-base.x)*(i+1)/12,base.y+(end.y-base.y)*(i+1)/12,4,2,'url(#v80shine)',.5);
 return out+'</g>'
}
function leg(m,i){
 if(m.tail)return '';
 const M=m.marks,c=m.colors,hip=project(m,M['hip'+i]),knee=project(m,M['knee'+i]),ankle=project(m,M['ankle'+i]),foot=project(m,M['foot'+i]);
 const race=m.race,kind=m.v.feet||'feet',far=m.view==='side'&&i%2===0;
 const b=(race==='draconic'?19:race==='fae'?11:race==='arboreal'?17:race==='alien'?12:15);
 // Raised quadriceps, true tapered patella, thicker calf and narrow ankle.
 const femur={x:hip.x+(knee.x-hip.x)*.47,y:hip.y+(knee.y-hip.y)*.47};
 const calf={x:knee.x+(ankle.x-knee.x)*.45,y:knee.y+(ankle.y-knee.y)*.45};
 const bone=[hip,femur,knee,calf,ankle];
 const outline=tube(bone,[b*1.37,b*1.14,b*.77,b*.96,b*.56]);
 let out='<g data-v80-part="leg" data-index="'+i+'" data-v82-anatomy="organic" opacity="'+(far?.77:1)+'">';
 out+=sPath(outline,'url(#v80skin)',c[2],2.6);
 // Shading follows the underlying joint instead of an isolated circular knee.
 const normal=norm(hip,knee),n2=norm(knee,ankle);
 out+=ln('M'+xy({x:hip.x+normal.x*b*.4,y:hip.y+normal.y*b*.4})+
   ' Q'+F(femur.x+normal.x*b*.65)+' '+F(femur.y+normal.y*b*.65)+
   ' '+F(knee.x+normal.x*b*.28)+' '+F(knee.y+normal.y*b*.28),c[1],2.1,.37);
 out+=ln('M'+F(knee.x+n2.x*b*.34)+' '+F(knee.y+n2.y*b*.34)+
   ' Q'+F(calf.x+n2.x*b*.58)+' '+F(calf.y+n2.y*b*.58)+' '+xy(ankle),c[1],1.6,.40);
 out+=ln('M'+F(knee.x-n2.x*b*.18)+' '+F(knee.y-n2.y*b*.18)+
   ' Q'+F(knee.x-2)+' '+F(knee.y+8)+' '+F(knee.x+n2.x*b*.17)+' '+F(knee.y+n2.y*b*.20),c[2],1.2,.30);
 if(race==='draconic'){
  // Digitigrade lower limb: hock and taloned toes, still anchored to the same ankle and foot.
  const hock={x:ankle.x+(foot.x-ankle.x)*.5,y:ankle.y+4};
  out+=sPath(tube([ankle,hock,foot],[b*.62,b*.50,b*.38]),'url(#v80edge)',c[2],1.7);
  for(let t=-1;t<=1;t++){
   const x=foot.x+t*10,y=foot.y+2;
   out+=sPath('M'+F(x-5)+' '+F(y-3)+'Q'+F(x+4)+' '+F(y-3)+' '+F(x+11)+' '+F(y+5)+'L'+F(x+3)+' '+F(y+15)+'Z','#efe6c8',c[2],1.1,.98)
  }
 }else if(kind==='hooves'||race==='arboreal'){
  out+=sPath('M'+F(ankle.x-9)+' '+F(ankle.y-6)+'Q'+F(foot.x-21)+' '+F(foot.y+3)+' '+F(foot.x-20)+' '+F(foot.y+13)+
   'Q'+F(foot.x)+' '+F(foot.y+17)+' '+F(foot.x+20)+' '+F(foot.y+13)+
   'Q'+F(foot.x+20)+' '+F(foot.y-1)+' '+F(ankle.x+9)+' '+F(ankle.y-6)+'Z','url(#v80edge)',c[2],2.4);
  out+=ln('M'+F(foot.x)+' '+F(foot.y+1)+'v13',c[1],1.7,.55)
 }else{
  // A curved heel, instep, metatarsals and separate toes.
  out+=sPath('M'+F(ankle.x-9)+' '+F(ankle.y-3)+'Q'+F(ankle.x-14)+' '+F(ankle.y+15)+' '+F(foot.x-25)+' '+F(foot.y+3)+
   'Q'+F(foot.x-31)+' '+F(foot.y+10)+' '+F(foot.x-21)+' '+F(foot.y+16)+
   'Q'+F(foot.x+5)+' '+F(foot.y+20)+' '+F(foot.x+26)+' '+F(foot.y+10)+
   'Q'+F(foot.x+25)+' '+F(foot.y-3)+' '+F(ankle.x+11)+' '+F(ankle.y-3)+'Z','url(#v80skin)',c[2],2.1);
  for(let j=0;j<4;j++){
   const x=foot.x-18+j*11,y=foot.y+13+(j===0?1:0);
   out+=ln('M'+F(x-3)+' '+F(y-8)+'Q'+F(x+2)+' '+F(y-3)+' '+F(x+5)+' '+F(y),c[1],1.45,.48);
   if(kind==='claws')out+=sPath('M'+F(x+2)+' '+F(y)+'l7 11l-10 -3Z','#f3f7df',c[2],.8,.86)
  }
  if(kind==='webbed'){
   out+=sPath('M'+F(foot.x-25)+' '+F(foot.y+5)+'Q'+F(foot.x-38)+' '+F(foot.y+25)+' '+F(foot.x+30)+' '+F(foot.y+17)+'L'+F(foot.x+21)+' '+F(foot.y+4)+'Z','url(#v80fin)',c[1],1.7,.78);
   for(let j=-2;j<=2;j++)out+=ln('M'+F(foot.x)+' '+F(foot.y+3)+'L'+F(foot.x+j*12)+' '+F(foot.y+17+Math.abs(j)*2),c[1],1.1,.42)
  }
 }
 return out+'</g>'
}
function arm(m,sign,pair){
 const M=m.marks,key=(sign<0?'left':'right')+pair;
 const shoulder=project(m,M['shoulder'+key]),elbow=project(m,M['elbow'+key]),wrist=project(m,M['wrist'+key]),finger=project(m,M['finger'+key]);
 const c=m.colors,hard=m.v.spriteArms==='strong',thin=m.race==='fae',other=m.race==='draconic';
 const rad=(hard?21:thin?11:other?19:15)*(pair===1?.82:1);
 const far=m.view==='side'&&sign<0;
 const dir=sign*(m.view==='back'?-1:1);
 let out='<g data-v80-part="arm" data-index="'+(pair*2+(sign>0?1:0))+'" opacity="'+(far?.72:1)+'">';
 // Deltoid, biceps, forearm, palm and fingers share one curved silhouette.
 const biceps={x:shoulder.x+(elbow.x-shoulder.x)*.52,y:shoulder.y+(elbow.y-shoulder.y)*.52};
 const ext={x:elbow.x+(wrist.x-elbow.x)*.56,y:elbow.y+(wrist.y-elbow.y)*.56};
 const sweep=norm(shoulder,elbow),bend=norm(elbow,wrist);
 const mid={x:elbow.x,y:elbow.y};
 out+=sPath(tube([shoulder,biceps,mid,ext,wrist],[rad*1.38,rad*1.06,rad*.78,rad*.90,rad*.53]),'url(#v80skin)',c[2],2.8);
 // Anatomical volumes and tapered highlight, not circular elbow joints.
 out+=ln('M'+xy({x:shoulder.x+sweep.x*rad*.38,y:shoulder.y+sweep.y*rad*.38})+' Q'+F(biceps.x+sweep.x*rad*.48)+' '+F(biceps.y+sweep.y*rad*.48)+' '+xy({x:elbow.x+bend.x*rad*.33,y:elbow.y+bend.y*rad*.33}),c[1],2.35,.44);
 out+=ln('M'+F(elbow.x+bend.x*rad*.4)+' '+F(elbow.y+bend.y*rad*.4)+' Q'+F(ext.x+bend.x*rad*.60)+' '+F(ext.y+bend.y*rad*.60)+' '+xy(wrist),c[1],1.7,.36);
 if(m.race==='draconic'){
  for(let k=0;k<3;k++){
   const x=biceps.x+(ext.x-biceps.x)*(k+1)/4,y=biceps.y+(ext.y-biceps.y)*(k+1)/4;
   out+=sPath('M'+F(x-7*dir)+' '+F(y-7)+'q'+F(dir*6)+' -14 '+F(dir*17)+' -23q'+F(dir*2)+' 19 '+F(-dir*11)+' 31Z','url(#v80edge)',c[1],1.2,.63)
  }
 }
 const u=m.v.hands||'standard',finned=m.v.spriteArms==='finned'||u==='webbed';
 if(finned){
  const tip={x:ext.x+dir*(m.view==='side'?18:42),y:ext.y+15};
  out+=sPath('M'+xy(elbow)+' Q'+F(tip.x+dir*11)+' '+F(tip.y-17)+' '+xy(tip)+' Q'+F(wrist.x+dir*18)+' '+F(wrist.y-14)+' '+xy(wrist)+'Z','url(#v80fin)',c[1],1.7,.79);
  for(let k=0;k<6;k++)out+=ln('M'+xy(elbow)+'Q'+F(ext.x+dir*(18+k*7))+' '+F(ext.y-5+k*4)+' '+F(tip.x-dir*k*4)+' '+F(tip.y+k*2),c[1],1.1,.36)
 }
 // Hand axis is defined by the wrist and finger anchor so poses remain editable.
 const v={x:finger.x-wrist.x,y:finger.y-wrist.y},len=Math.max(2,Math.hypot(v.x,v.y));
 const along={x:v.x/len,y:v.y/len},across={x:-along.y,y:along.x};
 const at=(u,t)=>({x:wrist.x+along.x*u+across.x*t,y:wrist.y+along.y*u+across.y*t});
 const palm0=at(0,0),knuckle=at(len*.60,0);
 if(u==='pincers'){
  out+=sPath('M'+xy(at(-2,-rad*.6))+'Q'+xy(at(len*.4,-rad*1.4))+' '+xy(at(len+15,-rad*.75))+
   'Q'+xy(at(len-2,0))+' '+xy(at(len+14,rad*.85))+' Q'+xy(at(len*.34,rad*1.3))+' '+xy(at(-2,rad*.6))+'Z','url(#v80edge)',c[2],2.1)
 }else{
  // Palm, four fully outlined tapered fingers and a thumb. No disembodied line strokes.
  out+=sPath(tube([palm0,at(len*.34,0),knuckle],[rad*.60,rad*.73,rad*.72]),'url(#v80edge)',c[2],1.45);
  for(let i=0;i<4;i++){
    const gap=rad*.30,offset=(i-1.5)*gap;
    const root=at(len*.55,offset),mid=at(len*.84,offset*1.12);
    const length= i===0?len*.96 : i===1?len*1.23 : i===2?len*1.20:len*.89;
    const tip=at(length,offset*1.23),radius=2.8*(rad/15);
    out+=sPath(tube([root,mid,tip],[radius*1.20,radius,radius*.55]),'url(#v80skin)',c[2],.72,.99);
    out+=ln('M'+xy(mid)+'Q'+xy(at(length-.5,offset*1.23-radius*.32))+' '+xy(tip),c[1],.75,.45);
    if(u==='claws'||m.race==='draconic'){
      const outer=at(length+9,offset*1.24);
      out+=sPath('M'+xy(at(length-2,offset-2))+'L'+xy(outer)+'L'+xy(at(length+1,offset+2))+'Z','#f2edd8',c[2],.7,.95)
    }
  }
  const thumbRoot=at(len*.18,-rad*.62),thumbMid=at(len*.45,-rad*1.06),thumbTip=at(len*.69,-rad*1.19);
  out+=sPath(tube([thumbRoot,thumbMid,thumbTip],[rad*.26,rad*.25,rad*.14]),'url(#v80skin)',c[2],.8);
  out+=ln('M'+xy(thumbRoot)+'Q'+xy(thumbMid)+' '+xy(thumbTip),c[1],.9,.48)
 }
 return out+'</g>'
}
function fish(m){
 const c=m.colors,side=m.view==='side',back=m.view==='back';
 const hip={x:side?332:310,y:466};
 const points=side?[
   hip,{x:343,y:513},{x:363,y:569},{x:368,y:624},{x:360,y:692}
 ]:[
   hip,{x:316,y:515},{x:308,y:575},{x:311,y:628},{x:312,y:690}
 ];
 const base=m.hip*(side?1.02:1.10);
 const widths=[base,base*.92,base*.69,base*.36,6];
 const tip=points[4];
 const tailOutline=tube(points,widths);
 let out='<g data-v80-part="fish-tail" data-v83-tail="curved"><defs><clipPath id="v83TailClip"><path d="'+tailOutline+'"/></clipPath></defs>';
 out+=sPath(tailOutline,'url(#v80skin)',c[2],3.0);
 out+=ln('M'+xy({x:points[0].x-3,y:points[0].y+7})+'Q'+xy({x:points[1].x-7,y:points[1].y+15})+' '+xy({x:points[3].x-3,y:points[3].y+16}),c[1],2.1,.25);
 // Left and right lobes are drawn with curved, asymmetrical membranes.
 for(const sign of [-1,1]){
   const dir=side?sign:(back?-sign:sign);
   const spread=side?113:140;
   const tx=tip.x+dir*spread,ty=724+(sign===1?6:-10);
   const fin='M'+xy(tip)+
     ' Q'+F(tip.x+dir*49)+' '+F(tip.y-21)+' '+F(tx)+' '+F(ty)+
     ' Q'+F(tx+dir*8)+' '+F(ty+17)+' '+F(tx-dir*26)+' '+F(ty+34)+
     ' Q'+F(tip.x+dir*43)+' '+F(tip.y+57)+' '+F(tip.x+dir*10)+' '+F(tip.y+30)+
     ' Q'+F(tip.x+dir*3)+' '+F(tip.y+14)+' '+xy(tip)+'Z';
   out+=sPath(fin,'url(#v80fin)',c[1],2.5,.9);
   for(let i=0;i<8;i++){
     const t=(i+.2)/8;
     out+=ln('M'+xy(tip)+' Q'+F(tip.x+dir*(25+55*t))+' '+F(tip.y+17+8*t)+' '+F(tip.x+dir*(spread*(.60+.40*t)))+' '+F(ty+4+20*t),c[1],1,.40)
   }
 }
 out+='<g clip-path="url(#v83TailClip)">';
 const rows=Math.round(8+m.detail*12);
 for(let r=0;r<rows;r++){
   const y=485+r*9.4;
   let t=(y-466)/224;
   const pos=points[Math.min(4,Math.floor(t*4))],width=base*(1-.83*t);
   const cen=side?335+25*t:310+2*Math.sin(t*7);
   for(let j=-2;j<=2;j++){
     const xx=cen+j*Math.max(4,12*(1-t))+(r%2)*5;
     if(Math.abs(xx-cen)>width*.93)continue;
     out+=ln('M'+F(xx-6)+' '+F(y)+'q6 9 12 0',c[1],1.0,.26+m.detail*.21)
   }
 }
 out+='</g>';
 return out+'</g>'
}
function torso(m){
 const c=m.colors,side=m.view==='side',cx=310,race=m.race;
 const sw=(side?m.depth*.96:m.sw)*(race==='draconic'?1.12:race==='fae'?.92:1);
 const wa=(side?m.depth*.73:m.wa)*(race==='aquatic'?.88:1);
 const hip=(side?m.depth*.86:m.hip)*(race==='humanoid'?1.05:1);
 const n=race==='draconic'?23:race==='fae'?14:18;
 const rib=sw*(race==='draconic'?1.01:race==='alien'?.96:1);
 const pt=(a,y)=>F(cx+a)+' '+F(y);
 const d='M'+pt(-n,264)+
  ' C'+pt(-sw*.47,270)+' '+pt(-rib*.98,281)+' '+pt(-rib*1.13,307)+
  ' C'+pt(-rib*1.23,327)+' '+pt(-rib*.94,348)+' '+pt(-rib*.81,359)+
  ' C'+pt(-wa*1.01,377)+' '+pt(-wa*.93,408)+' '+pt(-wa,427)+
  ' C'+pt(-hip*1.13,447)+' '+pt(-hip*1.04,464)+' '+pt(-hip*.78,480)+
  ' Q'+pt(0,499)+' '+pt(hip*.78,480)+
  ' C'+pt(hip*1.04,464)+' '+pt(hip*1.13,447)+' '+pt(wa,427)+
  ' C'+pt(wa*.93,408)+' '+pt(wa*1.01,377)+' '+pt(rib*.81,359)+
  ' C'+pt(rib*.94,348)+' '+pt(rib*1.23,327)+' '+pt(rib*1.13,307)+
  ' C'+pt(rib*.98,281)+' '+pt(sw*.47,270)+' '+pt(n,264)+
  ' Q'+pt(0,276)+' '+pt(-n,264)+'Z';
 let o='<g data-v80-part="torso" data-v83-silhouette="organic">'+sPath(d,'url(#v80skin)',c[2],3.1);
 o+='<defs><clipPath id="v83bodyclip"><path d="'+d+'"/></clipPath></defs><g clip-path="url(#v83bodyclip)">';
 // Mid-tones describe muscle and bone masses without detached geometric panels.
 for(const sign of [-1,1]){
   o+=sPath('M'+pt(sign*sw*.28,284)+
      ' C'+pt(sign*sw*.75,281)+' '+pt(sign*sw*1.18,297)+' '+pt(sign*sw*.92,329)+
      ' Q'+pt(sign*sw*.63,350)+' '+pt(sign*sw*.22,335)+
      ' Q'+pt(sign*sw*.46,308)+' '+pt(sign*sw*.28,284)+'Z','url(#v80edge)',c[1],.8,.18);
   o+=ln('M'+pt(sign*sw*.20,289)+'Q'+pt(sign*sw*.62,304)+' '+pt(sign*sw*.83,324),c[1],2.2,.48);
   o+=ln('M'+pt(sign*sw*.87,344)+'Q'+pt(sign*wa*.70,375)+' '+pt(sign*wa*.76,396),c[2],1.4,.23);
   o+=ln('M'+pt(sign*wa*.56,410)+'Q'+pt(sign*wa*.70,431)+' '+pt(sign*hip*.71,460),c[1],1.45,.25);
 }
 if(m.view==='front'){
  o+=sPath('M'+pt(-sw*.70,320)+'Q'+pt(0,351)+' '+pt(sw*.70,320)+
    ' Q'+pt(sw*.40,362)+' '+pt(0,363)+'Q'+pt(-sw*.40,362)+' '+pt(-sw*.70,320)+'Z','url(#v80fin)',c[1],1,.10);
  for(const sign of [-1,1]){
    o+=ln('M'+pt(sign*sw*.75,340)+'Q'+pt(sign*sw*.41,356)+' '+pt(sign*wa*.64,378),c[1],1.55,.27);
    o+=ln('M'+pt(sign*wa*.35,390)+'Q'+pt(sign*wa*.46,420)+' '+pt(sign*wa*.58,434),c[2],1.3,.22);
  }
  o+=ln('M'+pt(0,345)+'Q'+pt(-4,373)+' '+pt(0,408)+'Q'+pt(3,420)+' '+pt(0,435),c[1],1.7,.28);
  o+=ln('M'+pt(-hip*.66,457)+'Q'+pt(0,467)+' '+pt(hip*.66,457),c[1],1.4,.34);
 }else if(m.view==='back'){
  for(const sign of [-1,1]){
   o+=sPath('M'+pt(sign*sw*.32,300)+'Q'+pt(sign*sw*.88,326)+' '+pt(sign*sw*.73,367)+
     'Q'+pt(sign*wa*.31,381)+' '+pt(sign*7,342)+'Z','url(#v80edge)',c[1],.85,.18);
   o+=ln('M'+pt(sign*sw*.75,329)+'Q'+pt(sign*wa*.79,363)+' '+pt(sign*wa*.51,390),c[1],1.6,.35);
   o+=ln('M'+pt(sign*wa*.28,405)+'Q'+pt(sign*hip*.53,438)+' '+pt(sign*hip*.70,461),c[2],1.4,.25);
  }
  o+=ln('M'+pt(0,316)+'Q'+pt(-2,380)+' '+pt(0,447),c[2],1.55,.39);
 }else{
  o+=ln('M'+pt(-rib*.69,305)+'Q'+pt(rib*1.0,326)+' '+pt(rib*.70,365),c[1],2.1,.42);
  o+=ln('M'+pt(-rib*.65,324)+'Q'+pt(-rib*.71,402)+' '+pt(-wa*.51,454),c[2],1.6,.36);
 }
 if(race==='aquatic'||race==='draconic'||m.skin==='scales'){
  // Staggered small scales vary with material and lie inside the actual torso.
  for(let row=0;row<Math.round(6+m.detail*9);row++)for(let j=-4;j<=4;j++){
    const x=cx+j*(side?12:13)+(row%2)*6.5,y=311+row*12;
    o+=ln('M'+F(x-6)+' '+F(y)+'q6 10 12 0',c[1],1,.22+m.detail*.17);
  }
  if(race==='draconic'){
   for(let row=0;row<5;row++){const y=306+row*27,k=26-row*3;
    o+=sPath('M'+pt(-k,y)+'Q'+pt(0,y-13)+' '+pt(k,y)+'Q'+pt(0,y+14)+' '+pt(-k,y)+'Z','url(#v80edge)',c[1],1.2,.39)
   }
  }
 }else if(race==='arboreal'||m.skin==='bark'){
  for(let j=0;j<Math.round(14+13*m.detail);j++){
   const x=268+(j*23)%84,y=290+(j*31)%162;
   o+=ln('M'+x+' '+y+'q'+(j%2?9:-5)+' 19 '+(j%3?3:-7)+' 33',c[2],1.35,.35)
  }
 }else if(race==='alien'){
  for(let j=0;j<19;j++){
   const x=281+(j*17)%57,y=301+(j*29)%148;
   o+=sPath('M'+x+' '+y+'l4 -9l5 9l-5 10Z','url(#v80fin)',c[1],.85,.30)
  }
 }else if(race==='fae'){
  for(let j=0;j<22;j++){const x=279+(j*17)%59,y=309+(j*31)%139;
   o+=circle(x,y,1.5+j%3*.4,'url(#v80shine)',.55)
  }
 }
 o+='</g>';
 if(race==='aquatic'||(m.v.features||[]).includes('gills')){
   for(const sign of [-1,1]){
    const x=cx+sign*rib*.88;
    o+=sPath('M'+F(x)+' 304Q'+F(x+sign*26)+' 293 '+F(x+sign*41)+' 322Q'+F(x+sign*26)+' 351 '+F(x+sign*5)+' 350Z','url(#v80fin)',c[1],1.5,.67);
    for(let k=0;k<4;k++)o+=ln('M'+F(x+sign*8)+' '+(311+k*8)+'l'+F(sign*(15+k*2))+' '+(4+k*2),c[1],1.0,.47)
   }
 }
 return o+'</g>'
}
function head(m){
 const c=m.colors,side=m.view==='side',back=m.view==='back';
 const center=project(m,m.marks.head),cx=center.x,cy=center.y;
 const w=m.hw*(side?.91:1),h=m.race==='alien'?85:m.race==='draconic'?86:m.race==='fae'?70:76;
 const top=cy-h,chin=cy+h*.81,dragon=m.headType==='dragon',aquatic=m.headType==='aquatic'||m.race==='aquatic';
 let contour;
 if(side){
  const nose=dragon?23:m.race==='alien'?18:10;
  contour='M'+F(cx-29)+' '+F(top+14)+'Q'+F(cx-2)+' '+F(top-10)+' '+F(cx+29)+' '+F(top+3)+
   'Q'+F(cx+w*.78)+' '+F(top+33)+' '+F(cx+w*.77)+' '+F(cy-28)+
   'Q'+F(cx+w*.84+nose)+' '+F(cy-15)+' '+F(cx+w*.87+nose)+' '+F(cy-4)+
   'L'+F(cx+w*.66)+' '+F(cy+22)+'Q'+F(cx+w*.81)+' '+F(cy+41)+' '+F(cx+w*.37)+' '+F(chin-4)+
   'Q'+F(cx-13)+' '+F(chin+7)+' '+F(cx-33)+' '+F(cy+37)+
   'Q'+F(cx-w*.78)+' '+F(cy-36)+' '+F(cx-29)+' '+F(top+14)+'Z';
 }else{
  const wide=m.race==='alien'?1.12:m.race==='fae'?.86:1;
  contour='M'+F(cx)+' '+F(top)+'Q'+F(cx-w*wide*.8)+' '+F(top-6)+' '+F(cx-w*wide)+' '+F(cy-28)+
   'Q'+F(cx-w*wide*1.05)+' '+F(cy+6)+' '+F(cx-w*.69)+' '+F(cy+38)+
   'Q'+F(cx-w*.33)+' '+F(chin-3)+' '+F(cx)+' '+F(chin-4)+
   'Q'+F(cx+w*.33)+' '+F(chin-3)+' '+F(cx+w*.69)+' '+F(cy+38)+
   'Q'+F(cx+w*wide*1.05)+' '+F(cy+6)+' '+F(cx+w*wide)+' '+F(cy-28)+
   'Q'+F(cx+w*wide*.8)+' '+F(top-6)+' '+F(cx)+' '+F(top)+'Z'
 }
 let o='<g data-v80-part="head" data-v81-face="sculpted">';
 // Fins, pointed ears and cranial horns grow behind the silhouette.
 if(!dragon)for(const sign of [-1,1]){
  if(side&&sign<0)continue;
  const x=cx+(side?w*.77:sign*w*.94),y=cy-12;
  if(aquatic){
   o+=sPath('M'+F(x)+' '+F(y-34)+'Q'+F(x+sign*47)+' '+F(y-88)+' '+F(x+sign*76)+' '+F(y-77)+
    'Q'+F(x+sign*62)+' '+F(y-28)+' '+F(x+sign*91)+' '+F(y-14)+
    'Q'+F(x+sign*43)+' '+F(y+19)+' '+F(x)+' '+F(y+22)+'Z','url(#v80fin)',c[1],2,.84);
   for(let k=0;k<4;k++)o+=ln('M'+F(x)+' '+F(y-22+k*9)+'Q'+F(x+sign*30)+' '+F(y-46+k*12)+' '+F(x+sign*(66-k*3))+' '+F(y-72+k*20),c[1],1.3,.4)
  }else{
   o+=sPath('M'+F(x)+' '+F(y-34)+'Q'+F(x+sign*41)+' '+F(y-82)+' '+F(x+sign*(m.race==='fae'?94:70))+' '+F(y-122)+
    'Q'+F(x+sign*62)+' '+F(y+14)+' '+F(x)+' '+F(y+23)+'Z','url(#v80edge)',c[2],2.1,.94);
   o+=ln('M'+F(x)+' '+F(y-15)+'Q'+F(x+sign*37)+' '+F(y-69)+' '+F(x+sign*61)+' '+F(y-104),c[1],1.6,.44)
  }
 }
 o+=sPath(contour,'url(#v80skin)',c[2],3.5);
 // Forehead, cheekbone highlights, temples and lower jaw shading.
 o+=sPath('M'+F(cx-w*.59)+' '+F(top+32)+'Q'+F(cx)+' '+F(top+7)+' '+F(cx+w*.59)+' '+F(top+32)+
   'Q'+F(cx+w*.35)+' '+F(cy-36)+' '+F(cx)+' '+F(cy-26)+'Q'+F(cx-w*.35)+' '+F(cy-36)+' '+F(cx-w*.59)+' '+F(top+32)+'Z','url(#v80fin)',c[1],1,.22);
 if(!back){
  for(const sign of [-1,1]){
   if(side&&sign<0)continue;
   const q=side?cx+w*.52:cx+sign*w*.64;
   o+=sPath('M'+F(q-sign*17)+' '+F(cy+5)+'Q'+F(q+sign*17)+' '+F(cy-8)+' '+F(q+sign*21)+' '+F(cy+13)+
    'Q'+F(q+sign*12)+' '+F(cy+33)+' '+F(q-sign*6)+' '+F(cy+35)+'Z','url(#v80fin)',c[1],.6,.20);
  }
  const eyeY=cy-19,eyes=m.eyeCount===1?[0]:m.eyeCount===4?[-.65,-.23,.23,.65]:[-.42,.42];
  for(const fac of eyes){
   if(side&&fac<0)continue;
   const x=cx+(side?w*.49:fac*w),y=eyeY+(eyes.length===4&&Math.abs(fac)<.4?17:0),rx=side?12:eyes.length===4?w*.15:w*.28;
   const ld='M'+F(x-rx)+' '+F(y+1)+'Q'+F(x-1)+' '+F(y-12)+' '+F(x+rx)+' '+F(y)+
   'Q'+F(x+rx*.2)+' '+F(y+11)+' '+F(x-rx)+' '+F(y+1)+'Z';
   o+=sPath(ld,m.face==='blank'?'url(#v80edge)':'#edf9f1',c[2],1.85);
   if(m.face!=='blank'){
    const slit=m.face==='slit'||dragon;
    o+=ellipse(x,y,slit?2.9:7,slit?8.1:6.5,'url(#v81iris)');
    o+=ellipse(x,y,slit?1.2:3,slit?6:3.3,'#102937');
    o+=circle(x-3,y-3,2.3,'#ffffff',.99);
    o+=circle(x+4,y+3,1,'#dafcf6',.78)
   }
   o+=ln('M'+F(x-rx-4)+' '+F(y-3)+'Q'+F(x)+' '+F(y-17)+' '+F(x+rx+4)+' '+F(y-4),c[2],2.6,.53);
   o+=ln('M'+F(x-rx-5)+' '+F(y-19)+'Q'+F(x)+' '+F(y-26)+' '+F(x+rx+5)+' '+F(y-17),c[1],2,.44)
  }
  if(!side){
   o+=ln('M'+F(cx-1)+' '+F(cy-11)+'Q'+F(cx-8)+' '+F(cy+7)+' '+F(cx-5)+' '+F(cy+20)+
       'Q'+F(cx+3)+' '+F(cy+28)+' '+F(cx+13)+' '+F(cy+19),c[2],1.6,.39);
   o+=ln('M'+F(cx-17)+' '+F(cy+42)+'Q'+F(cx)+' '+F(cy+51)+' '+F(cx+17)+' '+F(cy+42),c[2],2.2,.66);
   o+=ln('M'+F(cx-11)+' '+F(cy+53)+'Q'+F(cx)+' '+F(cy+58)+' '+F(cx+11)+' '+F(cy+53),c[1],1.3,.39)
  }else{
   o+=ln('M'+F(cx+w*.73)+' '+F(cy+35)+'Q'+F(cx+w*.5)+' '+F(cy+44)+' '+F(cx+w*.25)+' '+F(cy+38),c[2],2,.61)
  }
  if(aquatic)for(const sign of [-1,1]){
   if(side&&sign<0)continue;
   const x=side?cx+w*.38:cx+sign*w*.79;
   for(let i=0;i<4;i++)o+=ln('M'+F(x)+' '+F(cy+i*10)+'l'+F(sign*13)+' -3',c[1],1.65,.61)
  }
 }else{
  for(const sign of [-1,1])o+=ln('M'+F(cx+sign*w*.29)+' '+F(top+18)+'Q'+F(cx+sign*w*.54)+' '+F(cy-28)+' '+F(cx+sign*w*.25)+' '+F(chin-9),c[1],2.3,.31)
 }
 if(dragon||m.race==='draconic'){
  for(let j=0;j<5;j++){
   const x=cx+(j-2)*w*.31,y=top+17+(j%2)*6;
   o+=sPath('M'+F(x-10)+' '+F(y)+'Q'+F(x)+' '+F(y+15)+' '+F(x+10)+' '+F(y)+'Q'+F(x)+' '+F(y+4)+' '+F(x-10)+' '+F(y)+'Z','url(#v80fin)',c[1],1,.40);
  }
 }
 if(m.race==='arboreal')for(let i=0;i<11;i++){
  const x=cx-w*.5+(i*17)%(w),y=top+20+(i*29)%120;
  o+=ln('M'+F(x)+' '+F(y)+'q'+(i%2?4:-6)+' 21 1 29',c[2],1.1,.41)
 }
 // Horns stay in the same world-space sockets across all projections.
 if(['pair','single','antlers'].includes(m.horns)){
  const arr=m.horns==='single'?[0]:[-1,1];
  for(const sign of arr){
   if(side&&sign<0)continue;
   const x=cx+(side?12:sign*w*.53),y=top+11,dx=side?20:sign*44;
   o+=sPath('M'+F(x-11)+' '+F(y+7)+'Q'+F(x+dx*.16)+' '+F(y-37)+' '+F(x+dx)+' '+F(y-92)+
     'Q'+F(x+dx*.66)+' '+F(y-28)+' '+F(x+14)+' '+F(y+5)+'Z','url(#v80edge)',c[1],2.2,.96);
   if(m.horns==='antlers')for(let k=0;k<3;k++)o+=ln('M'+F(x+dx*.32+k*dx*.13)+' '+F(y-24-k*18)+
    'Q'+F(x+dx*.58+sign*17)+' '+F(y-49-k*22)+' '+F(x+dx*.8+sign*22)+' '+F(y-68-k*20),c[1],3.1,.86)
  }
 }
 return o+'</g>'
}
function neck(m){
 const p=project(m,m.marks.neck),head=project(m,m.marks.head),c=m.colors;
 const upper= m.race==='draconic'?25:m.race==='alien'?14:m.race==='fae'?13:18;
 const low= m.race==='draconic'?35:m.race==='alien'?24:m.race==='fae'?21:28;
 const base= {x:p.x,y:p.y+38},top={x:p.x,y:head.y+65};
 let out='<g data-v80-part="neck">';
 out+=sPath(tube([top,{x:p.x,y:p.y-15},base],[upper,upper*.93,low]),'url(#v80edge)',c[2],2.3);
 for(const sign of [-1,1]){
  out+=ln('M'+F(p.x+sign*upper*.6)+' '+F(top.y+6)+'Q'+F(p.x+sign*(upper*.8))+' '+F(p.y+2)+' '+F(p.x+sign*low*.8)+' '+F(base.y-4),c[1],1.7,.38);
 }
 if(m.race==='aquatic')for(const sign of [-1,1])for(let j=0;j<3;j++)out+=ln('M'+F(p.x+sign*upper*.7)+' '+F(top.y+21+j*10)+'l'+F(sign*12)+' -3',c[1],1.3,.51);
 return out+'</g>'
}
function sketch(m){
 const body=[];
 body.push('<g data-v80-figure="true" aria-label="Сборный SVG-персонаж; единый трёхмерный каркас">');
 // Back-depth layers are ordered before torso and head.
 for(const sign of [-1,1])body.push(wing(m,sign));
 body.push(otherTail(m));
 if(m.tail)body.push(fish(m));
 for(let i=0;i<m.legs;i++)body.push(leg(m,i));
 for(let j=0;j<m.arms/2;j++)body.push(arm(m,-1,j));
 body.push(neck(m),torso(m));
 for(let j=0;j<m.arms/2;j++)body.push(arm(m,1,j));
 body.push(head(m));
 if(document.getElementById('m74anchors')?.checked){
  body.push('<g data-v80-debug="anchors">');
  for(const [key,p] of Object.entries(m.marks)){let xy0=project(m,p);body.push(circle(xy0.x,xy0.y,3.4,'#ffdc89',.86))}
  body.push('</g>')
 }
 body.push('</g>');
 return body.join('')
}
function creatureSVG(v){
 const m=rig(v);
 const background='<circle cx="310" cy="390" r="263" stroke="'+m.colors[1]+'" stroke-opacity=".13" stroke-dasharray="2 13" fill="none"/>'+
  '<ellipse cx="310" cy="391" rx="204" ry="286" fill="url(#v80shine)" opacity=".08"/>';
 return defs(m)+background+'<g data-v80-fit="true">'+sketch(m)+'</g>';
}
creature=function(v){return v?.spriteMode?creatureSVG(v):oldCreature(v)};
function fitView(){
 if(!s?.spriteMode)return;
 const art=document.getElementById('art');
 if(!art)return;
 const fit=art.querySelector('[data-v80-fit]'),figure=art.querySelector('[data-v80-figure]');
 if(!fit||!figure)return;
 try{
  const b=figure.getBBox();
  if(!Number.isFinite(b.width)||!b.width||!Number.isFinite(b.height)||!b.height)return;
  const m=rig(s);
  // Respect nominal creature size until it reaches the viewport edge;
  // then fit down, never crop horns, wings or extra limbs.
  const availW=620-2*38,availH=780-2*32;
  const safety=Math.min(1,availW/(b.width*m.zoom),availH/(b.height*m.zoom));
  const scale=Math.floor(m.zoom*safety*1000)/1000;
  const tx=F(b.x+b.width/2),ty=F(b.y+b.height/2);
  fit.setAttribute('transform','translate(310 388) scale('+scale+') translate('+(-tx)+' '+(-ty)+')');
  fit.dataset.nominal=String(m.zoom);
  fit.dataset.actual=String(scale);
  fit.dataset.fitted=String(safety<.999);
  const label=document.getElementById('v80fit-status');
  if(label)label.textContent=safety<.999?'Автоподгонка: '+Math.round(safety*100)+'% · персонаж полностью виден':'Масштаб: '+Math.round(m.zoom*100)+'% · без обрезания';
 }catch(err){/* getBBox unavailable in some SVG export contexts */ }
}
const div=document.createElement('div');
div.id='v80fit-status';
div.setAttribute('aria-live','polite');
div.className='atlas80-fit-status';
const mod=document.querySelector('#modular73 #m73controls');
if(mod)mod.appendChild(div);
const style=document.createElement('style');
style.textContent='.atlas80-fit-status{padding:7px 9px;border:1px solid var(--ui-gold-deep,#806d52);border-radius:7px;margin-top:9px;color:var(--ui-gold,#e4c993);font:500 11px system-ui,sans-serif}'+css+
 'body[data-modular="true"] #stage #art{width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;overflow:hidden!important;display:block!important}';
document.head.appendChild(style);
const note=document.querySelector('#modular73 .m73note');
if(note)note.textContent='Единый каркас для трёх ракурсов. Голова, суставы, крылья, хвост и конечности рисуются по общим точкам. Крупные фигуры автоматически вписываются в рамку.';
const title=document.querySelector('#modular73 h3');
if(title)title.textContent='Анатомический конструктор 2D';
const badge=document.querySelector('.atlas76status');
if(badge)badge.textContent='SVG-анатомия · пластичные силуэты · v0.8.3';
render=function(sync=true){
 oldRender(sync);
 fitView();
 const status=document.getElementById('m73status');
 if(status&&s.spriteMode){
  const m=rig(s);
  status.textContent='Каркас v0.8 · '+m.arms+' рук · '+(m.tail?'рыбий хвост':m.legs+' ног')+' · '+({front:'спереди',side:'сбоку',back:'сзади'}[m.view]||'спереди');
 }
};
// The legacy export creates creature(s) again, without the live fit transform.
 // Preserve the on-screen fit in BOTH SVG and the PNG exporter that calls svgSource().
const previousSvgSource=svgSource;
svgSource=function(){
 const generated=previousSvgSource();
 if(!s?.spriteMode)return generated;
 fitView();
 const tr=document.querySelector('#art [data-v80-fit]')?.getAttribute('transform');
 if(!tr)return generated;
 return generated.replace('<g data-v80-fit="true">','<g data-v80-fit="true" transform="'+esc(tr)+'">');
};
render();
window.AtlasRig080={version:'0.8.3',getModel:()=>rig(s),getFit:()=>{
 const g=document.querySelector('[data-v80-fit]');return g?{fitted:g.dataset.fitted,nominal:Number(g.dataset.nominal),actual:Number(g.dataset.actual)}:null},
 render:()=>render(false)};
})();