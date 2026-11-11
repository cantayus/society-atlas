/* Isometric scene rendering. All scenery consists of deterministic Canvas geometry. */
(()=>{'use strict';
// Plain scenic color markers identify the institution without reproducing a seal,
// official flag, trademarked crest, or an asserted historical sign design.
const institutionColors={penn:['#2c4564','#963e43'],harvard:['#913c46','#d9c9aa'],indiana:['#922e3e','#e0d5ba'],ucla:['#5685a4','#c8aa5d'],notreDame:['#2d425a','#c4a25a'],columbia:['#8db4c6','#e3dcc5'],mit:['#8d3e49','#b3b5ac'],northeastern:['#963a3e','#404c46'],stanford:['#913d46','#d9ccb0'],pennState:['#304f6f','#e5e0ce'],washu:['#a3433d','#627b59'],cmu:['#963b3c','#aaa99a'],princeton:['#c17b42','#39423b']};
function identityItems(ctx,e,profile,scale){
 const landmark=e.buildings.find(b=>b.type==='landmark')||e.buildings[0];if(!landmark)return[];
 const source=window.CAMPUS_LANDMARKS?.byEncounter?.[e.active.id],name=source?.campus||e.active.campus||'University campus';
 const palette=institutionColors[profile.key]||['#775b47','#c0b18c'],front=landmark.y+landmark.h,depth=landmark.x+landmark.w+front;
 const lines=[];if(name.length>28){const words=name.split(' '),target=name.length/2;let first='',rest=[];for(const word of words){if(first.length<target)first+=(first?' ':'')+word;else rest.push(word);}lines.push(first,rest.join(' '));}else lines.push(name);
 const items=[];
 const plaque=()=>{
  const p=e.iso(landmark.x+landmark.w*.50,front+1.14);ctx.save();ctx.font='600 12.5px Georgia';
  const measured=Math.max(...lines.map(s=>ctx.measureText(s).width)),width=Math.min(290,Math.max(174,measured+34)),height=lines.length>1?46:33;
  // Low stone base, dark bronze face, highlighted edge and two worn stone feet.
  ctx.fillStyle='#293e2b25';ctx.beginPath();ctx.ellipse(p.x+6,p.y+15,width*.53,12,0,0,Math.PI*2);ctx.fill();
  for(const dx of[-width*.38,width*.38]){ctx.fillStyle='#89856e';ctx.fillRect(p.x+dx-6,p.y-5,12,19);ctx.fillStyle='#bbb197';ctx.fillRect(p.x+dx-8,p.y+9,17,5);}
  const gx=p.x-width/2,gy=p.y-height-3;
  e.poly([[gx,gy+height],[gx+width,gy+height],[gx+width+5,gy+height+4],[gx+5,gy+height+4]],'#746c55');
  e.poly([[gx+width,gy],[gx+width+5,gy+4],[gx+width+5,gy+height+4],[gx+width,gy+height]],'#645e4a');
  ctx.fillStyle='#a69b7f';ctx.fillRect(gx-2,gy-2,width+4,height+3);
  const bronze=ctx.createLinearGradient(gx,gy,gx,gy+height);bronze.addColorStop(0,'#786a48');bronze.addColorStop(.42,'#665a3c');bronze.addColorStop(1,'#524c37');ctx.fillStyle=bronze;ctx.fillRect(gx+1,gy+1,width-2,height-2);
  ctx.strokeStyle='#c0ac77';ctx.lineWidth=.65;ctx.strokeRect(gx+5,gy+5,width-10,height-10);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 12.5px Georgia';
  lines.forEach((text,i)=>{const ty=gy+(lines.length>1?15+i*16:height/2);ctx.fillStyle='#242f27';ctx.fillText(text,p.x+.7,ty+.8);ctx.fillStyle='#e7d9b6';ctx.fillText(text,p.x,ty);});
  for(const xx of[gx+8,gx+width-8]){ctx.fillStyle='#b3a073';ctx.beginPath();ctx.arc(xx,gy+8,1,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(xx,gy+height-8,1,0,Math.PI*2);ctx.fill();}
  ctx.restore();
 };
 items.push({depth:depth+.9,draw:plaque});
 for(const [n,xx]of[landmark.x+.55,landmark.x+landmark.w-.50].entries()){
  items.push({depth:depth+.45+n*.02,draw:()=>{
   const p=e.iso(xx,front+.72),wave=e.settings.reduced?0:Math.sin(e.time*.65+e.active.id+n)*1.35;
   ctx.save();ctx.strokeStyle='#736d54';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(p.x,p.y+8);ctx.lineTo(p.x,p.y-49);ctx.stroke();ctx.strokeStyle='#c1b393';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(p.x-.7,p.y+7);ctx.lineTo(p.x-.7,p.y-49);ctx.stroke();
   e.poly([[p.x-6,p.y+8],[p.x+6,p.y+8],[p.x+8,p.y+11],[p.x-4,p.y+11]],'#a69f83');
   ctx.fillStyle='#b0a17a';ctx.beginPath();ctx.arc(p.x,p.y-50,1.7,0,Math.PI*2);ctx.fill();
   const top=p.y-46;ctx.fillStyle=palette[0];ctx.beginPath();ctx.moveTo(p.x+1,top);ctx.bezierCurveTo(p.x+8,top-2,p.x+17,top+3+wave,p.x+24,top+wave);ctx.lineTo(p.x+24,top+25+wave);ctx.bezierCurveTo(p.x+15,top+28+wave,p.x+8,top+23,p.x+1,top+25);ctx.closePath();ctx.fill();
   ctx.fillStyle=palette[1];ctx.beginPath();ctx.moveTo(p.x+1,top+20);ctx.bezierCurveTo(p.x+8,top+18,p.x+17,top+23+wave,p.x+24,top+20+wave);ctx.lineTo(p.x+24,top+25+wave);ctx.bezierCurveTo(p.x+15,top+28+wave,p.x+8,top+23,p.x+1,top+25);ctx.closePath();ctx.fill();
   ctx.strokeStyle='#eee3bc35';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(p.x+6,top+1);ctx.quadraticCurveTo(p.x+8,top+12,p.x+6,top+23);ctx.stroke();ctx.strokeStyle='#263d302e';ctx.beginPath();ctx.moveTo(p.x+14,top+2);ctx.quadraticCurveTo(p.x+12,top+14,p.x+15,top+25);ctx.stroke();ctx.restore();
  }});
 }
 // MIT's river edge has a modest quay railing. This scenery never changes routes.
 if(profile.river)for(let yy=3;yy<25;yy+=2){items.push({depth:26+yy,draw:()=>{const p=e.iso(25.65,yy),q=e.iso(25.65,yy+2);ctx.save();ctx.strokeStyle='#646f68';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(p.x,p.y+12);ctx.lineTo(p.x,p.y-8);ctx.moveTo(p.x,p.y-7);ctx.lineTo(q.x,q.y-7);ctx.moveTo(p.x,p.y+1);ctx.lineTo(q.x,q.y+1);ctx.stroke();ctx.strokeStyle='#c6c5ad';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(p.x-.7,p.y-8);ctx.lineTo(q.x-.7,q.y-8);ctx.stroke();ctx.restore();}});}
 return items;
}
function neighborhood(e,profile){const urban=profile.urban||profile.key==='harvard',sites=urban?[[-5,2,3,4],[-5,8,3,4],[-5,15,3,5],[4,-6,5,3],[11,-6,5,3],[20,-6,4,3],[28,8,3,5],[28,18,3,5]]:[[1,-5,7,3],[12,-5,7,3],[28,14,4,7]];return sites.map(([x,y,w,h],i)=>({x,y,w,h,height:urban?45+i%3*11:48,type:urban&&profile.key==='penn'?'rowhouse':'archive',wall:e.shade(e.buildings[0].wall,i%2?7:-9),roof:e.buildings[0].roof,style:profile.key==='northeastern'?'urban':'hall'}));}
function hull(points){const p=points.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],hi=[];for(const q of p){while(lo.length>1&&cross(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}for(const q of p.slice().reverse()){while(hi.length>1&&cross(hi[hi.length-2],hi[hi.length-1],q)<=0)hi.pop();hi.push(q);}return lo.slice(0,-1).concat(hi.slice(0,-1));}
function paintSurface(c,e,profile,neighbors){const {iso,hash,shade,N,TW,TH}=e,poly=(pts,fill)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();if(fill){c.fillStyle=fill;c.fill();}},diamond=(x,y,fill)=>{const p=iso(x,y);poly([[p.x,p.y],[p.x+TW/2,p.y+TH/2],[p.x,p.y+TH],[p.x-TW/2,p.y+TH/2]],fill);};
for(let sum=-16;sum<N*2+17;sum++)for(let x=-8;x<N+8;x++){const y=sum-x;if(y< -8||y>=N+8)continue;const inside=x>=0&&x<N&&y>=0&&y<N,r=hash(x+31,y+31),road=!inside&&(x===-2||y===28||y===-3),base=road?'#777268':(profile.lawn||'#73824f');diamond(x,y,shade(base,Math.floor(r*7)-3));if(!inside&&!road){const p=iso(x,y);for(let n=0;n<7;n++){const xx=p.x+(hash(x*11+n,y)*44-22),yy=p.y+7+hash(y*7+n,x)*17;c.fillStyle=n%3?'#152c1512':'#cbd09a16';c.fillRect(xx,yy,1+hash(n+x,y)*3,.7);}}}
window.CampusAtmosphere?.drawGround(c,{...e,id:e.active.id,time:0,reduced:true,poly});
// One late-afternoon sun direction, with real footprint-projected cast shadows.
for(const b of [...e.buildings,...neighbors]){const q=[[b.x,b.y],[b.x+b.w,b.y],[b.x+b.w,b.y+b.h],[b.x,b.y+b.h]].map(([x,y])=>{const p=iso(x,y);return[p.x,p.y+5];}),z=b.height||74,dx=z*.62,dy=z*.24,shape=hull([...q,...q.map(([x,y])=>[x+dx,y+dy])]);c.save();c.shadowColor='#17211245';c.shadowBlur=3;poly(shape,'#14201228');c.shadowBlur=0;poly(q,'#17200f24');c.restore();}
}
function gadgetItem(ctx,e){if(!window.CampusPlay)return null;const x=11,y=17,p=e.iso(x,y);return{depth:x+y+.8,draw:()=>{ctx.save();ctx.fillStyle='#18271738';ctx.beginPath();ctx.ellipse(p.x+8,p.y+18,36,11,0,0,Math.PI*2);ctx.fill();for(const dx of[-24,21]){ctx.fillStyle='#4b3420';ctx.fillRect(p.x+dx,p.y-6,4,28);}e.poly([[p.x-34,p.y-15],[p.x+9,p.y+5],[p.x+36,p.y-9],[p.x-7,p.y-29]],'#9c6b35','#4e3925');e.poly([[p.x-34,p.y-15],[p.x+9,p.y+5],[p.x+9,p.y+10],[p.x-34,p.y-10]],'#66401e');ctx.strokeStyle='#c7ac65';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x-24,p.y-18);ctx.lineTo(p.x+1,p.y-6);ctx.lineTo(p.x+21,p.y-18);ctx.stroke();ctx.strokeStyle='#5c4c30';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x-24,p.y-20);ctx.lineTo(p.x+1,p.y-8);ctx.lineTo(p.x+21,p.y-20);ctx.stroke();const f=e.settings.reduced?.5:(Math.sin(e.time*.8)+1)/2;ctx.fillStyle='#bd643f';ctx.beginPath();ctx.arc(p.x-22+f*38,p.y-22+Math.sin(f*Math.PI)*8,4,0,Math.PI*2);ctx.fill();ctx.save();ctx.translate(p.x+20,p.y-12);ctx.rotate(e.settings.reduced?0:e.time*.4);ctx.strokeStyle='#bf9d50';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.stroke();for(let n=0;n<6;n++){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.moveTo(3,0);ctx.lineTo(12,0);ctx.stroke();}ctx.restore();ctx.fillStyle='#e2cd93';ctx.fillRect(p.x-13,p.y-26,8,8);ctx.strokeStyle='#795b2b';ctx.strokeRect(p.x-13,p.y-26,8,8);ctx.restore();}};}
function draw(ctx,e){const {canvas,mode,active,grid,buildings,known,player,path,cam,settings,iso,poly,shade,diamond,hash,drawBuilding,drawPerson,label,N,TW,TH,time}=e;if(!grid)return;
 const W=canvas.clientWidth,H=canvas.clientHeight,menu=mode==='menu',a=window.CampusAtmosphere;
 const profile=a?.profile(active.id)||{},env={iso,poly,shade,hash,id:active.id,grid,N,TW,TH,time,reduced:settings.reduced};
 ctx.clearRect(0,0,W,H);ctx.fillStyle=profile.backdrop||'#787e63';ctx.fillRect(0,0,W,H);
 const z=menu?Math.max(.62,Math.min(1.15,Math.min(W/1370,H/890))):e.zoom;
 const camera=menu?iso(12,14):cam;
 ctx.save();ctx.translate(W*(menu?.68:.57),H*(menu?.55:.52));ctx.scale(z,z);ctx.translate(-camera.x,-camera.y);
 const neighbors=neighborhood(e,profile),paint=window.ScenePaint,weather=window.CampusWeather,weatherEnv={...e,id:active.id,width:W,height:H,zoom:z,cam:camera,reduced:settings.reduced,enabled:settings.weather!==false};paint?.begin(active.id);if(paint)paint.ground(ctx,c=>paintSurface(c,e,profile,neighbors));else paintSurface(ctx,e,profile,neighbors);weather?.ground(ctx,weatherEnv);
 // Stone edges give the impassable stair shortcut a visible reason and preserve the eastern route.
 for(const [x,y]of[[14,9],[14,10]]){const p=iso(x,y);poly([[p.x-20,p.y+7],[p.x+12,p.y+22],[p.x+12,p.y+12],[p.x-20,p.y-3]],'#877f68','#645c48');ctx.strokeStyle='#8c4e34';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x-14,p.y-9);ctx.lineTo(p.x+15,p.y+6);ctx.stroke();ctx.fillStyle='#b9a172';ctx.fillRect(p.x-16,p.y-11,3,18);ctx.fillRect(p.x+14,p.y+3,3,18);}
 if(!menu&&path.length){ctx.strokeStyle='#dfc381';ctx.lineWidth=2;ctx.setLineDash([3,5]);ctx.beginPath();let p=iso(player.x,player.y);ctx.moveTo(p.x,p.y+14);for(const n of path){p=iso(n.x,n.y);ctx.lineTo(p.x,p.y+14);}ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.ellipse(p.x,p.y+14,13,6,0,0,Math.PI*2);ctx.stroke();}
 const life=window.CampusLife,lifeEnv={...env,mode,year:active.year,player,path,selected:e.selected,paused:e.paused};const props=[...(a?.props(env)||[]),...(life?.props(lifeEnv)||[])],items=buildings.map(b=>({depth:b.x+b.w+b.y+b.h,draw:()=>{ctx.save();const near=!menu&&player.x>b.x-1&&player.x<b.x+b.w+1&&player.y>b.y-1&&player.y<b.y+b.h-.4;if(near)ctx.globalAlpha=.6;if(!paint?.building(ctx,b,{iso,shade}))drawBuilding(b);ctx.restore();}}));
 neighbors.forEach(b=>items.push({depth:b.x+b.y+b.w+b.h,draw:()=>{if(!paint?.building(ctx,b,{iso,shade}))drawBuilding(b);}}));
 items.push(...identityItems(ctx,e,profile,z));
 const gadget=gadgetItem(ctx,e);if(gadget)items.push(gadget);
 props.forEach((p,i)=>items.push({depth:p.depth,draw:()=>{if(!paint?.prop(ctx,p,i,{iso,shade}))p.draw(ctx);}}));
 if(life)items.push(...life.people(ctx,lifeEnv));else if(!menu)items.push({depth:player.x+player.y+1,draw:()=>drawPerson(player.x,player.y,'#365447',true,time)});
 items.sort((p,q)=>p.depth-q.depth).forEach(i=>i.draw());
 // Notice board: timber legs, brass frame, overlapping paper notices, and a little wear.
 const p=iso(12,20);ctx.fillStyle='#544638';ctx.fillRect(p.x-16,p.y-29,3,43);ctx.fillRect(p.x+13,p.y-29,3,43);ctx.fillStyle='#847348';ctx.fillRect(p.x-22,p.y-39,44,25);ctx.fillStyle='#4d4936';ctx.fillRect(p.x-19,p.y-36,38,19);for(let i=0;i<4;i++){ctx.fillStyle=['#dfd4b0','#bcb28f','#c6be9c','#d7c7a0'][i];ctx.fillRect(p.x-15+(i%2)*16,p.y-33+Math.floor(i/2)*8,13,6);ctx.fillStyle='#80745c';ctx.fillRect(p.x-13+(i%2)*16,p.y-31+Math.floor(i/2)*8,8,1);}
 if(!menu){label(12,21.35,'SOUTH-PLAZA DIRECTORY',true);label(6,17,'ARCHIVE');label(20,18,'LIBRARY');if(window.CampusPlay)label(11,18.2,'CAMPUS WORKSHOP');if(e.clues.includes(active.id))label(20,9,active.id===1?'FIELDWORK CONTACT':'RESEARCH ENTRANCE',true);}
 // A quiet cast of warm late-afternoon light ties the architecture and vegetation together.
 ctx.restore();const light=ctx.createLinearGradient(0,0,W,H);light.addColorStop(0,'#ffe7ac06');light.addColorStop(.55,'#00000000');light.addColorStop(1,'#13251915');ctx.fillStyle=light;ctx.fillRect(0,0,W,H);weather?.screen(ctx,weatherEnv);
 const mini=document.getElementById('minimap');if(mini&&!menu){const m=mini.getContext('2d');m.fillStyle='#777e60';m.fillRect(0,0,324,224);for(let y=0;y<N;y++)for(let x=0;x<N;x++){m.fillStyle=grid[y][x]===1?'#6d6250':grid[y][x]===2?'#5e7255':'#b5aa82';m.globalAlpha=known.has(y*N+x)?1:.45;m.fillRect(x*324/N,y*224/N,324/N+1,224/N+1);}m.globalAlpha=1;m.fillStyle='#e7cc86';m.beginPath();m.arc(player.x*324/N,player.y*224/N,5,0,Math.PI*2);m.fill();m.fillStyle='#f3ead1';m.fillRect(12*324/N-2,20*224/N-2,4,4);}
}
window.AtlasWorld={draw};})();
