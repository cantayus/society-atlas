/* Logic-level QA only. This mock DOM is not a browser, rendering test or screen-reader audit. */
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const dist = path.resolve(__dirname, '../dist');

function load(initialSave) {
  const noop = () => {};
  const draw = new Proxy({}, { get(o, k) { return k in o ? o[k] : noop; }, set(o, k, v) { o[k] = v; return true; } });
  const events = {}, storage = new Map(), elements = new Map(), frames = [], observers=[];
  if(initialSave)storage.set('society-atlas-v1',initialSave);
  let researchCalls = 0, lastApi;
  class Element {
    constructor(id) { this.id = id; this._html = ''; this.textContent = ''; this.value='';this.selectedIndex=0;this.dataset = {}; this.style = { setProperty: noop }; const classes=new Set();this.classList = { toggle(k,v) { if(v===undefined)v=!classes.has(k);v?classes.add(k):classes.delete(k);return v; }, add:k=>classes.add(k), remove:k=>classes.delete(k),contains:k=>classes.has(k) }; this.clientWidth = 1280; this.clientHeight = 800; this.width = 1280; this.height = 800; this.tagName = 'DIV'; }
    set innerHTML(v) { this._html = v; for(const observer of observers)if(observer.target===this)observer.callback(); }
    get innerHTML() { return this._html; }
    get firstChild() { return this._html ? {} : null; }
    getContext() { return draw; }
    addEventListener(type, fn) { (events[this.id + ':' + type] ||= []).push(fn); }
    querySelector(selector) { if(selector === '.research-complete') return this._html.includes('research-complete') ? get(selector) : null; if(!this._html||(selector.startsWith('.')&&!this._html.includes(selector.slice(1))))return null;const child=get(this.id+' '+selector);child._html=this._html;return child; }
    querySelectorAll() {return this._focusables||[];}
    getClientRects() {return [{width:1,height:1}];}
    focus() { this.focused = true; context.document.activeElement=this; }
    setPointerCapture() {}
    setAttribute(k,v) { (this.attributes||={})[k]=v; }
    appendChild() {}
    getBoundingClientRect() { return { left: 0, top: 0, width: this.clientWidth, height: this.clientHeight }; }
    insertAdjacentHTML(_where, text) { this._html += text; }
    remove() {}
    click() {}
  }
  function get(id) { if (!elements.has(id)) elements.set(id, new Element(id)); return elements.get(id); }
  const context = {
    console, Date, JSON, Math, Set, Map, Object, Array, Number, String, Promise,
    innerWidth: 1280, innerHeight: 800, devicePixelRatio: 1,
    document: { querySelector: get, body: get('body'), documentElement: get('html'), addEventListener(type, fn) { (events['document:' + type] ||= []).push(fn); }, createElement: () => new Element('created') },
    localStorage: { getItem: k => storage.get(k) || null, setItem: (k, v) => storage.set(k, v) },
    Image: class { constructor() { this.complete = false; this.naturalWidth = 0; } },
    requestAnimationFrame: fn => { frames.push(fn); return frames.length; },
    setTimeout: () => 1, clearTimeout: noop,
    MutationObserver: class {constructor(callback){this.callback=callback;}observe(target){this.target=target;observers.push(this);}},
    addEventListener(type, fn) { (events['window:' + type] ||= []).push(fn); },
    AtlasAudio: { start: noop, setLevels: noop, setScene: noop, cue: noop },
    Research: { mount(_el, _encounter, api) { researchCalls++; lastApi = api; } },
    Blob: class {}, URL: { createObjectURL: () => 'blob:test', revokeObjectURL: noop }
  };
  context.window = context;
  vm.createContext(context);
  for (const file of ['data.js', 'landmarks.js', 'app.js']) if(fs.existsSync(path.join(dist,file))) vm.runInContext(fs.readFileSync(path.join(dist, file), 'utf8'), context, { filename: file });
  let now = 0;
  return {
    game: context.AtlasGame, data: context.ATLAS_DATA, context, storage, elements,
    get researchCalls() { return researchCalls; }, get researchApi() { return lastApi; },
    click(act) { const button = { dataset: { act }, disabled: false }; for(const fn of events['document:click'] || []) fn({ target: { closest: () => button } }); },
    key(key,target=get('#world'),shiftKey=false) {let prevented=false;const event={key,target,shiftKey,preventDefault(){prevented=true;}};for(const fn of events['document:keydown']||[])fn(event);return prevented;},
    input(target) {for(const fn of events['document:input']||[])fn({target});},
    element:get,
    tick() { const fn = frames.shift(); assert.ok(fn, 'animation callback remains scheduled'); fn(now += 50); },
    runUntilModal(maxFrames=2000) { let n = 0; while(!get('#overlays').firstChild && n++ < maxFrames) this.tick(); assert.ok(n < maxFrames, 'travel reaches a modal without a soft lock'); },
    html: id => get(id).innerHTML
  };
}

function independentDistance(grid, start, end) {
  const q = [[...start, 0]], seen = new Set([start.join(',')]);
  for(let i=0; i<q.length; i++) {
    const [x,y,d] = q[i];
    if(x===end[0] && y===end[1]) return d;
    for(let dy=-1; dy<=1; dy++) for(let dx=-1; dx<=1; dx++) {
      if(!dx&&!dy) continue;
      const a=x+dx,b=y+dy,key=a+','+b;
      if(grid[b]?.[a]!==0 || seen.has(key)) continue;
      if(dx&&dy && (grid[y]?.[a]!==0 || grid[b]?.[x]!==0)) continue;
      seen.add(key); q.push([a,b,d+1]);
    }
  }
  return Infinity;
}

function validatePath(game, start, target, route) {
  assert.ok(route, `reachable target ${target}`);
  assert.equal(route.length, independentDistance(game.grid,start,target), 'route has minimum number of grid steps');
  let [x,y] = start;
  for (const next of route) {
    const dx=next.x-x,dy=next.y-y;
    assert.ok(Math.abs(dx)<=1 && Math.abs(dy)<=1 && (dx||dy), 'every step is adjacent');
    assert.ok(game.walkable(next.x,next.y), 'step stays on traversable ground');
    if(dx&&dy) { assert.ok(game.walkable(x+dx,y), 'diagonal first corner is clear'); assert.ok(game.walkable(x,y+dy), 'diagonal second corner is clear'); }
    x=next.x;y=next.y;
  }
  assert.deepEqual([x,y],target,'route reaches exact target');
}

test('all eighteen campaigns have complete metadata and valid source IDs',()=>{
  const {data}=load(), ids=new Set(data.sources.map(s=>s.id));
  assert.equal(data.encounters.length,18);
  assert.equal(new Set(data.encounters.map(e=>e.id)).size,18);
  for(const e of data.encounters) {
    for(const key of ['name','campus','title','objective','clue','office','limitation','transfer']) assert.ok(e[key],`${e.id} ${key}`);
    assert.ok(e.dialogue.length>=3);
    assert.ok(e.sourceIds.length>0);
    for(const id of e.sourceIds) assert.ok(ids.has(id),`source ${id} exists`);
  }
});

test('all 18 campuses have reachable directory, archive, office and continuous ground paths',()=>{
  const {game}=load();
  const targets=[[12,20],[6,16],[20,8]];
  for(let id=1;id<=18;id++) {
    game.enterCampus(id);
    assert.ok(game.walkable(12,23),`${id}: spawn is traversable`);
    for(const end of targets) validatePath(game,[12,23],end,game.findPath(12,23,...end));
    for(let i=0;i<targets.length;i++) for(let j=i+1;j<targets.length;j++) validatePath(game,targets[i],targets[j],game.findPath(...targets[i],...targets[j]));
    for(const [x,y] of [[-1,0],[0,-1],[26,0],[0,26],[20,6],[6,14],[12,12],[14,9],[14,10]]) assert.equal(game.walkable(x,y),false,`${id}: blocked/boundary ${x},${y}`);
    for(const end of [[20,6],[12,12],[14,9],[-1,0]]) assert.equal(game.findPath(12,23,...end),null);
    const landmark=game.landmarkFor(id);assert.ok(landmark.name&&landmark.style&&landmark.wall&&landmark.roof,`${id}: sourced landmark supplies rendering data`);
    assert.ok(landmark.sources?.length,`${id}: landmark has source references`);
  }
});

test('settings apply assisted-navigation state and remapped keys drive movement',()=>{
  const h=load();h.game.enterCampus(1);
  const assist={dataset:{setting:'assist'},type:'checkbox',checked:false,parentElement:{querySelector:()=>null}};
  h.input(assist);assert.equal(h.game.state.settings.assist,false);assert.ok(h.element('body').classList.contains('no-assist'));
  assist.checked=true;h.input(assist);assert.ok(!h.element('body').classList.contains('no-assist'));
  for(const [action,key]of Object.entries({up:'i',left:'j',down:'k',right:'l',interact:'u',center:'o'}))h.input({dataset:{keymap:action},value:key});
  assert.equal(h.game.state.settings.keys.up,'i');
  h.input({dataset:{keymap:'up'},value:'j'});assert.equal(h.game.state.settings.keys.up,'i','duplicate command is rejected');
  h.input({dataset:{keymap:'up'},value:'1'});assert.equal(h.game.state.settings.keys.up,'i','non-letter command is rejected');
  h.key('i');for(let n=0;n<10;n++)h.tick();
  assert.equal(h.game.state.position.y,22,'new movement key moves north from spawn');
  h.key('w');for(let n=0;n<10;n++)h.tick();assert.equal(h.game.state.position.y,22,'old movement key stops controlling movement');
});

test('Space preserves focused button activation and dialogs wire inert state and focus wrap',()=>{
  const h=load();h.game.enterCampus(1);
  const button=h.element('test-button');button.tagName='BUTTON';
  assert.equal(h.key(' ',button),false,'Space on a button retains default activation');
  assert.equal(h.key(' '),true,'Space on canvas invokes pause');
  assert.ok(h.html('#app').includes('▶ Resume'));
  h.click('controls');
  assert.equal(h.element('#app').inert,true);assert.equal(h.element('#world').inert,true);
  const first=h.element('first-focus'),last=h.element('last-focus');first.tagName=last.tagName='BUTTON';
  h.element('#overlays')._focusables=[first,last];first.focus();
  assert.equal(h.key('Tab',first,true),true);assert.equal(h.context.document.activeElement,last,'Shift+Tab wraps to last dialog control');
  assert.equal(h.key('Tab',last,false),true);assert.equal(h.context.document.activeElement,first,'Tab wraps to first dialog control');
  h.click('close');assert.equal(h.element('#app').inert,false);assert.equal(h.element('#world').inert,false);assert.equal(h.context.document.activeElement,h.element('#world'));
});

test('finale requires completion, required proposal fields and coherent claim/evidence/test combinations',()=>{
  const h=load();h.game.enterCampus(18);h.click('finale');assert.ok(!h.html('#overlays').includes('THE BELLWETHER COLLOQUIUM'));
  h.game.state.completed=Array.from({length:18},(_,i)=>i+1);h.click('finale');
  const options={};
  for(const id of ['claim','evidence','limit','test']) {
    const select=h.html('#overlays').match(new RegExp('<select id="final-'+id+'">([\\s\\S]*?)</select>'));
    assert.ok(select,`finale supplies ${id} field`);
    options[id]=[...select[1].matchAll(/<option(?: [^>]*)?>(.*?)<\/option>/g)].map(m=>m[1]);
    h.element('#final-'+id).value='';
  }
  h.click('proposal');assert.equal(h.game.state.proposal,null);assert.match(h.element('#proposal-result').textContent,/Include a claim/);
  const coherent={1:new Set(['1,1','1,2']),2:new Set(['2,3']),3:new Set(['1,1','1,2','3,1','3,2']),4:new Set(['3,2']),5:new Set(['1,1','1,2','1,3','2,1','2,2','2,3','3,1','3,2','3,3'])};
  for(let claim=1;claim<=5;claim++)for(let evidence=1;evidence<=3;evidence++)for(let strategy=1;strategy<=3;strategy++) {
    for(const [id,index]of [['claim',claim],['evidence',evidence],['limit',1],['test',strategy]])Object.assign(h.element('#final-'+id),{value:options[id][index],selectedIndex:index});
    h.element('#final-rival').value='Work and care schedules may also affect participation.';
    h.game.state.proposal=null;h.element('#proposal-result').innerHTML='';h.element('#proposal-result').textContent='';
    h.click('proposal');
    const accepted=coherent[claim].has(evidence+','+strategy);
    assert.equal(!!h.game.state.proposal,accepted,`claim ${claim}, evidence ${evidence}, study ${strategy}`);
    if(accepted){assert.match(h.game.state.proposal,/Work and care schedules/);assert.match(h.game.state.proposal,/no real policy effect has been established/);}
    else assert.match(h.element('#proposal-result').textContent,/Connect the claim/);
  }
});

test('diagonal moves cannot cross building, pond or stair corners',()=>{
  const {game}=load();game.enterCampus(1);
  for(const [start,end] of [[[2,12],[3,11]],[[9,11],[10,10]],[[13,9],[14,8]],[[17,13],[18,12]]]) {
    const route=game.findPath(...start,...end);validatePath(game,start,end,route);
    assert.ok(route.length>1,'blocked-corner diagonal requires a detour');
  }
});

test('world graph connects all 18 campus and both gateway nodes bidirectionally',()=>{
  const {game}=load();
  const allowed=new Set(Array.from({length:20},(_,i)=>i+1));
  for(let a=1;a<=20;a++) for(let b=1;b<=20;b++) {
    const route=game.shortestRoute(a,b);
    assert.ok(route.length>0,`${a} -> ${b} exists`);
    assert.equal(route[0],a);assert.equal(route.at(-1),b);
    assert.equal(new Set(route).size,route.length,'route has no loops');
    assert.equal(route.length,game.shortestRoute(b,a).length,'reverse route is equally short');
    for(const id of route)assert.ok(allowed.has(id));
    for(let i=1;i<route.length;i++)assert.equal(game.shortestRoute(route[i-1],route[i]).length,2,'each route step is a direct connection');
  }
});

test('navigation and research are separate and every campus completes the authored arrival loop',()=>{
  const h=load(), {game}=h;
  for(let id=1;id<=18;id++) {
    game.enterCampus(id);
    const before=h.researchCalls;
    h.click('research');
    assert.equal(h.researchCalls,before,'unvisited office cannot start research');
    h.click('directory');h.runUntilModal();
    assert.ok(game.state.clues.includes(id),'directory produces required clue');
    assert.ok(!game.state.found.includes(id),'reading a directory does not discover the office');
    h.click('office');h.runUntilModal();
    assert.ok(game.state.found.includes(id),'walking reaches the office');
    assert.ok(!game.state.completed.includes(id),'office arrival does not complete research');
    h.click('research');
    assert.equal(h.researchCalls,before+1);
    h.researchApi.complete('Independent test result '+id);
    assert.ok(game.state.completed.includes(id));
    const count=game.state.evidence.length;
    h.researchApi.complete('Repeated completion');
    assert.equal(game.state.evidence.length,count,'replay cannot duplicate evidence');
  }
  assert.equal(game.state.completed.length,18);
  assert.equal(game.state.found.length,18);
  assert.ok(h.html('#app').includes('Final colloquium'),'finale command becomes available');
});

test('save records separate visits, discoveries, evidence and preference state',()=>{
  const h=load(),{game}=h;game.enterCampus(12);
  game.state.settings.reduced=true;game.state.settings.music=.2;
  game.state.completed.push(1);game.state.evidence.push({id:1,text:'Fictional sampling audit'});
  game.enterCampus(13);
  const stored=JSON.parse(h.storage.get('society-atlas-v1'));
  assert.equal(stored.version,1);assert.equal(stored.current,13);
  assert.ok(stored.completed.includes(1));assert.equal(stored.evidence[0].text,'Fictional sampling audit');
  assert.ok(stored.discovered['12'].length>0 && stored.discovered['13'].length>0);
  assert.equal(stored.settings.reduced,true);assert.equal(stored.settings.music,.2);
  stored.found=[1,12];stored.clues=[1,12];stored.routeNode=19;stored.routeHistory=[1,2,3,4,19];stored.puzzles={'12':{codebook:'stance',heldoutRead:true}};
  stored.position={id:13,x:12,y:20};
  const resumed=load(JSON.stringify(stored));resumed.game.enterCampus(13,true);
  assert.equal(resumed.game.state.current,13);
  assert.deepEqual(Array.from(resumed.game.state.found),[1,12]);
  assert.equal(resumed.game.state.routeNode,19);
  assert.equal(resumed.game.state.puzzles['12'].heldoutRead,true);
  assert.equal(resumed.game.state.settings.reduced,true);
  assert.equal(resumed.game.state.position.x,12);assert.equal(resumed.game.state.position.y,20);
});
