/* Navigation/state tests against the actual app. DOM stubs are adapters only:
   these checks do not claim browser usability, keyboard focus or visual QA. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const dist=path.resolve(__dirname,'../dist');
function load(){
  const elements=new Map(),events={},writes=[],storage=new Map(),frames=[],noop=()=>{};
  const ctx=new Proxy({},{get:(o,k)=>o[k]||noop,set:(o,k,v)=>(o[k]=v,true)});
  const get=id=>{if(!elements.has(id))elements.set(id,{id,innerHTML:'',textContent:'',dataset:{},value:'',style:{setProperty:noop},classList:{toggle:noop,add:noop,remove:noop},clientWidth:1280,clientHeight:800,tagName:'DIV',get firstChild(){return this.innerHTML?{}:null;},getContext:()=>ctx,focus:noop,setAttribute(k,v){(this.attributes||={})[k]=v;},appendChild:noop,setPointerCapture:noop,addEventListener:noop,getBoundingClientRect:()=>({left:0,top:0,width:1280,height:800}),querySelector(s){return s==='.research-complete'?null:get(id+' '+s);},querySelectorAll:()=>[],insertAdjacentHTML(_where,s){this.innerHTML+=s;}});return elements.get(id);};
  const box={console,Date,Math,JSON,Promise,Set,Map,Object,Array,Number,String,innerWidth:1280,innerHeight:800,devicePixelRatio:1,
    document:{querySelector:get,body:get('body'),documentElement:get('html'),addEventListener:(n,fn)=>(events[n]||=[]).push(fn)},
    localStorage:{getItem:k=>storage.get(k)||null,setItem(k,v){storage.set(k,v);writes.push(JSON.parse(v));}},
    setTimeout:()=>1,clearTimeout:noop,requestAnimationFrame:fn=>frames.push(fn),addEventListener:noop,
    AtlasAudio:{start:noop,setLevels:noop,setScene:noop,cue:noop},Research:{mount(_el,_e,api){box.lastResearchApi=api;}}};
  box.window=box;vm.createContext(box);for(const file of ['data.js','landmarks.js','app.js'])vm.runInContext(fs.readFileSync(path.join(dist,file),'utf8'),box,{filename:file});
  return{game:box.AtlasGame,writes,storage,get,context:box,html:id=>get(id).innerHTML,
    press(dataset){for(const fn of events.click||[])fn({target:{closest:()=>({dataset,disabled:false})}});},
    click(act){this.press({act});}};
}
const copy=value=>JSON.parse(JSON.stringify(value));
function assertRoute(game,route,start,end){
  assert.ok(Array.isArray(route)&&route.length>0,'route is nonempty');assert.equal(route[0],start);assert.equal(route.at(-1),end);
  assert.equal(new Set(route).size,route.length,'route has no repeated nodes');
  for(const id of route)assert.ok(Number.isInteger(id)&&id>=1&&id<=20,'route uses an existing campus or gateway');
  for(let n=1;n<route.length;n++)assert.equal(game.shortestRoute(route[n-1],route[n]).length,2,`route hop ${route[n-1]} → ${route[n]} is a direct graph connection`);
}

test('recommendations choose the next uncompleted encounter and remain stable during replays',()=>{
  const h=load(),g=h.game;assert.equal(typeof g.nextEncounter,'function');
  assert.equal(g.nextEncounter().id,1,'tutorial is the first recommendation');
  for(let completed=1;completed<18;completed++){g.state.completed=Array.from({length:completed},(_,i)=>i+1);assert.equal(g.nextEncounter().id,completed+1);}
  g.state.completed=[9,1,5,3];assert.equal(g.nextEncounter().id,2,'branch visits do not skip an unfinished chapter');
  g.state.completed=[1,2,4];g.enterCampus(4);g.state.found.push(4);h.click('research');h.context.lastResearchApi.complete('Replay of chapter four');
  assert.equal(g.nextEncounter().id,3);assert.deepEqual(copy(g.state.completed),[1,2,4]);assert.equal(g.active.id,4,'replaying does not silently move the player');
  g.state.completed=Array.from({length:18},(_,i)=>i+1);assert.equal(g.nextEncounter(),null,'all chapters complete leads to the colloquium rather than a false next chapter');
});

test('tutorial gating rejects campus travel until the fieldwork problem is complete',()=>{
  const h=load(),g=h.game;g.enterCampus(1);
  const before=copy({current:g.state.current,route:g.state.routeNode,history:g.state.routeHistory,completed:g.state.completed,found:g.state.found,clues:g.state.clues});
  for(let id=2;id<=18;id++)assert.equal(g.travelTo(id),false,`${id}: tutorial gate remains enforced`);
  assert.deepEqual(copy({current:g.state.current,route:g.state.routeNode,history:g.state.routeHistory,completed:g.state.completed,found:g.state.found,clues:g.state.clues}),before,'blocked travel changes no campaign progress');
  g.state.found.push(1);assert.equal(g.travelTo(2),false,'finding the first office alone does not unlock travel');
  g.state.completed.push(1);assert.equal(g.travelTo(2),true,'solving the tutorial unlocks the next campus');
});

test('offered routes between every world node and campus consist only of valid graph hops',()=>{
  const {game:g}=load();let alternatives=0;
  for(let from=1;from<=20;from++)for(let to=1;to<=18;to++){
    const routes=g.routeOptions(from,to);assert.ok(routes.length>=1,`${from} → ${to}: route available`);
    for(const route of routes)assertRoute(g,route,from,to);
    assert.equal(routes[0].length,g.shortestRoute(from,to).length,'recommended route uses the shortest graph route');
    if(routes.length>1){alternatives++;assert.notDeepEqual(copy(routes[0]),copy(routes[1]),'alternative actually offers a different path');}
  }
  assert.ok(alternatives>0,'the route choice can show meaningful alternatives');
});

test('one-click travel reaches all eighteen campuses and persists each hop without solving the office task',()=>{
  const h=load(),g=h.game;g.state.completed=[1];
  for(let destination=1;destination<=18;destination++){
    const from=g.state.routeNode||1,route=copy(g.routeOptions(from,destination)[0]),history=copy(g.state.routeHistory),progress=copy({completed:g.state.completed,found:g.state.found,clues:g.state.clues,evidence:g.state.evidence}),writeStart=h.writes.length;
    assert.equal(g.travelTo(destination),true,`one travel command reaches campus ${destination}`);
    assert.equal(g.active.id,destination);assert.equal(g.state.current,destination);assert.equal(g.state.routeNode,destination);
    assert.deepEqual(copy(g.state.routeHistory),history.concat(route.slice(1)),'travel history records the chosen route');
    assert.deepEqual(copy({completed:g.state.completed,found:g.state.found,clues:g.state.clues,evidence:g.state.evidence}),progress,'transit never completes clues, office discovery or research');
    const records=h.writes.slice(writeStart);let cursor=0;
    for(const node of route.slice(1)){while(cursor<records.length&&records[cursor].routeNode!==node)cursor++;assert.ok(cursor<records.length,`hop ${node} is saved`);cursor++;}
    assert.equal(JSON.parse(h.storage.get('society-atlas-v1')).current,destination,'arrival is saved for Continue');
    if(destination!==1){assert.ok(h.html('#app').includes('FIND THE OFFICE'));assert.ok(!g.state.found.includes(destination));}
  }
});

test('the selected alternative route is followed and invalid destinations or route indices are recoverable',()=>{
  const h=load(),g=h.game;g.state.completed=[1];g.state.routeNode=1;g.state.routeHistory=[1];
  const routes=g.routeOptions(1,13);assert.ok(routes.length>1);const chosen=copy(routes[1]);
  assert.equal(g.travelTo(13,1),true);assert.deepEqual(copy(g.state.routeHistory),chosen);assert.equal(g.active.id,13);
  const before=copy({current:g.state.current,node:g.state.routeNode,history:g.state.routeHistory,completed:g.state.completed,found:g.state.found});
  for(const [destination,index]of [[0,0],[19,0],[99,0],[12,999],[12,-1]])assert.equal(g.travelTo(destination,index),false,`reject ${destination} via route ${index}`);
  assert.deepEqual(copy({current:g.state.current,node:g.state.routeNode,history:g.state.routeHistory,completed:g.state.completed,found:g.state.found}),before,'invalid travel does not corrupt the current visit');
});

test('completion surfaces a next-campus action and the Atlas preselects the unfinished recommendation',()=>{
  const h=load(),g=h.game;g.enterCampus(1);g.state.found.push(1);h.click('research');h.context.lastResearchApi.complete('Tutorial sampling result');
  const success=h.html('#research-mount');assert.match(success,/next-campus/,'completion offers an obvious next-campus control');assert.match(success,/Next campus/i);
  assert.match(h.html('#app'),/next-campus/,'the campus HUD keeps the next-campus action available');
  h.click('atlas');assert.match(h.html('#overlays'),/data-travel="2"/,'the Atlas initially selects the next unfinished campus');
  h.press({travel:'2',route:'0'});assert.equal(g.active.id,2,'the selected travel button reaches the recommended campus');assert.ok(!g.state.found.includes(2),'office navigation is still required at arrival');
  g.state.completed=[1,2,4];g.enterCampus(4);h.click('next-campus');
  if(g.active.id===4)assert.match(h.html('#overlays'),/data-travel="3"/,'replay Next campus selects the earliest unfinished visit');
  else assert.equal(g.active.id,3,'direct replay Next campus travels to the unfinished visit');
});
