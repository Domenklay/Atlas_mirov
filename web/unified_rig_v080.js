/* Atlas Living Worlds 0.8.0 — unified procedural 3D landmark rig / 2D SVG renderer.
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
 const sw=50*race.shoulder*N(v.shoulderWidth,65,145,100)/100*bulk;
 const hw=54*race.head*N(v.headWidth,65,145,100)/100;
 const wa=37*race.waist*N(v.waistWidth,65,145,100)/100*(1+(body-45)/650);
 const hip=wa*1.12;
 const depth=43*race.depth*(.92+body/640);
 const neck=17*race.neck+N(v.neckLen,0,65,18)*.26;
 const legLen=race.leg, armLen=N(v.armLength,65,140,100)/100;
 const arms=[0,2,4].includes(+v.arms)?+v.arms:2,legs=[0,2,4].includes(+v.legs)?+v.legs:2;
 const tail=v.spriteLower==='tail';
 const view=['front','side','back'].includes(v.view)?v.view:'front';
 const col=SKINS[v.spriteTorso]||SKINS.humanoid;
 const colors=v.spriteCustomColor?[safeColor(v.color||col[0]),safeColor(v.accent||col[1]),col[2]]:col;
 const headType=v.spriteHead||'elven';
 const headCenter={x:0,y:164-neck*.38,z:2};
 const neckJoint={x:0,y:250-neck*.3,z:0};
 const shoulderY=295+neck*.1,hipY=471,elbowY=392, wristY=493, kneeY=567, ankleY=669;
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
  const ex=x+sign*(40+pose*.38)*armLen;
  const ey=y+(pose<0?47:91)*armLen;
  const wx=ex+sign*(19+(pose>20?17:0))*armLen, wy=ey+(pose<0?77:97)*armLen;
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
  marks['knee'+i]={x:x*1.16,y:hipY+98*step+lift,z:z+((i%2)?8:-5)};
  marks['ankle'+i]={x:x*1.22,y:hipY+192*step+lift,z:z+5};
  marks['foot'+i]={x:x*1.28,y:hipY+220*step+lift,z:z+17}
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
 return '<defs id="v80-defs">'+
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
 const M=m.marks,hip=project(m,M['hip'+i]),knee=project(m,M['knee'+i]),ankle=project(m,M['ankle'+i]),foot=project(m,M['foot'+i]);
 const far=m.view==='side'&&i%2===0;
 const bone=[hip,knee,ankle],type=m.v.feet||'feet',race=m.race;
 const thick=race==='draconic'?18:race==='fae'?11:race==='arboreal'?17:14;
 let o='<g data-v80-part="leg" data-index="'+i+'" opacity="'+(far?.71:1)+'">';
 o+=sPath(tube(bone,[thick*1.3,thick*.79,thick*.62]),'url(#v80skin)',m.colors[2],2.5);
 o+=ln('M'+xy(hip)+' Q'+F(knee.x-10)+' '+F(knee.y-34)+' '+xy(ankle),m.colors[1],1.5,.32);
 if(type==='hooves'||race==='arboreal'){
  o+=sPath('M'+F(ankle.x-10)+' '+F(ankle.y-2)+'Q'+F(foot.x-20)+' '+F(foot.y+14)+' '+F(foot.x-18)+' '+F(foot.y+16)+'L'+F(foot.x+19)+' '+F(foot.y+16)+'Q'+F(foot.x+18)+' '+F(foot.y-6)+' '+F(ankle.x+10)+' '+F(ankle.y-2)+'Z','url(#v80edge)',m.colors[2],2.5)
 }else{
  o+=sPath('M'+F(ankle.x-9)+' '+F(ankle.y-4)+'Q'+F(foot.x-24)+' '+F(foot.y-5)+' '+F(foot.x-29)+' '+F(foot.y+6)+'Q'+F(foot.x-10)+' '+F(foot.y+15)+' '+F(foot.x+20)+' '+F(foot.y+6)+'Q'+F(foot.x+25)+' '+F(foot.y-5)+' '+F(ankle.x+9)+' '+F(ankle.y-4)+'Z','url(#v80skin)',m.colors[2],2.1);
  if(type==='webbed')o+=sPath('M'+F(foot.x-27)+' '+F(foot.y+3)+'Q'+F(foot.x-39)+' '+F(foot.y+24)+' '+F(foot.x+29)+' '+F(foot.y+16)+'L'+F(foot.x+20)+' '+F(foot.y+3)+'Z','url(#v80fin)',m.colors[1],1.8,.77);
  if(type==='claws')for(let j=-1;j<2;j++)o+=sPath('M'+F(foot.x+j*15)+' '+F(foot.y+8)+'l8 12l-10 -3Z','#f4f6dd',m.colors[2],1,.8)
 }
 return o+'</g>'
}
function arm(m,sign,pair){
 const M=m.marks,key=(sign<0?'left':'right')+pair;
 const upper=project(m,M['shoulder'+key]),elbow=project(m,M['elbow'+key]),wrist=project(m,M['wrist'+key]),finger=project(m,M['finger'+key]);
 const hard=m.v.spriteArms==='strong',thin=m.race==='fae';
 const rad=(hard?19:thin?10:14)*(pair===1?.83:1);
 const far=m.view==='side'&&sign<0;
 let o='<g data-v80-part="arm" data-index="'+(pair*2+(sign>0?1:0))+'" opacity="'+(far?.77:1)+'">';
 o+=sPath(tube([upper,elbow,wrist],[rad*1.22,rad*.87,rad*.64]),'url(#v80skin)',m.colors[2],2.9);
 o+=ln('M'+xy(upper)+' Q'+F(elbow.x-4)+' '+F(elbow.y-25)+' '+xy(wrist),m.colors[1],1.7,.36);
 const u=m.v.hands;
 const fin=m.v.spriteArms==='finned'||u==='webbed';
 if(fin){
  const tip={x:(elbow.x+wrist.x)/2+sign*(m.view==='side'?17:34),y:(elbow.y+wrist.y)/2+29};
  o+=sPath('M'+xy(elbow)+' Q'+F(tip.x+sign*7)+' '+F(tip.y-19)+' '+xy(tip)+' L'+xy(wrist)+'Z','url(#v80fin)',m.colors[1],2,.75);
  for(let k=0;k<4;k++)o+=ln('M'+xy(elbow)+'L'+F(tip.x-sign*k*6)+' '+F(tip.y-k*6),m.colors[1],1,.3)
 }
 if(u==='pincers'){
  o+=sPath('M'+F(wrist.x-10)+' '+F(wrist.y)+'Q'+F(finger.x-28)+' '+F(finger.y+8)+' '+F(finger.x+6)+' '+F(finger.y+10)+'Q'+F(finger.x+25)+' '+F(finger.y)+' '+F(finger.x+4)+' '+F(finger.y-14)+'Q'+F(finger.x+28)+' '+F(finger.y-30)+' '+F(wrist.x+9)+' '+F(wrist.y)+'Z','url(#v80edge)',m.colors[2],2.5)
 }else{
  const palm={x:(wrist.x+finger.x)/2,y:(wrist.y+finger.y)/2};
  o+=sPath(tube([wrist,palm,finger],[rad*.68,rad*.65,rad*.4]),'url(#v80edge)',m.colors[2],1.7);
  for(let k=-1;k<=2;k++){
   const x=finger.x+k*4,y=finger.y+(k===0?6:0);
   o+=ln('M'+F(wrist.x+k*3)+' '+F(wrist.y+12)+' Q'+F(x+3)+' '+F(y-10)+' '+F(x)+' '+F(y+5),m.colors[1],1.4,.59);
   if(u==='claws')o+=sPath('M'+F(x-2)+' '+F(y+2)+'l5 11l-7 -4Z','#eff9e8',m.colors[2],.8,.8)
  }
 }
 return o+'</g>'
}
function fish(m){
 const c=m.colors,side=m.view==='side',back=m.view==='back';
 const x=side?332:310,tip=side?{x:358,y:694}:{x:310,y:693};
 const hip={x:side?332:310,y:466},mid={x:side?356:309,y:598};
 const span=m.hip*.90,body=[hip,mid,tip];
 let o='<g data-v80-part="fish-tail">';
 o+=sPath(tube(body,[span,span*.53,4]),'url(#v80skin)',c[2],3.6);
 // Tail-fin is split into two independently curved lobes, no rectangle edges.
 for(const sign of [-1,1]){
  const dir=side?sign:back?-sign:sign;
  const finEnd={x:tip.x+dir*(side?108:144),y:728+(sign>0?9:-7)};
  o+=sPath('M'+xy(tip)+' Q'+F(tip.x+dir*61)+' '+F(tip.y-9)+' '+xy(finEnd)+
    ' Q'+F(tip.x+dir*114)+' '+F(tip.y+74)+' '+F(tip.x+dir*25)+' '+F(tip.y+55)+' Q'+F(tip.x+dir*11)+' '+F(tip.y+29)+' '+xy(tip)+'Z','url(#v80fin)',c[1],2.5,.92);
  for(let i=0;i<6;i++)o+=ln('M'+xy(tip)+'Q'+F(tip.x+dir*(51+i*9))+' '+F(tip.y+18+i*4)+' '+F(tip.x+dir*(103+i*6))+' '+F(tip.y+36+i*3),c[1],1.2,.38)
 }
 // Distinct scale rows follow a tapering fish tail, with configurable detail.
 for(let row=0;row<Math.round(5+m.detail*13);row++){
  let y=482+row*11.2,k=1-row/(18+.5);
  for(let j=-2;j<=2;j++){
   const px=(side?338:310)+(j+(row%2)*.5)*Math.max(4,13*k);
   o+=ln('M'+F(px-7*k)+' '+F(y)+'q'+F(7*k)+' 11 '+F(14*k)+' 0',c[1],1,.24+m.detail*.29)
  }
 }
 return o+'</g>'
}
function torso(m){
 const c=m.colors,view=m.view,side=view==='side';
 const sw=side?m.depth*.96:m.sw,wa=side?m.depth*.73:m.wa,hip=side?m.depth*.85:m.hip;
 const cx=310,z0=300;
 let d='M'+F(cx-sw)+' 286Q310 263 '+F(cx+sw)+' 286Q'+F(cx+sw+9)+' 302 '+F(cx+sw*.90)+' 337Q'+F(cx+wa*.82)+' 370 '+F(cx+wa)+' 418Q'+F(cx+hip+5)+' 450 '+F(cx+hip)+' 474Q310 490 '+F(cx-hip)+' 474Q'+F(cx-hip-7)+' 447 '+F(cx-wa)+' 418Q'+F(cx-wa*.9)+' 374 '+F(cx-sw*.9)+' 337Q'+F(cx-sw-9)+' 298 '+F(cx-sw)+' 286Z';
 const kind=m.race;
 let o='<g data-v80-part="torso">'+sPath(d,'url(#v80skin)',c[2],4);
 o+='<defs><clipPath id="v80bodyclip"><path d="'+d+'"/></clipPath></defs><g clip-path="url(#v80bodyclip)">';
 if(side){
  o+=ln('M'+F(cx-m.depth*.65)+' 303Q'+F(cx+m.depth*1.2)+' 318 '+F(cx+m.depth*.7)+' 366',c[1],2.2,.36);
  o+=ln('M'+F(cx-m.depth*.7)+' 316Q'+F(cx-m.depth*.92)+' 390 '+F(cx-m.depth*.4)+' 459',c[2],1.8,.39);
 }else{
  o+=ln('M'+F(cx-sw*.80)+' 304Q310 338 '+F(cx+sw*.80)+' 304',c[1],2.1,.4);
  o+=ln('M310 334Q305 385 310 422',c[1],1.9,.31);
  o+=ln('M'+F(cx-wa*.6)+' 431Q310 446 '+F(cx+wa*.6)+' 431',c[1],1.6,.26)
 }
 if(kind==='aquatic'||kind==='draconic'||m.skin==='scales'){
  for(let row=0;row<Math.round(6+9*m.detail);row++)for(let j=-3;j<=3;j++){
   const y=309+row*10.4,x=310+j*(side?12:15)+(row%2)*7;
   o+=ln('M'+F(x-7)+' '+F(y)+'q7 10 14 0',c[1],1,.26+m.detail*.21);
  }
 }else if(kind==='arboreal'||m.skin==='bark'){
  for(let j=0;j<Math.round(11+14*m.detail);j++){
   const x=275+(j*23)%74,y=284+(j*31)%157;
   o+=ln('M'+x+' '+y+'q'+(j%2?7:-5)+' 23 1 34',c[2],1.5,.38);
  }
 }else if(kind==='alien'||kind==='fae')for(let i=0;i<Math.round(10+13*m.detail);i++){
  const x=282+(i*17)%60,y=309+(i*31)%130;
  o+=circle(x,y,kind==='fae'?2.2:1.3,'url(#v80shine)',.55)
 }
 o+='</g></g>';return o
}
function head(m){
 const c=m.colors,side=m.view==='side',back=m.view==='back';
 const center=project(m,m.marks.head),cx=center.x,cy=center.y;
 const w=m.hw*(side?.98:1),h=m.race==='alien'?94:m.race==='draconic'?88:81;
 const top=cy-h,chin=cy+h*.82;
 let contour;
 if(side){
  const nose=m.headType==='dragon'?19:m.race==='alien'?11:9;
  contour='M'+F(cx-29)+' '+F(top+13)+'Q'+F(cx+19)+' '+F(top-9)+' '+F(cx+w*.81)+' '+F(top+41)+
    'Q'+F(cx+w*.92+nose)+' '+F(cy-15)+' '+F(cx+w*.83+nose)+' '+F(cy+11)+
    'L'+F(cx+w*.65)+' '+F(cy+26)+'Q'+F(cx+w*.90)+' '+F(cy+51)+' '+F(cx+w*.45)+' '+F(chin-4)+
    'Q'+F(cx-12)+' '+F(chin+6)+' '+F(cx-33)+' '+F(cy+32)+'Q'+F(cx-w*.73)+' '+F(cy-39)+' '+F(cx-29)+' '+F(top+13)+'Z';
 }else{
  contour='M'+F(cx)+' '+F(top)+'Q'+F(cx-w*.91)+' '+F(top-8)+' '+F(cx-w)+' '+F(cy-27)+
    'Q'+F(cx-w*1.01)+' '+F(cy+21)+' '+F(cx-w*.64)+' '+F(cy+43)+
    'Q'+F(cx-w*.44)+' '+F(chin-3)+' '+F(cx)+' '+F(chin)+
    'Q'+F(cx+w*.45)+' '+F(chin-3)+' '+F(cx+w*.64)+' '+F(cy+43)+
    'Q'+F(cx+w*1.01)+' '+F(cy+21)+' '+F(cx+w)+' '+F(cy-27)+
    'Q'+F(cx+w*.91)+' '+F(top-8)+' '+F(cx)+' '+F(top)+'Z'
 }
 let o='<g data-v80-part="head">';
 // Species-specific ears sit BEHIND the cranium.
 if(m.headType!=='dragon')for(const sign of [-1,1]){
  if(side&&sign<0)continue;
  const ex=cx+sign*w*.90,ey=cy-10;
  if(m.headType==='aquatic'){
   o+=sPath('M'+F(ex)+' '+F(ey-27)+'Q'+F(ex+sign*69)+' '+F(ey-89)+' '+F(ex+sign*85)+' '+F(ey-51)+
     'L'+F(ex+sign*35)+' '+F(ey+35)+'Z','url(#v80fin)',c[1],2,.77)
  }else{
   o+=sPath('M'+F(ex)+' '+F(ey-32)+'Q'+F(ex+sign*41)+' '+F(ey-76)+' '+F(ex+sign*68)+' '+F(ey-109)+
      'Q'+F(ex+sign*61)+' '+F(ey+20)+' '+F(ex)+' '+F(ey+21)+'Z','url(#v80edge)',c[2],1.9,.86)
  }
 }
 o+=sPath(contour,'url(#v80skin)',c[2],3.9);
 if(back){
  o+=ln('M'+F(cx-15)+' '+F(top+12)+'Q'+F(cx-30)+' '+F(cy-15)+' '+F(cx-12)+' '+F(chin-11),c[1],2,.27);
  o+=ln('M'+F(cx+17)+' '+F(top+12)+'Q'+F(cx+33)+' '+F(cy-15)+' '+F(cx+10)+' '+F(chin-11),c[2],2,.27)
 }else{
  const eyeY=cy-13,eyes=+m.eyeCount===1?[0]:+m.eyeCount===4?[-.68,-.25,.25,.68]:[-.43,.43];
  for(const fac of eyes){
   const x=cx+(side?w*.53:fac*w),rx=(side?11:Math.max(7,w*.23))*(eyes.length===4?.76:1);
   if(side&&fac<0)continue;
   const y=eyeY+(eyes.length===4&&Math.abs(fac)<.5?17:0);
   const d='M'+F(x-rx)+' '+F(y)+'Q'+F(x)+' '+F(y-10)+' '+F(x+rx)+' '+F(y)+
     'Q'+F(x)+' '+F(y+9)+' '+F(x-rx)+' '+F(y)+'Z';
   o+=sPath(d,m.face==='blank'?'url(#v80edge)':'#e4f7ef',c[2],1.9);
   if(m.face!=='blank'){
    const vertical=m.face==='slit'||m.headType==='dragon';
    o+=ellipse(x,y,vertical?2.3:5.2,vertical?7.1:5.3,'#184c60');
    o+=circle(x-2,y-3,1.8,'#fff')
   }
   o+=ln('M'+F(x-rx-2)+' '+F(y-13)+'Q'+F(x)+' '+F(y-20)+' '+F(x+rx+2)+' '+F(y-12),c[2],2.1,.44)
  }
  if(!side){
   o+=ln('M'+F(cx)+' '+F(cy+4)+'q-6 17 1 21q5 2 12 -1',c[2],1.8,.48);
   o+=ln('M'+F(cx-15)+' '+F(cy+43)+'Q'+F(cx)+' '+F(cy+51)+' '+F(cx+15)+' '+F(cy+43),c[2],2,.64)
  }else{
   o+=ln('M'+F(cx+w*.63)+' '+F(cy+33)+'q-12 9 -21 4',c[2],1.9,.61)
  }
  if(m.headType==='aquatic')for(const sign of [-1,1]){
   const ex=side?cx+w*.42:cx+sign*w*.76;if(side&&sign<0)continue;
   for(let i=0;i<3;i++)o+=ln('M'+F(ex)+' '+F(cy+i*9)+'l'+F(sign*12)+' -3',c[1],1.6,.51)
  }
 }
 // Horns join to the cranium at world-space sockets, consistent across views.
 if(['pair','single','antlers'].includes(m.horns)){
  const signs=m.horns==='single'?[0]:[-1,1];
  for(const sign of signs){
   if(side&&sign<0)continue;
   const x=cx+(side?14:sign*w*.51);
   const y=top+14;
   const dx=side?22:sign*43;
   o+=sPath('M'+F(x-10)+' '+F(y+3)+'Q'+F(x+dx*.14)+' '+F(y-31)+' '+F(x+dx)+' '+F(y-88)+
     'Q'+F(x+dx*.65)+' '+F(y-26)+' '+F(x+12)+' '+F(y+3)+'Z','url(#v80edge)',c[1],2.2);
   if(m.horns==='antlers')for(let k=0;k<3;k++)o+=ln('M'+F(x+dx*.3+k*dx*.17)+' '+F(y-22-k*18)+
     'Q'+F(x+dx*.55+sign*17)+' '+F(y-47-k*19)+' '+F(x+dx*.74+sign*24)+' '+F(y-66-k*19),c[1],3.2,.78)
  }
 }
 o+='</g>';return o
}
function neck(m){
 const p=project(m,m.marks.neck),head=project(m,m.marks.head);
 const width=m.race==='draconic'?[23,27,33]:m.race==='fae'?[12,16,24]:[15,20,28];
 return '<g data-v80-part="neck">'+
 sPath(tube([{x:p.x,y:head.y+58},{x:p.x,y:p.y+14},{x:p.x,y:p.y+67}],width),'url(#v80skin)',m.colors[2],1.9)+
 ln('M'+F(p.x-5)+' '+F(head.y+70)+'Q'+F(p.x-8)+' '+F(p.y+3)+' '+F(p.x-6)+' '+F(p.y+38),m.colors[1],1.5,.24)+'</g>'
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
if(badge)badge.textContent='SVG-анатомия · единый каркас · v0.8.0';
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
window.AtlasRig080={version:'0.8.0',getModel:()=>rig(s),getFit:()=>{
 const g=document.querySelector('[data-v80-fit]');return g?{fitted:g.dataset.fitted,nominal:Number(g.dataset.nominal),actual:Number(g.dataset.actual)}:null},
 render:()=>render(false)};
})();