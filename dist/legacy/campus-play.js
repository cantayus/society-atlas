/* Optional campus diversions. Original code, drawings and jokes; no generated
   assets, model calls, historical quotations, grades, or campaign requirements. */
(function(){'use strict';
const jokes={
  1:'My notebook now has a category for “things I forgot to ask.” It is proving surprisingly productive.',
  2:'I rearranged the household tokens. The biscuits formed a cluster of their own, entirely around the teapot.',
  3:'I asked three close friends to bring something new. We now have three copies of the same seminar notice.',
  4:'The watering can and I have agreed on a maintenance rule. It will stop leaking as soon as I repair it.',
  5:'I drew an arrow from coffee to productivity. The kettle has requested a control group.',
  6:'Our growing network developed an impressive hub. It is the node holding everybody’s coats.',
  7:'Eight musical worlds, eight different charts. The headphones are beginning to request separate dressing rooms.',
  8:'The notice said “bring a friend.” Apparently the network interpreted that as a threshold parameter.',
  9:'The archive is wonderfully quiet. Unfortunately, quiet is also one of the things we are trying to explain.',
  10:'The dashboard was beautifully smooth. Then somebody moved Tuesday.',
  11:'The detector found every car and missed my question. We are revisiting the annotation guidelines.',
  12:'The classifier called my cheerful complaint “support.” I have filed a very politely worded disagreement.',
  13:'I suggested a shared lunch table. The network model asked whether lunch was a latent variable.',
  14:'I searched for the best biscuit until the tea went cold. Tomorrow’s stopping rule will include temperature.',
  15:'The mug is half full of tea and half empty of tea. Both descriptions suggest that another pot would be welcome.',
  16:'The seminar allocation is stable. The stack of preference cards is not. That may need a different algorithm.',
  17:'Before we scale the biscuit scheme, perhaps we should check whether the next study site has a kettle.',
  18:'The committee has agreed on who may move the table. We can now investigate why it still wobbles.'
};
const names=[
 ['The field-note postcard press','press'],['The neighborhood marble run','marbles'],['The invitation lanterns','lamps'],['The Workshop water table','water'],
 ['The arrow-room animation wheel','zoetrope'],['The growing constellation board','lamps'],['The listening-room zoetrope','zoetrope'],['The courtyard lantern relay','lamps'],
 ['The archive postcard press','press'],['The forecast marble return','marbles'],['The viewfinder marble garden','marbles'],['The codebook postcard press','press'],
 ['The bridge-light workbench','lamps'],['The good-enough marble sorter','marbles'],['The two-way animation wheel','zoetrope'],['The seminar-seat marble run','marbles'],
 ['The partners’ channel workshop','water'],['The commons channel table','water']
];
const descriptions={marbles:'Nudge the funnel, tilt the board, and let the pegs make a small mess of your plans.',water:'Turn the little headgates and send water down different channels. The spill tray is very forgiving.',press:'Choose a type block, ink and stamp. Four quarter-turns of the crank make a research postcard.',lamps:'Open and close the relay switches. See which courtyard lanterns your wiring can reach.',zoetrope:'Turn a wheel of twelve drawings into one small walk. Slow it, reverse it, or inspect a single frame.'};
function gadget(id){const [name,kind]=names[(+id||1)-1]||names[0];return{name,kind,description:descriptions[kind],x:11,y:17,footnote:'Fictional campus installation · optional play, with no score or research requirement'};}
function rng(seed){let s=(seed>>>0)||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};}
function flow(gates,source=12){const ratios=[0,.5,1],left=ratios[gates[0]],a=ratios[gates[1]],b=ratios[gates[2]];return[source*left*a,source*left*(1-a),source*(1-left)*b,source*(1-left)*(1-b)];}
function lampEdges(mode){const edges=[[0,1],[1,2],[2,3],[3,4],[4,0],[0,2],[5,6],[6,7],[7,8],[8,9],[9,5],[5,7]];if(mode!==1)edges.push([4,5]);if(mode===2)edges.push([1,8]);return edges;}
function litNodes(s){const edges=lampEdges(s.wiring),sources=s.power===0?[0]:s.power===1?[5]:[0,5],lit=new Set(sources.filter(i=>s.switches[i])),q=[...lit];for(let n=0;n<q.length;n++)for(const[a,b]of edges){const next=a===q[n]?b:b===q[n]?a:-1;if(next>=0&&s.switches[next]&&!lit.has(next)){lit.add(next);q.push(next);}}return[...lit].sort((a,b)=>a-b);}
function pegs(seed){const r=rng(seed),out=[];for(let row=0;row<6;row++)for(let col=0;col<8;col++)out.push({x:100+col*68+(row%2)*30+(r()-.5)*12,y:65+row*32+(r()-.5)*7,r:5});return out;}
function stepBall(ball,dt,boardPegs,tilt=0){
  // Semi-implicit Euler, wall reflection and circular peg impulses. Fixed small
  // substeps keep a released marble from tunnelling through a peg.
  const steps=Math.max(1,Math.ceil(dt/(1/180))),h=dt/steps;
  for(let k=0;k<steps;k++){
    ball.vx+=tilt*120*h;ball.vy+=310*h;ball.x+=ball.vx*h;ball.y+=ball.vy*h;
    if(ball.x<25+ball.r){ball.x=25+ball.r;ball.vx=Math.abs(ball.vx)*.72;}
    if(ball.x>695-ball.r){ball.x=695-ball.r;ball.vx=-Math.abs(ball.vx)*.72;}
    for(const p of boardPegs){const dx=ball.x-p.x,dy=ball.y-p.y,d=Math.hypot(dx,dy),reach=ball.r+p.r;if(d<reach){const nx=d>1e-7?dx/d:1,ny=d>1e-7?dy/d:0;ball.x=p.x+nx*(reach+.05);ball.y=p.y+ny*(reach+.05);const v=ball.vx*nx+ball.vy*ny;if(v<0){ball.vx-=1.55*v*nx;ball.vy-=1.55*v*ny;}}}
  }
  return ball;
}
const postcardLines=[
 ['This postcard was sampled with replacement. The biscuit was not.','The map asked for directions. We agreed to compare notes.'],
 ['The bridge connects two groups: people with tea, and people seeking tea.','Please send this along a tie that has not already received it.'],
 ['Please handle assumptions with care. They are load-bearing.','One useful question. Several interesting complications.']
];
function createToy(kind,seed=17,reduced=false){
  let random=rng(seed);const initial=()=>({kind,seed,paused:!!reduced,time:0,balls:[],bins:[0,0,0],funnel:360,tilt:0,pegs:pegs(seed),gates:[1,0,2],bowls:[0,0,0,0],spill:0,boost:0,type:0,ink:0,stamp:0,turns:0,cards:[],pressing:0,switches:Array(10).fill(true),power:0,wiring:0,phase:0,speed:1,direction:1});
  const s=initial();let serial=0;
  function tick(dt,force=false){if(s.paused&&!force)return;dt=Math.max(0,Math.min(.1,+dt||0));s.time+=dt;
    if(kind==='marbles'){const remaining=[];for(const b of s.balls){stepBall(b,dt,s.pegs,s.tilt);if(b.y>282){s.bins[Math.min(2,Math.max(0,Math.floor((b.x-25)/(670/3))))]++;}else remaining.push(b);}s.balls=remaining;}
    if(kind==='water'){const rates=flow(s.gates,s.boost>0?24:12);for(let n=0;n<4;n++){const next=s.bowls[n]+rates[n]*dt;s.spill+=Math.max(0,next-70);s.bowls[n]=Math.min(70,next);}s.boost=Math.max(0,s.boost-dt);}
    if(kind==='press')s.pressing=Math.max(0,s.pressing-dt);
    if(kind==='zoetrope')s.phase=((s.phase+dt*s.speed*s.direction*2.2)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
  }
  function act(action,value){let message='';
    if(action==='reset'){Object.assign(s,initial());random=rng(seed);serial=0;return'A fresh tabletop. Nothing important has been lost.';}
    if(action==='pause'){s.paused=!s.paused;return s.paused?'The workshop is holding that thought.':'Back to gently unnecessary experimentation.';}
    if(action==='step'){for(let n=0;n<30;n++)tick(1/60,true);return'One small step for the mechanism.';}
    if(kind==='marbles'){
      if(action==='release'||action==='handful'){for(let n=0;n<(action==='handful'?5:1);n++)if(s.balls.length<30)s.balls.push({id:serial++,x:s.funnel+(random()-.5)*10,y:25-random()*10,vx:(random()-.5)*34,vy:0,r:6,color:serial%4});message=s.paused?'Marbles ready. Use Step toy or let the board run.':'A perfectly respectable small cascade.';}
      if(action==='funnel-left'||action==='funnel-right'){s.funnel=Math.max(80,Math.min(640,s.funnel+(action==='funnel-left'?-45:45)));message='The funnel has a new point of view.';}
      if(action==='tilt-left'||action==='tilt-right'){s.tilt=Math.max(-1,Math.min(1,s.tilt+(action==='tilt-left'?-.25:.25)));message='The board leans '+(s.tilt<0?'left':s.tilt>0?'right':'neither way')+'. The marbles remain politely noncommittal.';}
      if(action==='shuffle'){s.pegs=pegs(seed+Math.floor(random()*100000));message='The pegs have rearranged their seating plan.';}
    }
    if(kind==='water'){
      if(action==='gate'){const n=+value;if(n>=0&&n<3)s.gates[n]=(s.gates[n]+1)%3;message='A headgate turns. The channels take the hint.';}
      if(action==='rain'){s.boost=4;message='A brief shower. The spill tray has volunteered to help.';}
    }
    if(kind==='press'){
      if(action==='type'){s.type=(s.type+1)%3;message='A different type block, with equally questionable handwriting.';}
      if(action==='ink'){s.ink=(s.ink+1)%3;message='Fresh ink: '+['sepia','moss green','ink blue'][s.ink]+'.';}
      if(action==='stamp'){s.stamp=(s.stamp+1)%3;message='Stamp changed. The stationery committee approves.';}
      if(action==='crank'||action==='print'){s.turns+=action==='print'?4:1;s.pressing=.65;if(s.turns>=4){s.turns%=4;const card={line:postcardLines[s.type][s.cards.length%2],ink:s.ink,stamp:s.stamp,id:serial++};s.cards.unshift(card);s.cards=s.cards.slice(0,5);message='Postcard printed: “'+card.line+'”';}else message='Quarter-turn '+s.turns+' of 4. The press is considering its wording.';}
    }
    if(kind==='lamps'){
      if(action==='switch'){const n=+value;if(n>=0&&n<10)s.switches[n]=!s.switches[n];message='Relay '+String.fromCharCode(65+n)+' is '+(s.switches[n]?'closed':'open')+'. '+litNodes(s).length+' lanterns glow.';}
      if(action==='power'){s.power=(s.power+1)%3;message='Power comes from '+['the west courtyard','the east courtyard','both courtyards'][s.power]+'.';}
      if(action==='wiring'){s.wiring=(s.wiring+1)%3;message=['One bridge links the courtyards.','The bridge is disconnected.','Two bridges link the courtyards.'][s.wiring];}
    }
    if(kind==='zoetrope'){
      if(action==='faster'){s.speed=Math.min(3,s.speed+.25);message='A little more bustle in the drawings.';}
      if(action==='slower'){s.speed=Math.max(.25,s.speed-.25);message='The drawings take a more leisurely walk.';}
      if(action==='reverse'){s.direction*=-1;message='Same drawings, opposite itinerary.';}
    }
    return message||'The tabletop is ready when you are.';
  }
  function summary(){if(kind==='marbles')return`${s.balls.length} rolling · trays: ${s.bins.join(' / ')} · board tilt ${s.tilt.toFixed(2)}`;if(kind==='water')return`Channel flow: ${flow(s.gates,s.boost>0?24:12).map(n=>n.toFixed(1)).join(' / ')} · spill tray: ${s.spill.toFixed(0)}`;if(kind==='press')return`${['Sampling','Connections','Assumptions'][s.type]} type · ${['Sepia','Moss','Blue'][s.ink]} ink · crank ${s.turns}/4 · ${s.cards.length} postcards on the table`;if(kind==='lamps')return`${litNodes(s).length} of 10 lanterns glowing · ${['one bridge','bridge disconnected','two bridges'][s.wiring]}`;return`${s.speed.toFixed(2)}× speed · ${s.direction>0?'forward':'reverse'} · drawing ${Math.floor(s.phase/(Math.PI*2)*12)+1} of 12`;}
  return{state:s,act,tick,summary,snapshot:()=>JSON.parse(JSON.stringify(s))};
}
function shape(c,pts,fill,stroke){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
function line(c,points,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();}
function circle(c,x,y,r,fill,stroke){c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
const lampPoints=[[100,95],[175,45],[250,100],[230,205],[125,215],[470,100],[545,45],[620,100],[600,210],[490,215]];
function draw(c,s){c.clearRect(0,0,720,320);c.fillStyle='#ddd0ac';c.fillRect(0,0,720,320);c.fillStyle='#b6a17a';c.fillRect(12,12,696,296);c.fillStyle='#e8dcbb';c.fillRect(20,20,680,280);c.font='14px Georgia';c.textAlign='center';
 if(s.kind==='marbles'){
   c.fillStyle='#d4c09a';c.fillRect(25,28,670,254);for(const p of s.pegs){circle(c,p.x+2,p.y+3,p.r,'#6d60484d');circle(c,p.x,p.y,p.r,'#806846','#bba177');circle(c,p.x-1,p.y-1,1,'#ccb180');}
   shape(c,[[s.funnel-24,17],[s.funnel+24,17],[s.funnel+7,40],[s.funnel-7,40]],'#8c9b8b','#546e62');
   for(let n=0;n<3;n++){c.fillStyle=['#9a7b54','#8b9270','#7e8b8b'][n];c.fillRect(25+n*670/3,283,670/3-2,18);c.fillStyle='#fff0c9';c.fillText(String(s.bins[n]),25+(n+.5)*670/3,298);}
   for(const b of s.balls){circle(c,b.x+2,b.y+3,b.r,'#55483240');circle(c,b.x,b.y,b.r,['#8f493d','#50786e','#a17d32','#5f698d'][b.color]);circle(c,b.x-2,b.y-2,1.6,'#e8d8b3');}
 }
 if(s.kind==='water'){
   const joints=[[360,45],[200,115],[520,115]],ends=[[100,240],[270,240],[450,240],[620,240]],edges=[[joints[0],joints[1]],[joints[0],joints[2]],[joints[1],ends[0]],[joints[1],ends[1]],[joints[2],ends[2]],[joints[2],ends[3]]],rates=flow(s.gates,s.boost>0?24:12),edgeRates=[rates[0]+rates[1],rates[2]+rates[3],...rates];
   edges.forEach(([a,b],n)=>{line(c,[a,b],'#685f46',19);line(c,[a,b],'#a6966d',14);if(edgeRates[n]>0){line(c,[a,b],'#547f81',Math.max(3,Math.min(10,edgeRates[n]*.65)));const t=(s.time*.22+n*.16)%1;circle(c,a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,2.5,'#b5c9b8');}});
   for(let n=0;n<3;n++){const p=joints[n];circle(c,p[0],p[1],14,'#8d7953','#5f624b');line(c,[[p[0],p[1]],[p[0]+(s.gates[n]-1)*15,p[1]-15]],'#d0b77e',4);c.fillStyle='#564c37';c.fillText(['Head','West','East'][n],p[0],p[1]-25);}
   ends.forEach(([x,y],n)=>{shape(c,[[x-40,y],[x+40,y],[x+33,294],[x-33,294]],'#9b8661','#6b674c');const h=s.bowls[n]/70*43;c.fillStyle='#6c9898';c.fillRect(x-30,y+48-h,60,h);c.fillStyle='#514c39';c.fillText(s.bowls[n].toFixed(0),x,y+43);});
 }
 if(s.kind==='press'){
   c.fillStyle='#755a3e';c.fillRect(200,55,20,210);c.fillRect(500,55,20,210);c.fillRect(190,50,340,22);c.fillRect(185,260,350,20);c.fillStyle='#9d835b';c.fillRect(225,213,270,17);const drop=s.pressing>0?Math.sin((1-s.pressing/.65)*Math.PI)*34:0;c.fillStyle='#5c6657';c.fillRect(235,143+drop,250,16);line(c,[[360,70],[360,143+drop]],'#72715c',12);
   circle(c,553,145,37,'#baa27a','#5b5844');circle(c,553,145,6,'#535c4b');const angle=s.turns*Math.PI/2;line(c,[[553,145],[553+Math.cos(angle)*34,145+Math.sin(angle)*34]],'#705b3d',5);circle(c,553+Math.cos(angle)*34,145+Math.sin(angle)*34,6,'#4f5d4c');
   const card=s.cards[0],ink=['#785139','#526e4e','#456578'][card?.ink??s.ink];c.fillStyle='#f4e9cb';c.fillRect(255,181,210,62);c.strokeStyle='#b8a17a';c.strokeRect(255,181,210,62);c.fillStyle=ink;c.font='12px Georgia';c.fillText(['FIELD NOTES','CONNECTIONS','HANDLE WITH CARE'][s.type],360,203);
   const stamp=card?.stamp??s.stamp;if(stamp===0){line(c,[[290,219],[320,230],[340,216]],ink,1.3);for(const [x,y]of [[290,219],[320,230],[340,216]])circle(c,x,y,3,ink);}else if(stamp===1){circle(c,314,223,12,null,ink);line(c,[[314,208],[314,238],[299,223],[329,223]],ink);}else{shape(c,[[301,233],[310,212],[329,216],[319,230]],ink);line(c,[[300,236],[323,216]],'#f3e5c5',1);}
   c.font='13px Georgia';c.fillStyle='#554d37';c.fillText(card?'A postcard is ready on the platen.':'A blank card awaits an unnecessarily thoughtful message.',360,302);
 }
 if(s.kind==='lamps'){
   const lit=new Set(litNodes(s));for(const[a,b]of lampEdges(s.wiring))line(c,[lampPoints[a],lampPoints[b]],lit.has(a)&&lit.has(b)?'#a28542':'#91876a',lit.has(a)&&lit.has(b)?3:2);
   lampPoints.forEach(([x,y],n)=>{line(c,[[x,y+20],[x,y]],'#5f6756',3);if(lit.has(n)){circle(c,x,y,17,'#d5b66444');circle(c,x,y,11,'#d4b566');circle(c,x-3,y-3,3,'#f7e6ae');}else circle(c,x,y,10,'#7d8067','#555f50');if(!s.switches[n])line(c,[[x-8,y-9],[x+8,y+9]],'#985c44',3);c.fillStyle='#554d39';c.fillText(String.fromCharCode(65+n),x,y+39);});
   c.fillStyle='#645b42';c.fillText('West courtyard',175,290);c.fillText('East courtyard',545,290);
 }
 if(s.kind==='zoetrope'){
   const cx=360,cy=153;c.fillStyle='#7e6545';c.fillRect(348,168,24,110);shape(c,[[300,283],[418,283],[439,295],[281,295]],'#907755','#615d45');c.fillStyle='#7b6245';c.beginPath();c.ellipse(cx,cy,185,80,0,0,Math.PI*2);c.fill();c.strokeStyle='#b89e70';c.lineWidth=8;c.stroke();
   for(let n=0;n<12;n++){const angle=s.phase+n*Math.PI/6,x=cx+Math.cos(angle)*150,y=cy+Math.sin(angle)*57;c.save();c.translate(x,y);c.fillStyle='#e5d8b5';c.fillRect(-14,-27,28,41);const pose=n*Math.PI/6;circle(c,0,-18,3,'#6c765e');line(c,[[0,-14],[0,-2],[-6*Math.sin(pose),9],[0,-2],[6*Math.sin(pose),9]],'#526a5c',1.6);line(c,[[-5*Math.sin(pose),-6],[0,-11],[5*Math.sin(pose),-6]],'#526a5c',1.4);c.restore();}
   circle(c,cx,cy,24,'#9a865e','#c4ac7d');circle(c,cx,cy,6,'#5b6552');c.fillStyle='#554d39';c.fillText('Twelve drawings. One small walk.',360,37);
 }
}
const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function button(action,text,value){return`<button type="button" data-play-action="${action}"${value===undefined?'':` data-play-value="${value}"`}>${text}</button>`;}
function controls(kind){const common=(kind==='lamps'?'':button('pause','Pause / run')+button('step','Step toy'))+button('reset','Reset tabletop');
 if(kind==='marbles')return button('release','Release a marble')+button('handful','Release five')+button('funnel-left','Funnel left')+button('funnel-right','Funnel right')+button('tilt-left','Lean left')+button('tilt-right','Lean right')+button('shuffle','Rearrange pegs')+common;
 if(kind==='water')return['Headgate','West gate','East gate'].map((name,n)=>button('gate',name,n)).join('')+button('rain','A brief shower')+common;
 if(kind==='press')return button('type','Change type')+button('ink','Change ink')+button('stamp','Change stamp')+button('crank','Quarter-turn crank')+button('print','Print one postcard')+common;
 if(kind==='lamps')return button('power','Move power source')+button('wiring','Change bridge wiring')+Array.from({length:10},(_,n)=>button('switch','Relay '+String.fromCharCode(65+n),n)).join('')+common;
 return button('slower','Slower')+button('faster','Faster')+button('reverse','Reverse')+common;
}
function mount(container,id,api={}){
 const meta=gadget(id),model=createToy(meta.kind,Math.max(1,+id||1)*1009,!!api.reduced);let alive=true,handle=0,last=0,context=null,announcement='A little detour is allowed. Nothing here is graded.';
 const document=container.ownerDocument||window.document;
 if(document&&typeof document.createElement==='function'&&!document.getElementById?.('campus-play-style')){const style=document.createElement('style');style.id='campus-play-style';style.textContent='.campus-play{max-width:880px;margin:auto}.campus-play p{line-height:1.55}.campus-play-canvas{display:block;width:100%;height:auto;max-height:360px;border:1px solid #8c7958;background:#e8dcbb}.campus-play-toolbar{display:flex;flex-wrap:wrap;gap:7px;margin:14px 0}.campus-play-toolbar button{padding:8px 11px;font:inherit;font-size:14px;cursor:pointer}.campus-play-toolbar button:focus-visible{outline:3px solid #50766b;outline-offset:2px}.campus-play-state{display:block;padding:9px 12px;background:#d9ccaa55;font-size:14px}.campus-play-caption{font-size:12px;opacity:.8}.campus-play-cards{display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));padding:0;list-style:none}.campus-play-cards li{border:1px solid #b8a581;background:#efe3c6;padding:12px;font-family:Georgia,serif}';(document.head||document.body)?.appendChild?.(style);}
 container.innerHTML=`<section class="campus-play"><p>${esc(meta.description)}</p><canvas class="campus-play-canvas" width="720" height="320" aria-label="${esc(meta.name)}. Every control is also a button below."></canvas><div class="campus-play-toolbar">${controls(meta.kind)}</div><output class="campus-play-state" aria-live="off"></output><p class="campus-play-message" role="status">${esc(announcement)}</p><ul class="campus-play-cards" aria-label="Printed research postcards"></ul><p class="campus-play-caption">${esc(meta.footnote)}. These are simple, deterministic toy mechanisms, not research evidence or historical possessions.</p></section>`;
 const canvas=container.querySelector('.campus-play-canvas'),output=container.querySelector('.campus-play-state'),status=container.querySelector('.campus-play-message'),cards=container.querySelector('.campus-play-cards');
 try{context=canvas?.getContext?.('2d')||null;}catch{context=null;}
 const paint=()=>{if(!alive)return;if(context)draw(context,model.state);if(output)output.textContent=(model.state.paused?'Paused · ':'')+model.summary();if(cards&&meta.kind==='press')cards.innerHTML=model.state.cards.map(card=>`<li>${esc(card.line)}</li>`).join('');};
 const click=event=>{const target=event.target.closest?.('[data-play-action]');if(!target)return;announcement=model.act(target.dataset.playAction,target.dataset.playValue);if(status)status.textContent=announcement;paint();};
 container.addEventListener('click',click);paint();
 const raf=window.requestAnimationFrame?.bind(window),cancel=window.cancelAnimationFrame?.bind(window);
 const frame=now=>{if(!alive)return;if(!last)last=now;const dt=(now-last)/1000;if(dt>=1/30){model.tick(dt);last=now;paint();}handle=raf(frame);};
 if(context&&raf)handle=raf(frame);else if(status)status.textContent='Canvas animation is unavailable. The buttons, computed state and printed postcards still work; use Step toy to advance the mechanism.';
 return{model,destroy(){alive=false;if(handle&&cancel)cancel(handle);container.removeEventListener?.('click',click);}};
}
window.CampusPlay={jokes,gadget,mount,helpers:{rng,flow,litNodes,stepBall,createToy}};
})();
