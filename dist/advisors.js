/* Captioned adviser portraits. Conventional 2D rigging of identified source
   photographs: small source-patch mouth/jaw warps, eyelids, and breathing.
   No face generation, synthetic voice, TTS, inference or scoring service. */
(function () {
 'use strict';
 const mounted=new WeakMap();
 // Hand-positioned landmarks in the actual 300x400 illustrated portrait crops.
 // [mouth x,y,width, left eye x,y, right eye x,y, animation strength]
 const faces={
  'gary-king-official':[.407,.425,.150,.320,.278,.497,.293,1],
  'bruce-desmarais-official':[.490,.482,.175,.343,.347,.552,.332,1],
  'dino-christenson-official':[.493,.425,.155,.427,.287,.577,.297,1],
  'daron-acemoglu':[.400,.575,.165,.337,.370,.577,.402,.9],
  'w-e-b-du-bois':[.400,.435,.140,.340,.265,.490,.278,.85],
  'abhijit-banerjee':[.460,.405,.125,.390,.280,.540,.285,.65],
  'albert-l-szl-barab-si':[.490,.335,.100,.435,.235,.530,.235,.65],
  'alvin-e-roth':[.500,.650,.185,.380,.465,.580,.465,.75],
  'damon-centola':[.510,.515,.165,.430,.340,.600,.340,.75],
  'daniel-kahneman':[.480,.325,.120,.450,.225,.580,.205,.65],
  'david-lazer-official':[.530,.580,.170,.400,.390,.620,.390,.7],
  'duncan-j-watts':[.560,.355,.085,.500,.240,.600,.245,.6],
  'elinor-ostrom':[.540,.500,.170,.390,.340,.580,.340,.7],
  'esther-duflo':[.730,.550,.135,.630,.375,.810,.390,.65],
  'fei-fei-li':[.530,.315,.110,.480,.210,.590,.205,.65],
  'herbert-a-simon':[.480,.605,.185,.350,.385,.660,.375,.75],
  'jennifer-pan-official':[.430,.430,.110,.380,.300,.520,.305,.7],
  'judea-pearl':[.490,.520,.170,.380,.350,.600,.350,.75],
  'lloyd-shapley':[.590,.560,.110,.500,.430,.640,.440,.6],
  'margaret-roberts-official':[.470,.360,.120,.380,.245,.530,.240,.65],
  'mark-granovetter-official':[.570,.650,.170,.400,.400,.750,.390,.65],
  'matthew-salganik-official':[.360,.405,.105,.290,.275,.420,.265,.65],
  'michael-kremer':[.480,.565,.145,.370,.405,.590,.405,.7],
  'peter-dodds-official':[.500,.355,.100,.450,.255,.570,.250,.6],
  'reka-albert-official':[.610,.430,.140,.490,.295,.690,.320,.7],
  'thomas-schelling':[.430,.530,.140,.340,.360,.550,.340,.65],
  'timnit-gebru':[.640,.565,.150,.510,.340,.730,.350,.7]
 };
 const noop=()=>{};
 const clock=()=>typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
 const safeUrl=value=>/^https?:\/\//i.test(value||'')?value:'';
 function style(){
  if(!document.head||!document.createElement||document.getElementById?.('research-advisor-css'))return;
  const s=document.createElement('style');s.id='research-advisor-css';
  s.textContent='.research-advisor{display:grid;grid-template-columns:170px minmax(0,1fr);gap:17px;padding:14px;background:linear-gradient(120deg,#e8d9b9,#d4c09b);border:1px solid #9c8257;border-radius:4px;box-shadow:inset 0 1px #fff5db,0 5px 18px #2f251b20;color:#383526;margin:0 0 18px}.advisor-portrait-side{min-width:0}.advisor-portrait-frame{position:relative;width:170px;height:225px;overflow:hidden;background:#80765f;border:5px solid #594833;border-radius:3px;box-shadow:0 1px 0 #b5a17a,inset 0 0 18px #211c1750}.advisor-portrait-frame:after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 15px #2e271536}.advisor-fallback,.advisor-canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.advisor-canvas{opacity:0;pointer-events:none}.advisor-canvas.ready{opacity:1}.advisor-portrait-name{display:block;font:600 14px Georgia,serif;margin-top:9px}.advisor-source{font:11px system-ui,sans-serif;line-height:1.4;margin:4px 0 0;color:#62583e}.advisor-source a{color:#365b53;text-decoration:underline}.advisor-conversation{display:flex;flex-direction:column;min-width:0}.advisor-dramatization{font:10px system-ui,sans-serif;letter-spacing:1.25px;text-transform:uppercase;color:#776746;margin:1px 0 8px}.advisor-status{font:12px system-ui,sans-serif;color:#405647;display:flex;align-items:center;gap:6px;margin-bottom:8px}.advisor-status:before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:#9a9c7e;box-shadow:0 0 0 2px #afad8d30}.advisor-status.speaking:before{background:#5e8066;box-shadow:0 0 0 3px #6a8b6220}.advisor-caption{font:15px/1.55 Georgia,serif;margin:0;min-height:90px;white-space:pre-line}.advisor-caption-note{font:11px/1.4 system-ui,sans-serif;color:#76694e;margin:10px 0 0}.advisor-line-controls{display:flex;gap:7px;flex-wrap:wrap;margin-top:auto;padding-top:12px}.advisor-line-controls button,.advisor-speakers button{font:12px system-ui,sans-serif;min-height:32px;padding:6px 10px;background:#f0e5cc;border:1px solid #ae956b;border-radius:3px;color:#3c493b;cursor:pointer}.advisor-line-controls button:hover,.advisor-speakers button:hover{background:#fbf1dc}.advisor-speakers{display:flex;gap:5px;flex-wrap:wrap;margin:0 0 9px}.advisor-speakers button{font-size:11px;min-height:28px;padding:4px 7px}.advisor-speakers button[aria-pressed="true"]{background:#4c6452;border-color:#4c6452;color:#f8edd4}.research-advisor button:focus-visible,.research-advisor a:focus-visible{outline:2px solid #355c50;outline-offset:3px}.advisor-line-count{font:11px system-ui,sans-serif;align-self:center;color:#786b50}.advisor-portrait-unavailable{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:10px;font:14px Georgia,serif;color:#e9ddc0}@media(max-width:640px){.research-advisor{grid-template-columns:118px minmax(0,1fr);gap:11px;padding:10px}.advisor-portrait-frame{width:118px;height:157px;border-width:4px}.advisor-caption{font-size:14px;min-height:100px}.advisor-portrait-name{font-size:12px}.advisor-line-controls{grid-column:1/-1}.advisor-source{font-size:10px}}';
  document.head.appendChild(s);
 }
 function mount(container,encounter,opts={}){
  const empty={destroy:noop,setReduced:noop,getState:()=>({supported:false,destroyed:false})};
  if(!container||!document.createElement||typeof container.appendChild!=='function')return empty;
  mounted.get(container)?.destroy();style();
  const portraits=Array.isArray(opts.portraits)?opts.portraits.filter(p=>p&&p.name):[];
  if(!portraits.length)portraits.push({name:encounter?.name||'Researcher',file:''});
  const originalLines=(Array.isArray(opts.lines)?opts.lines:encounter?.dialogue||[]).map(v=>typeof v==='string'?v:String(v?.text||'')).filter(Boolean);
  if(!originalLines.length)originalLines.push(encounter?.objective||encounter?.title||'Explore the research controls below.');
  let destroyed=false,reduced=!!opts.reduced,hidden=!!document.hidden,speaker=0,lineIndex=0,jokeMode=false;
  let currentText='',narrator=false,speaking=false,lineEnd=0,pauseAt=0,stateTimer=null,raf=null,lastFrame=0;
  let currentImage=null,imageReady=false,context=null,rig=null,mouthInk='#423b30',eyeSkin=['#b39b7c','#b39b7c'];
  const listeners=[];
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const on=(node,event,fn)=>{node.addEventListener?.(event,fn);listeners.push([node,event,fn]);};
  const root=el('section','research-advisor');root.setAttribute('aria-label','Researcher conversation and animated portrait');
  const portraitSide=el('div','advisor-portrait-side'),frame=el('div','advisor-portrait-frame');
  const fallback=el('img','advisor-fallback');fallback.decoding='async';
  const canvas=el('canvas','advisor-canvas');canvas.width=300;canvas.height=400;canvas.setAttribute('aria-hidden','true');
  const unavailable=el('div','advisor-portrait-unavailable','Portrait unavailable');unavailable.hidden=true;
  frame.appendChild(fallback);frame.appendChild(canvas);frame.appendChild(unavailable);portraitSide.appendChild(frame);
  const name=el('strong','advisor-portrait-name'),credit=el('p','advisor-source');portraitSide.appendChild(name);portraitSide.appendChild(credit);
  const talk=el('div','advisor-conversation'),disclaimer=el('div','advisor-dramatization','Educational dramatization');
  const speakerButtons=el('div','advisor-speakers');speakerButtons.setAttribute('aria-label','Choose a researcher');
  const status=el('div','advisor-status'),caption=el('p','advisor-caption');caption.setAttribute('aria-live','polite');
  const note=el('p','advisor-caption-note','Authored teaching dialogue, not an authentic quotation or voice recording.');
  const controls=el('div','advisor-line-controls'),next=el('button','','Next line'),replay=el('button','','Replay line'),lighter=el('button','','A lighter thought'),count=el('span','advisor-line-count');
  for(const button of[next,replay,lighter])button.type='button';controls.appendChild(next);controls.appendChild(replay);controls.appendChild(lighter);controls.appendChild(count);
  talk.appendChild(disclaimer);talk.appendChild(speakerButtons);talk.appendChild(status);talk.appendChild(caption);talk.appendChild(note);talk.appendChild(controls);root.appendChild(portraitSide);root.appendChild(talk);container.appendChild(root);
  try{context=canvas.getContext?.('2d');if(!context||typeof context.drawImage!=='function')context=null;}catch(_){context=null;}
  function getJoke(){const value=window.CampusPlay?.jokes?.[encounter?.id];return typeof value==='string'?value:value?.text||'';}
  lighter.hidden=!getJoke();
  const buttons=portraits.map((p,i)=>{const button=el('button','',p.name);button.type='button';button.setAttribute('aria-pressed',i===speaker?'true':'false');on(button,'click',()=>chooseSpeaker(i));speakerButtons.appendChild(button);return button;});
  speakerButtons.hidden=portraits.length<2;
  function cancelFrame(){if(raf!==null&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(raf);raf=null;}
  function clearStateTimer(){if(stateTimer!==null)clearTimeout(stateTimer);stateTimer=null;}
  function setStatus(){
   status.className='advisor-status'+(speaking&&!hidden?' speaking':'');
   status.textContent=hidden?'Conversation paused while the page is hidden':narrator?'Atlas narrator · researcher listening':speaking?'Speaking'+(reduced?' · reduced motion':' · captioned dialogue'):'Listening · ready for your next question';
  }
  function finishLine(){if(destroyed)return;speaking=false;clearStateTimer();setStatus();render(clock());}
  function scheduleEnd(){clearStateTimer();if(speaking&&!hidden)stateTimer=setTimeout(finishLine,Math.max(0,lineEnd-clock()));}
  function sourceKey(record){return String(record.photoFile||record.file||'').split('/').pop().replace(/\.[^.]+$/,'');}
  function sampleColors(){
   if(!context||!imageReady||!rig)return;
   try{
    context.clearRect(0,0,300,400);context.drawImage(currentImage,0,0,300,400);
    const pixel=(xx,yy)=>{const p=context.getImageData(Math.max(0,Math.min(299,Math.round(xx))),Math.max(0,Math.min(399,Math.round(yy))),1,1)?.data;if(!p||p.length<3)return null;return 'rgb('+p[0]+','+p[1]+','+p[2]+')';};
    eyeSkin=[pixel(rig[3]*300,rig[4]*400+8)||eyeSkin[0],pixel(rig[5]*300,rig[6]*400+8)||eyeSkin[1]];
    // Use a dark pixel from the source mouth, rather than inventing teeth or lips.
    const mx=rig[0]*300,my=rig[1]*400,area=context.getImageData(Math.max(0,Math.round(mx-rig[2]*90)),Math.max(0,Math.round(my-2)),Math.max(1,Math.round(rig[2]*180)),5)?.data;
    if(area){let best=Infinity,c=[55,44,32];for(let i=0;i<area.length;i+=4){const lum=area[i]*.3+area[i+1]*.5+area[i+2]*.2;if(lum<best){best=lum;c=[area[i],area[i+1],area[i+2]];}}mouthInk='rgb('+c.join(',')+')';}
   }catch(_){/* Same-origin assets normally permit sampling; retain gentle defaults otherwise. */}
  }
  function loadPortrait(){
   imageReady=false;currentImage=fallback;rig=faces[sourceKey(portraits[speaker])]||null;canvas.className='advisor-canvas';name.textContent=portraits[speaker].name;
   fallback.alt=portraits[speaker].name+' — illustration of the identified source photograph';unavailable.hidden=!!portraits[speaker].file;fallback.hidden=!portraits[speaker].file;
   while(credit.firstChild)credit.removeChild(credit.firstChild);
   const link=safeUrl(portraits[speaker].source);if(link){const a=el('a','','Photo source & credit');a.href=link;a.target='_blank';a.rel='noopener';credit.appendChild(a);}else credit.textContent='Source photograph unavailable';
   buttons.forEach((button,i)=>button.setAttribute('aria-pressed',i===speaker?'true':'false'));
   const token=speaker;
   fallback.onload=()=>{if(destroyed||token!==speaker)return;imageReady=!!(fallback.naturalWidth||fallback.width);if(imageReady&&context){sampleColors();canvas.className='advisor-canvas ready';render(clock());ensureAnimation();}};
   fallback.onerror=()=>{if(destroyed||token!==speaker)return;imageReady=false;canvas.className='advisor-canvas';fallback.hidden=true;unavailable.hidden=false;};
   if(portraits[speaker].file)fallback.src=portraits[speaker].file;
   if(fallback.complete&&fallback.naturalWidth)fallback.onload();
  }
  function render(t){
   if(!context||!imageReady||destroyed||hidden)return;
   const seconds=t/1000,animate=!reduced;
   try{
    context.clearRect(0,0,300,400);context.save();
    if(animate){context.translate(150,162);context.rotate(Math.sin(seconds*.43+speaker)*.0018);context.scale(1+Math.sin(seconds*1.3)*.0013,1+Math.sin(seconds*1.3)*.0013);context.translate(-150,-162+Math.sin(seconds*1.3)*.65);}
    context.drawImage(currentImage,0,0,300,400);
    if(rig&&animate){
     const mx=rig[0]*300,my=rig[1]*400,mw=rig[2]*300;
     const rhythm=Math.max(0,Math.sin(seconds*10.6)+.24*Math.sin(seconds*19.1)),pause=(seconds*.39)%1>.84;
     const opening=speaking&&!narrator&&!pause?Math.min(3.8,Math.pow(rhythm,1.35)*3.0*rig[7]):0;
     if(opening>.16){
      // The source lower lip/jaw patch stretches down slightly, revealing only
      // a tiny dark line sampled from the same portrait. Maximum UI gap ~2 px.
      const sx=Math.max(0,mx-mw*.58),sy=Math.max(0,my+.5),sw=Math.min(300-sx,mw*1.16),sh=17;
      context.save();context.beginPath();context.ellipse(mx,my+8,mw*.62,17,0,0,Math.PI*2);context.clip();context.drawImage(currentImage,sx,sy,sw,sh,sx,sy+opening*.45,sw,sh+opening*.25);context.restore();
      context.fillStyle=mouthInk;context.globalAlpha=.65;context.beginPath();context.ellipse(mx,my+opening*.22,mw*.38,Math.max(.35,opening*.38),0,0,Math.PI*2);context.fill();context.globalAlpha=1;
     }
     const cycle=4.8+speaker*.29,phase=(seconds+speaker*.71)%cycle,blink=phase<.17?Math.sin(Math.PI*phase/.17):0;
     if(blink>.08)for(let i=0;i<2;i++){const ex=rig[3+i*2]*300,ey=rig[4+i*2]*400,ew=Math.min(13,mw*.24);context.save();context.globalAlpha=blink*.88;context.fillStyle=eyeSkin[i];context.beginPath();context.ellipse(ex,ey,ew*.52,2.2*blink,0,0,Math.PI*2);context.fill();context.strokeStyle=mouthInk;context.lineWidth=.65;context.beginPath();context.moveTo(ex-ew*.43,ey+.7);context.quadraticCurveTo(ex,ey+1.9,ex+ew*.43,ey+.7);context.stroke();context.restore();}
    }
    context.restore();
   }catch(_){canvas.className='advisor-canvas';imageReady=false;cancelFrame();}
  }
  function ensureAnimation(){
   if(destroyed||reduced||hidden||!context||!imageReady||raf!==null||typeof requestAnimationFrame!=='function')return;
   raf=requestAnimationFrame(function frameTick(t){raf=null;if(destroyed||reduced||hidden)return;if(t-lastFrame>=32){lastFrame=t;render(t);}ensureAnimation();});
  }
  function selectNamedSpeaker(text){
   const prefix=text.split(':')[0];if(!text.includes(':')||/^Narrator\b/i.test(prefix))return;
   const named=prefix.replace(/,?\s*educational dramatization/i,'').trim().toLowerCase();
   const index=portraits.findIndex(p=>p.name.toLowerCase().includes(named));if(index>=0&&index!==speaker){speaker=index;loadPortrait();}
  }
  function chooseSpeaker(index){
   speaker=index;jokeMode=false;loadPortrait();const fullname=portraits[speaker].name.toLowerCase();
   let chosen=originalLines.findIndex(text=>{if(!text.includes(':')||/^Narrator\b/i.test(text))return false;const named=text.split(':')[0].replace(/,?\s*educational dramatization/i,'').trim().toLowerCase();return fullname.includes(named);});
   if(chosen<0)chosen=originalLines.findIndex(text=>!text.includes(':'));
   if(chosen>=0){lineIndex=chosen;startLine(originalLines[chosen],false);}else finishLine();
  }
  function startLine(text,select=true){
   currentText=text;if(select)selectNamedSpeaker(text);narrator=/^Narrator\s*:/i.test(text);caption.textContent=text;
   speaking=!narrator;lineEnd=clock()+Math.min(15000,Math.max(3600,text.split(/\s+/).length*290+1500));
   count.textContent=jokeMode?'A lighter thought':(lineIndex+1)+' / '+originalLines.length;setStatus();scheduleEnd();render(clock());ensureAnimation();
  }
  on(next,'click',()=>{jokeMode=false;lineIndex=(lineIndex+1)%originalLines.length;if(portraits.length>1&&!originalLines[lineIndex].includes(':')){speaker=lineIndex%portraits.length;loadPortrait();}startLine(originalLines[lineIndex]);});
  on(replay,'click',()=>startLine(currentText,false));
  on(lighter,'click',()=>{const joke=getJoke();if(joke){jokeMode=true;startLine(joke,false);}});
  const visibility=()=>{if(destroyed)return;const nextHidden=!!document.hidden;if(nextHidden&&!hidden){pauseAt=clock();clearStateTimer();cancelFrame();}else if(!nextHidden&&hidden){lineEnd+=Math.max(0,clock()-pauseAt);}hidden=nextHidden;setStatus();if(!hidden){scheduleEnd();render(clock());ensureAnimation();}};
  on(document,'visibilitychange',visibility);
  const controller={
   destroy(){if(destroyed)return;destroyed=true;cancelFrame();clearStateTimer();listeners.forEach(([node,event,fn])=>node.removeEventListener?.(event,fn));fallback.onload=null;fallback.onerror=null;if(root.remove)root.remove();else root.parentNode?.removeChild(root);if(mounted.get(container)===controller)mounted.delete(container);},
   setReduced(value){reduced=!!value;cancelFrame();setStatus();render(clock());ensureAnimation();},
   getState:()=>({supported:!!context,destroyed,reduced,hidden,speaking,narrator,speaker:portraits[speaker].name,line:lineIndex,joke:jokeMode,imageReady})
  };
  mounted.set(container,controller);loadPortrait();startLine(originalLines[0]);return controller;
 }
 window.ResearchAdvisors={mount};
})();
