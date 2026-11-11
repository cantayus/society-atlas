/* Campus feature contracts. These are deterministic logic/Canvas/DOM-adapter
 * checks, not browser QA, visual likeness review, or measured frame-rate tests. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const dist=path.resolve(__dirname,'../dist');
const read=name=>fs.readFileSync(path.join(dist,name),'utf8');
const copy=value=>JSON.parse(JSON.stringify(value));
const iso=(x,y)=>({x:(x-y)*30,y:(x+y)*15});

function canvas(){
 let depth=0,log=[];const gradient={addColorStop(...a){assert.ok(Number.isFinite(a[0]));log.push(['stop',...a]);}};
 const methods={save(){depth++;},restore(){assert.ok(depth>0,'balanced Canvas saves');depth--;},measureText:s=>({width:String(s).length*7}),getImageData:()=>({data:new Uint8ClampedArray([151,121,85,255])}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient};
 const ctx=new Proxy(methods,{get(o,k){return k in o?o[k]:(...a)=>{for(const n of a.flat(Infinity))if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: finite coordinate`);if(k==='arc')assert.ok(a[2]>=0);if(k==='ellipse')assert.ok(a[2]>=0&&a[3]>=0);log.push([String(k),...a.filter(v=>v===null||typeof v!=='object')]);};},set(o,k,v){if(['lineWidth','globalAlpha','shadowBlur'].includes(k))assert.ok(Number.isFinite(v),k+' is finite');if(k==='globalAlpha')assert.ok(v>=0&&v<=1);o[k]=v;return true;}});
 return{ctx,get log(){return log;},get depth(){return depth;},reset(){assert.equal(depth,0);log=[];}};
}

function runtime(files=[]){
 const draw=canvas(),raf=new Map(),timers=new Map(),ids=new Map();let serial=0,now=0;
 function matches(el,selector){if(selector[0]==='.')return el.className.split(/\s+/).includes(selector.slice(1));if(selector[0]==='#')return el.id===selector.slice(1);const m=selector.match(/^\[data-([a-z-]+)(?:="([^"]*)")?\]$/);if(m){const k=m[1].replace(/-([a-z])/g,(_,c)=>c.toUpperCase());return k in el.dataset&&(m[2]===undefined||el.dataset[k]===m[2]);}return el.tagName===selector.toUpperCase();}
 class Element{
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.listeners=new Map();this.dataset={};this.attributes={};this.className='';this.id='';this.style={setProperty(){}};this.textContent='';this._html='';this.clientWidth=this.width=1280;this.clientHeight=this.height=800;this.complete=false;this.naturalWidth=0;this.classList={add:k=>{this.className+=' '+k;},remove:k=>{this.className=this.className.split(/\s+/).filter(x=>x!==k).join(' ');},toggle(){}};}
  get firstChild(){return this.children[0]||null;}
  set innerHTML(html){this._html=html;this.children=[];const stack=[this],voids=new Set(['img','input','br','hr','meta','link']);for(const m of html.matchAll(/<(\/?)([a-z][a-z0-9-]*)\b([^>]*)>|([^<]+)/gi)){if(m[4]){stack.at(-1).textContent+=m[4];continue;}if(m[1]){if(stack.length>1)stack.pop();continue;}const el=new Element(m[2]);for(const a of m[3].matchAll(/([a-z][\w-]*)="([^"]*)"/gi))el.setAttribute(a[1],a[2]);stack.at(-1).appendChild(el);if(!voids.has(m[2])&&!m[3].endsWith('/'))stack.push(el);}}
  get innerHTML(){return this._html;}
  appendChild(el){el.parentNode=this;this.children.push(el);return el;}
  removeChild(el){this.children=this.children.filter(x=>x!==el);el.parentNode=null;return el;}
  remove(){this.parentNode?.removeChild(this);}
  setAttribute(k,v){this.attributes[k]=String(v);if(k==='id'){this.id=v;ids.set(v,this);}if(k==='class')this.className=v;if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(v);}
  getAttribute(k){return this.attributes[k];}
  addEventListener(k,fn){if(!this.listeners.has(k))this.listeners.set(k,new Set());this.listeners.get(k).add(fn);}
  removeEventListener(k,fn){this.listeners.get(k)?.delete(fn);}
  dispatch(k,event={}){for(const fn of [...this.listeners.get(k)||[]])fn({target:this,...event});}
  querySelector(s){return this.querySelectorAll(s)[0]||null;}
  querySelectorAll(s){const all=[];for(const child of this.children){if(matches(child,s))all.push(child);all.push(...child.querySelectorAll(s));}return all;}
  closest(s){return matches(this,s)?this:this.parentNode?.closest(s)||null;}
  getContext(){return draw.ctx;}
  getClientRects(){return[{width:1,height:1}];}
  focus(){}setPointerCapture(){}
  getBoundingClientRect(){return{left:0,top:0,width:this.clientWidth,height:this.clientHeight};}
  insertAdjacentHTML(_where,html){this.innerHTML+=html;}
 }
 const document=new Element('document');document.head=new Element('head');document.body=new Element('body');document.documentElement=new Element('html');document.hidden=false;document.createElement=tag=>new Element(tag);document.getElementById=id=>ids.get(id)||null;document.appendChild(document.head);document.appendChild(document.body);
 const elements=new Map();const get=s=>{if(!elements.has(s)){const el=new Element(s==='#world'?'canvas':'div');el.id=s.slice(1);elements.set(s,el);}return elements.get(s);};document.querySelector=get;
 const storage=new Map(),box={console,Date,Math,JSON,Promise,Set,Map,WeakMap,Object,Array,Number,String,Uint8ClampedArray,document,innerWidth:1280,innerHeight:800,devicePixelRatio:1,performance:{now:()=>now},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setTimeout(fn,ms){const id=++serial;timers.set(id,{fn,due:now+ms});return id;},clearTimeout:id=>timers.delete(id),requestAnimationFrame(fn){const id=++serial;raf.set(id,fn);return id;},cancelAnimationFrame:id=>raf.delete(id),addEventListener(){},AtlasAudio:{start(){},setLevels(){},setScene(){},cue(){}},Research:{mount(){}}};
 box.window=box;vm.createContext(box);for(const file of files)vm.runInContext(read(file),box,{filename:file});
 return{box,draw,document,Element,elements,get,raf,timers,storage,load(file){vm.runInContext(read(file),box,{filename:file});},advance(ms){now+=ms;for(const[id,t]of[...timers])if(t.due<=now){timers.delete(id);t.fn();}const frames=[...raf];raf.clear();for(const[,fn]of frames)fn(now);},click(act){document.dispatch('click',{target:{closest:()=>({dataset:{act},disabled:false})}});}};
}

test('living campus actors and furniture preserve all eighteen actual navigation grids',()=>{
 const h=runtime(['data.js','landmarks.js','atmosphere.js','campus-life.js','app.js']),L=h.box.CampusLife,g=h.box.AtlasGame;
 const reserved=[[20,8,2.25],[12,20,2.25],[6,16,2.25],[20,17,1.8],[12,23,1.6],[11,17,1.1]];
 for(let id=1;id<=18;id++){
  g.enterCampus(id);const e={id,year:g.active.year,mode:'campus',grid:g.grid,N:26,iso,time:0,paused:false,reduced:false,player:{x:12,y:23},path:[{x:13,y:23}],selected:true};const before=JSON.stringify(g.grid),furniture=L.props(e);assert.ok(furniture.length>=3,`campus ${id}: academic vignettes exist`);
  for(const item of furniture){assert.ok(L._test.isFree(e,item.x,item.y));assert.ok(!L._test.isPath(e,item.x,item.y),`${id}: ${item.kind} stays off the walk`);for(const[x,y,r]of reserved)assert.ok(Math.hypot(item.x-x,item.y-y)>=r,`${id}: furniture preserves an interaction area`);item.draw(h.draw.ctx);}
  for(const time of[0,20,85]){e.time=time;const actors=L.people(h.draw.ctx,e);assert.equal(actors.filter(a=>a.kind==='fellow').length,1);assert.ok(actors.filter(a=>a.kind==='person'||a.kind==='fellow').length<=12);assert.equal(actors.filter(a=>a.kind==='animal').length,4);for(const a of actors){assert.ok(Number.isFinite(a.depth));if(['person','fellow','animal'].includes(a.kind))assert.ok(g.walkable(Math.round(a.x),Math.round(a.y)),`${id}: actor remains on valid ground`);if(['car','handcart'].includes(a.kind))assert.ok(a.x<0||a.y>=26,'traffic stays outside the playable campus');a.draw(h.draw.ctx);}assert.equal(actors.some(a=>a.kind==='car'),id!==1,'1896 uses a handcart instead of a motorcar');}
  assert.equal(JSON.stringify(g.grid),before,'scenic activity never edits collision state');e.mode='menu';assert.equal(L.people(h.draw.ctx,e).filter(a=>a.kind==='fellow').length,0);assert.equal(h.draw.depth,0);
 }
 assert.equal(new Set([[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]].map(([x,y])=>L._test.direction(x,y))).size,8);
});

test('campus life freezes in place while paused and reduced motion stops pose animation',()=>{
 const h=runtime(['campus-life.js']),L=h.box.CampusLife,e={id:13,mode:'campus',grid:Array.from({length:26},()=>Array(26).fill(0)),N:26,iso,time:10,paused:false,reduced:false,player:{x:12,y:23},path:[{x:13,y:23}],selected:true};
 const positions=()=>copy(L.people(h.draw.ctx,e).map(a=>[a.kind,a.x,a.y]));const original=positions();e.paused=true;e.time=90;assert.deepEqual(positions(),original);e.time=160;assert.deepEqual(positions(),original);e.paused=false;e.reduced=true;const still=positions();e.time=210;assert.deepEqual(positions(),still);const before=JSON.stringify(e);L.people(h.draw.ctx,e).forEach(a=>a.draw(h.draw.ctx));assert.equal(JSON.stringify(e),before);
});

test('regional weather is sourced fictional ambience with quiet, controllable particles',()=>{
 const h=runtime(['weather.js']),W=h.box.CampusWeather;assert.equal(W.metadata.families.length,13);const ledger=JSON.parse(read('assets/weather-sources.json'));assert.equal(ledger.profiles.length,13);assert.match(ledger.disclaimer,/Not live weather/);
 for(let id=1;id<=18;id++){const p=W.profile(id);assert.equal(p.isForecast,false);assert.equal(p.designed,true);assert.match(W.label(id),/designed autumn ambience/);assert.ok(p.sources.every(s=>s.url.startsWith('https://www.weather.gov/')));if([5,11,16].includes(id))assert.ok(p.modes.every(m=>!['drizzle','flurry'].includes(m)),'California scenes keep mild dry modes');const e={id,width:1280,height:800,iso,cam:iso(13,14),zoom:.92,time:0,paused:false,reduced:false,enabled:true};for(const time of[0,185,365]){e.time=time;const before=JSON.stringify(e);W.ground(h.draw.ctx,e);W.screen(h.draw.ctx,e);assert.equal(JSON.stringify(e),before);assert.equal(h.draw.depth,0);}e.reduced=true;e.time=0;h.draw.reset();W.screen(h.draw.ctx,e);assert.ok(!h.draw.log.some(row=>['arc','lineTo','moveTo','rotate'].includes(row[0])),'reduced motion draws light without particles');const still=JSON.stringify(h.draw.log);e.time=100;h.draw.reset();W.screen(h.draw.ctx,e);assert.equal(JSON.stringify(h.draw.log),still);e.enabled=false;h.draw.reset();W.ground(h.draw.ctx,e);W.screen(h.draw.ctx,e);assert.equal(h.draw.log.length,0);}
});

test('weather pause holds positions, replay is deterministic, and drizzle clears signs and commands',()=>{
 const h=runtime(['weather.js']),W=h.box.CampusWeather,e={id:7,width:1280,height:800,iso,cam:iso(13,14),zoom:.92,time:30,enabled:true};h.draw.reset();W.screen(h.draw.ctx,e);const snapshot=JSON.stringify(h.draw.log),rects=W._test.protectedRects(e,1280,800);for(const row of h.draw.log.filter(r=>r[0]==='moveTo'||r[0]==='lineTo'))assert.ok(W._test.isClear(row[1],row[2],rects,0),'drizzle leaves labels and HUD clear');e.paused=true;e.time=90;h.draw.reset();W.screen(h.draw.ctx,e);assert.equal(JSON.stringify(h.draw.log),snapshot);e.time=170;h.draw.reset();W.screen(h.draw.ctx,e);assert.equal(JSON.stringify(h.draw.log),snapshot);const replay=runtime(['weather.js']);e.paused=false;e.time=30;replay.box.CampusWeather.screen(replay.draw.ctx,e);assert.equal(JSON.stringify(replay.draw.log),snapshot);
});

test('tabletop toys conserve marbles and water, expose working networks, and remain ungraded',()=>{
 const h=runtime(['campus-play.js']),P=h.box.CampusPlay,{createToy,flow,litNodes}=P.helpers;for(let id=1;id<=18;id++){assert.match(P.gadget(id).footnote,/optional play/);assert.equal(P.gadget(id).x,11);assert.equal(P.gadget(id).y,17);}
 const a=createToy('marbles',91,true),b=createToy('marbles',91,true);for(const model of[a,b]){model.act('handful');const frozen=copy(model.state.balls);model.tick(.1);assert.deepEqual(copy(model.state.balls),frozen,'paused marbles hold position');model.act('step');model.act('pause');for(let n=0;n<1500;n++)model.tick(.05);assert.equal(model.state.bins.reduce((s,v)=>s+v,0)+model.state.balls.length,5,'every released marble is still on the board or in a bin');}assert.deepEqual(copy(a.snapshot()),copy(b.snapshot()),'the same seed and actions reproduce the toy');
 for(let x=0;x<3;x++)for(let y=0;y<3;y++)for(let z=0;z<3;z++)assert.equal(flow([x,y,z]).reduce((s,n)=>s+n,0),12,'gates redistribute rather than create water');const water=createToy('water',13,false);for(let n=0;n<200;n++)water.tick(.1);assert.ok(Math.abs(water.state.bowls.reduce((s,n)=>s+n,0)+water.state.spill-240)<1e-7,'water plus spill equals the supplied flow');
 const lamps=createToy('lamps');assert.equal(litNodes(lamps.state).length,10);lamps.act('wiring');assert.equal(litNodes(lamps.state).length,5,'disconnecting the bridge isolates one courtyard');lamps.act('power');assert.equal(litNodes(lamps.state).length,5,'moving the source lights the other disconnected courtyard');const press=createToy('press',1,true);for(let n=0;n<3;n++)press.act('crank');assert.equal(press.state.cards.length,0);press.act('crank');assert.equal(press.state.cards.length,1);assert.ok(press.state.cards[0].line);assert.ok(!('score'in press.state)&&!('completed'in press.state));
});

test('mounted toys keep their accessible state controls working and stop their frame loop on destroy',()=>{
 const h=runtime(['campus-play.js']),container=new h.Element(),controller=h.box.CampusPlay.mount(container,1,{reduced:true});assert.equal(controller.model.state.paused,true);const print=container.querySelector('[data-play-action="print"]');assert.ok(print);container.dispatch('click',{target:print});assert.equal(controller.model.state.cards.length,1);assert.match(container.querySelector('.campus-play-state').textContent,/1 postcards/);assert.equal(h.raf.size,1);const frame=[...h.raf.values()][0];controller.destroy();assert.equal(h.raf.size,0);assert.equal(container.listeners.get('click').size,0);frame(500);assert.equal(h.raf.size,0,'a late callback cannot restart a destroyed toy');
});

test('captioned advisers select named speakers, respect visibility/reduced motion and tear down cleanly',()=>{
 const h=runtime(['campus-play.js','advisors.js']),container=new h.Element(),encounter={id:9,name:'Gary King',dialogue:['Gary King: Compare the missing posts.','Bruce Desmarais: Validate the construct.','Narrator: A later interpretation.']},opts={portraits:[{name:'Gary King',file:'assets/gary-king-official.jpg',source:'https://example.edu/king'},{name:'Bruce Desmarais',file:'assets/bruce-desmarais-official.jpg',source:'https://example.edu/desmarais'}]};const a=h.box.ResearchAdvisors.mount(container,encounter,opts),find=text=>container.querySelectorAll('button').find(b=>b.textContent===text);const image=container.querySelector('.advisor-fallback');image.naturalWidth=300;image.complete=true;image.onload();assert.equal(a.getState().imageReady,true);assert.equal(h.raf.size,1);assert.equal(a.getState().speaker,'Gary King');find('Next line').dispatch('click');assert.equal(a.getState().speaker,'Bruce Desmarais');assert.match(container.querySelector('.advisor-caption').textContent,/Validate the construct/);find('Next line').dispatch('click');assert.equal(a.getState().narrator,true);assert.equal(a.getState().speaking,false,'the researcher does not mouth narrator interpretation');find('A lighter thought').dispatch('click');assert.equal(a.getState().joke,true);assert.match(container.querySelector('.advisor-caption-note').textContent,/not an authentic quotation/);a.setReduced(true);assert.equal(h.raf.size,0);assert.equal(a.getState().reduced,true);a.setReduced(false);assert.equal(h.raf.size,1);h.document.hidden=true;h.document.dispatch('visibilitychange');assert.equal(a.getState().hidden,true);assert.equal(h.raf.size,0);assert.equal(h.timers.size,0);h.advance(20000);h.document.hidden=false;h.document.dispatch('visibilitychange');assert.equal(a.getState().speaking,true,'hidden time does not consume the captioned speaking interval');const b=h.box.ResearchAdvisors.mount(container,encounter,opts);assert.equal(a.getState().destroyed,true,'remount retires the previous rig');b.destroy();assert.equal(b.getState().destroyed,true);assert.equal(h.raf.size,0);assert.equal(h.timers.size,0);assert.equal(h.document.listeners.get('visibilitychange').size,0);assert.equal(container.querySelector('.research-advisor'),null);
});

test('app modal changes dispose adviser/toy resources without advancing research',()=>{
 const h=runtime(['data.js','landmarks.js','app.js']),g=h.box.AtlasGame,records=[];const controller=kind=>{const s={kind,destroyed:0};records.push(s);return{destroy(){s.destroyed++;},setReduced(){}};};h.box.ResearchAdvisors={mount:()=>controller('advisor')};h.box.CampusPlay={gadget:()=>({name:'Test workshop',description:'Optional toy',footnote:'Ungraded'}),mount:()=>controller('toy')};g.enterCampus(9);g.state.found.push(9);const before=copy({completed:g.state.completed,evidence:g.state.evidence,found:g.state.found});g.research();assert.equal(records.at(-1).kind,'advisor');h.click('settings');assert.equal(records[0].destroyed,1);h.click('close');assert.equal(records[0].destroyed,1,'cleanup is idempotent across modal replacement and close');g.research();h.click('close');assert.equal(records[1].destroyed,1);h.box.CampusPlay.gadget=()=>({name:'Test workshop',description:'Optional toy',footnote:'Ungraded',x:11,y:17});h.click('gadget');for(let i=0;i<150;i++){const frames=[...h.raf];h.raf.clear();for(const[,fn]of frames)fn(i*50);}const toy=records.findLast(r=>r.kind==='toy');assert.ok(toy,'walking to the optional workshop mounts a toy');h.click('close');assert.equal(toy.destroyed,1);assert.deepEqual(copy({completed:g.state.completed,evidence:g.state.evidence,found:g.state.found}),before,'adviser and toy interactions grant no research completion');
});

test('scene rasterization reuses ground/building/prop sprites and invalidates them on a campus change',()=>{
 const h=runtime(),created=[];h.box.OffscreenCanvas=class{constructor(w,height){this.width=w;this.height=height;this.draw=canvas();created.push(this);}getContext(){return this.draw.ctx;}};let paints=0,buildings=0,props=0;h.box.CampusArchitecture={draw(){buildings++;return true;}};h.load('scene-paint.js');const S=h.box.ScenePaint,env={iso,shade:c=>c},building={x:3,y:4,w:6,h:4,height:70,wall:'#b69a76',roof:'#6d7568',style:'hall',type:'office'},item={x:14,y:5,draw(){props++;}};S.begin(1);assert.equal(S.ground(h.draw.ctx,()=>paints++),true);assert.equal(S.ground(h.draw.ctx,()=>paints++),true);assert.equal(paints,1);assert.equal(S.building(h.draw.ctx,building,env),true);assert.equal(S.building(h.draw.ctx,{...building},env),true);assert.equal(buildings,1);assert.equal(S.prop(h.draw.ctx,item,'materials',env),true);assert.equal(S.prop(h.draw.ctx,item,'materials',env),true);assert.equal(props,1);assert.equal(S.stats.hits,3);assert.equal(created.length,3);S.begin(1);S.ground(h.draw.ctx,()=>paints++);assert.equal(paints,1,'re-entering the same render frame keeps the cache');S.begin(2);S.ground(h.draw.ctx,()=>paints++);S.building(h.draw.ctx,building,env);S.prop(h.draw.ctx,item,'materials',env);assert.equal(paints,2);assert.equal(buildings,2);assert.equal(props,2);const fallback=runtime(['scene-paint.js']);let immediate=0;assert.equal(fallback.box.ScenePaint.ground(fallback.draw.ctx,()=>immediate++),false);assert.equal(immediate,1,'Canvas implementations without a raster surface still paint the world');
});
