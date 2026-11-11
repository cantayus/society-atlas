/* Integration against actual app.js + challenge.js. Research judging is a callback
   adapter here; research.test.cjs separately checks answer validation and hints.
   The small DOM adapter does not stand in for browser layout or usability QA. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const dist=path.resolve(__dirname,'../dist');
const copy=value=>JSON.parse(JSON.stringify(value));

function load(initialSave){
 const noop=()=>{},events={},elements=new Map(),storage=new Map(),writes=[];let clock=1000,lastApi=null,mounts=0;
 if(initialSave)storage.set('society-atlas-v1',initialSave);
 const ctx=new Proxy({},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
 class Element{
  constructor(id){this.id=id;this.innerHTML='';this.textContent='';this.dataset={};this.value='';this.tagName='DIV';this.clientWidth=1280;this.clientHeight=800;this.style={setProperty:noop};this.classList={add:noop,remove:noop,toggle:noop};}
  get firstChild(){return this.innerHTML?{}:null;}
  getContext(){return ctx;}
  querySelector(selector){if(selector==='.research-complete')return this.innerHTML.includes('research-complete')?get(this.id+' '+selector):null;if(!this.innerHTML||(selector.startsWith('.')&&!this.innerHTML.includes(selector.slice(1))))return null;const child=get(this.id+' '+selector);child.innerHTML=this.innerHTML;return child;}
  querySelectorAll(){return[];}
  addEventListener(name,fn){(events[this.id+':'+name]||=[]).push(fn);}
  setAttribute(){}appendChild(){}focus(){}setPointerCapture(){}
  getClientRects(){return[{width:1,height:1}];}
  getBoundingClientRect(){return{left:0,top:0,width:1280,height:800};}
  insertAdjacentHTML(_where,html){this.innerHTML+=html;}
 }
 function get(id){if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id);}
 const box={console,Date,Math,JSON,Promise,Set,Map,Object,Array,Number,String,performance:{now:()=>clock},innerWidth:1280,innerHeight:800,devicePixelRatio:1,
  document:{hidden:false,querySelector:get,body:get('body'),documentElement:get('html'),createElement:tag=>new Element(tag),addEventListener(name,fn){(events['document:'+name]||=[]).push(fn);}},
  localStorage:{getItem:k=>storage.get(k)||null,setItem(k,v){storage.set(k,v);writes.push(JSON.parse(v));}},
  setTimeout:()=>1,clearTimeout:noop,requestAnimationFrame:()=>1,addEventListener(name,fn){(events['window:'+name]||=[]).push(fn);},
  AtlasAudio:{start:noop,setLevels:noop,setScene:noop,cue:noop},Research:{mount(_el,_encounter,api){lastApi=api;mounts++;}}};
 box.window=box;vm.createContext(box);for(const file of['data.js','landmarks.js','challenge.js','app.js'])vm.runInContext(fs.readFileSync(path.join(dist,file),'utf8'),box,{filename:file});
 const h={box,game:box.AtlasGame,get,storage,writes,get api(){return lastApi;},get mounts(){return mounts;},advance(ms){clock+=ms;},
  click(act){for(const fn of events['document:click']||[])fn({target:{closest:()=>({dataset:{act},disabled:false})}});},
  hidden(value){box.document.hidden=value;for(const fn of events['document:visibilitychange']||[])fn();},
  unload(){for(const fn of events['window:beforeunload']||[])fn();},
  open(id=9){this.game.enterCampus(id);if(!this.game.state.found.includes(id))this.game.state.found.push(id);this.click('research');return this.api;},
  answer(correct){this.api.interact();const out=this.api.submit({correct});if(out.failed)this.api.gameOver();return out;}
 };return h;
}

test('opening and reading research do not time it; first research interaction starts active time',()=>{
 const h=load();h.open();assert.equal(h.game.state.challenges[9].status,'ready');h.advance(600000);assert.equal(h.game.state.challenges[9].elapsedMs,0);h.api.interact();assert.equal(h.game.state.challenges[9].status,'active');h.advance(120001);const result=h.api.submit({correct:true});assert.equal(result.award.id,'SteadyInsight');assert.equal(result.elapsedMs,120001);h.api.complete('Verified teaching evidence.');assert(h.game.state.completed.includes(9));assert.equal(h.game.state.evidence.filter(e=>e.id===9).length,1);const stored=JSON.parse(h.storage.get('society-atlas-v1'));assert.equal(stored.challenges[9].award.points,50);assert.equal(stored.challenges[9].status,'passed');assert(stored.completed.includes(9));
});

test('actual app scoring returns the automatic-hint signal on error two and game over on five',()=>{
 const h=load();h.open();assert.equal(h.answer(false).errors,1);const second=h.answer(false);assert.equal(second.errors,2);assert.equal(second.autoHint,true);assert.equal(second.hintUnlocked,true);assert.equal(h.answer(false).autoHint,false);assert.equal(h.answer(false).errors,4);const fifth=h.answer(false);assert.equal(fifth.errors,5);assert.equal(fifth.failed,true);assert.equal(h.game.state.challenges[9].status,'failed');assert.match(h.get('#overlays').innerHTML,/Game over/);assert.equal(h.game.state.completed.includes(9),false);assert.equal(h.box.AtlasChallenge.total(h.game.state.challenges),0);
 const calls=h.mounts;h.click('close');h.click('research');assert.match(h.get('#overlays').innerHTML,/Game over/);assert.equal(h.mounts,calls,'failed encounter does not mount a new research attempt merely by reopening');assert.equal(h.game.state.challenges[9].errors,5);
});

test('late completion from a failed attempt cannot bypass game over or grant campaign evidence',()=>{
 const h=load();const api=h.open();for(let i=0;i<5;i++)h.answer(false);const before=copy({completed:h.game.state.completed,evidence:h.game.state.evidence,challenge:h.game.state.challenges[9]});api.submit({correct:true});api.complete('Late result from a failed research view');assert.deepEqual(copy({completed:h.game.state.completed,evidence:h.game.state.evidence,challenge:h.game.state.challenges[9]}),before);assert.equal(h.box.AtlasChallenge.total(h.game.state.challenges),0);
});

test('retry resets only the failed puzzle while keeping previous campuses, evidence and awards',()=>{
 const h=load(),g=h.game;g.state.completed=[1];g.state.found=[1,9];g.state.evidence=[{id:1,text:'Earlier fieldwork evidence'}];g.state.puzzles={1:{observations:['kept']},9:{seed:41,answer:'old'},10:{labels:['kept']}};g.state.challenges={1:{}};h.box.AtlasChallenge.create(g.state.challenges[1],{now:()=>0}).correct();const previous=copy({completed:g.state.completed,evidence:g.state.evidence,one:g.state.puzzles[1],ten:g.state.puzzles[10],award:g.state.challenges[1].award});h.open(9);for(let i=0;i<5;i++)h.answer(false);h.click('retry-challenge');assert.equal(g.state.challenges[9].attempt,2);assert.equal(g.state.challenges[9].status,'ready');assert.equal(g.state.challenges[9].errors,0);assert.deepEqual(copy(g.state.puzzles[9]),{});assert.deepEqual(copy({completed:g.state.completed,evidence:g.state.evidence,one:g.state.puzzles[1],ten:g.state.puzzles[10],award:g.state.challenges[1].award}),previous);assert.equal(h.box.AtlasChallenge.total(g.state.challenges),100);assert.match(h.get('#overlays').innerHTML,/research-modal/);
});

test('retry command cannot erase an unfinished nonfailed or already passed puzzle',()=>{
 for(const passed of[false,true]){
  const h=load();h.open();h.game.state.puzzles[9]={valuable:'keep this state'};if(passed){h.api.interact();h.api.submit({correct:true});h.api.complete('Kept result');}const before=copy({puzzle:h.game.state.puzzles[9],challenge:h.game.state.challenges[9],completed:h.game.state.completed,evidence:h.game.state.evidence});const calls=h.mounts;h.click('retry-challenge');assert.deepEqual(copy({puzzle:h.game.state.puzzles[9],challenge:h.game.state.challenges[9],completed:h.game.state.completed,evidence:h.game.state.evidence}),before);assert.equal(h.mounts,calls);
 }
});

test('first-clear points persist across reload; completed replays are unscored and cannot farm rewards',()=>{
 const h=load();h.open();h.api.interact();h.advance(180000);h.api.submit({correct:true});h.api.complete('First clear');h.click('close');const saved=h.storage.get('society-atlas-v1'),restored=load(saved),g=restored.game;assert.equal(restored.box.AtlasChallenge.total(g.state.challenges),50);const ledger=copy(g.state.challenges[9]),evidence=copy(g.state.evidence);restored.open(9);restored.api.interact();restored.advance(1000);assert.equal(restored.api.submit({correct:true}).replay,true);restored.api.complete('Practice replay');restored.api.submit({correct:false});assert.deepEqual(copy(g.state.challenges[9]),ledger);assert.deepEqual(copy(g.state.evidence),evidence);assert.equal(restored.box.AtlasChallenge.total(g.state.challenges),50);assert.equal(JSON.parse(restored.storage.get('society-atlas-v1')).challenges[9].award.points,50);
});

test('modal reopening waits for interaction; a visible active lab resumes with hidden time excluded',()=>{
 const h=load();h.open();h.api.interact();h.advance(30000);h.click('close');assert.equal(h.game.state.challenges[9].status,'paused');assert.equal(h.game.state.challenges[9].elapsedMs,30000);h.advance(600000);h.click('research');assert.equal(h.game.state.challenges[9].status,'paused');h.advance(90000);h.api.interact();assert.equal(h.game.state.challenges[9].elapsedMs,30000);h.advance(20000);h.hidden(true);assert.equal(h.game.state.challenges[9].status,'paused');assert.equal(h.game.state.challenges[9].elapsedMs,50000);h.advance(600000);h.hidden(false);assert.equal(h.game.state.challenges[9].status,'active','an already-started visible lab resumes without another once-per-mount interact callback');assert.equal(h.game.state.challenges[9].elapsedMs,50000);h.advance(70000);const result=h.api.submit({correct:true});assert.equal(result.elapsedMs,120000);assert.equal(result.award.id,'QuickInsight');
});

test('unloading checkpoints the challenge in the durable save without counting later absence',()=>{
 const h=load();h.open();h.api.interact();h.advance(12000);h.unload();const record=JSON.parse(h.storage.get('society-atlas-v1')).challenges[9];assert.equal(record.status,'paused');assert.equal(record.elapsedMs,12000);const resumed=load(h.storage.get('society-atlas-v1'));resumed.open(9);resumed.advance(900000);assert.equal(resumed.game.state.challenges[9].elapsedMs,12000);resumed.api.interact();resumed.advance(1000);assert.equal(resumed.api.submit({correct:true}).elapsedMs,13000);
});
