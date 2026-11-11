/* Source/asset and drawing-contract QA. A strict Canvas mock checks geometry;
   it is not a browser, screenshot comparison, visual review or performance test. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const dist=path.resolve(__dirname,'../dist');
const read=file=>fs.readFileSync(path.join(dist,file),'utf8');
const json=file=>JSON.parse(read(file));

function strictCanvas(){
  let count=0,depth=0,digest=2166136261;
  const finite=(name,args)=>{for(const v of args.flat(Infinity))if(typeof v==='number')assert.ok(Number.isFinite(v),`${name}: finite numeric coordinate`);};
  function record(name,args){count++;finite(name,args);for(const v of [name,...args.flat(Infinity)]){const s=String(v);for(let n=0;n<s.length;n++)digest=Math.imul(digest^s.charCodeAt(n),16777619)>>>0;}}
  const gradient={addColorStop(offset,color){assert.ok(Number.isFinite(offset)&&offset>=0&&offset<=1);assert.equal(typeof color,'string');record('colorStop',[offset,color]);}};
  const target={
    save(){depth++;record('save',[]);},restore(){assert.ok(depth>0,'Canvas restore has a matching save');depth--;record('restore',[]);},
    arc(...a){assert.ok(a[2]>=0,'arc radius is nonnegative');record('arc',a);},
    ellipse(...a){assert.ok(a[2]>=0&&a[3]>=0,'ellipse radii are nonnegative');record('ellipse',a);},
    roundRect(...a){for(const radius of [a[4]??0].flat(Infinity))assert.ok(radius>=0,'roundRect radius is nonnegative');record('roundRect',a);},
    createLinearGradient(...a){record('linearGradient',a);return gradient;},
    createRadialGradient(...a){assert.ok(a[2]>=0&&a[5]>=0);record('radialGradient',a);return gradient;},
    measureText(s){return{width:String(s).length*7};}
  };
  const ctx=new Proxy(target,{get(o,k){if(k in o)return o[k];return(...args)=>record(k,args);},set(o,k,v){if(['lineWidth','globalAlpha','shadowBlur','shadowOffsetX','shadowOffsetY'].includes(k)){assert.ok(Number.isFinite(v),`${k} is finite`);if(k==='globalAlpha')assert.ok(v>=0&&v<=1);}if((k==='fillStyle'||k==='strokeStyle')&&typeof v==='string'&&v[0]==='#')assert.match(v,/^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,'valid hexadecimal paint');o[k]=v;return true;}});
  return{ctx,get count(){return count;},get depth(){return depth;},get digest(){return digest;},reset(){count=0;digest=2166136261;assert.equal(depth,0);}};
}

function load(){
  const draw=strictCanvas(),events={},elements=new Map(),frames=[];
  const noop=()=>{};
  class Element{
    constructor(id){this.id=id;this.innerHTML='';this.textContent='';this.dataset={};this.style={setProperty:noop};this.classList={toggle:noop,add:noop,remove:noop};this.clientWidth=1440;this.clientHeight=900;this.tagName='DIV';}
    get firstChild(){return this.innerHTML?{}:null;}
    getContext(){return draw.ctx;}
    addEventListener(name,fn){(events[this.id+':'+name]||=[]).push(fn);}
    querySelector(s){if(s==='.research-complete')return null;if(!this.innerHTML||(s.startsWith('.')&&!this.innerHTML.includes(s.slice(1))))return null;const child=get(this.id+' '+s);child.innerHTML=this.innerHTML;return child;}
    querySelectorAll(){return[];}
    focus(){}setPointerCapture(){}getClientRects(){return[{width:1}];}
    setAttribute(k,v){(this.attributes||={})[k]=v;}appendChild(){}
    getBoundingClientRect(){return{left:0,top:0,width:this.clientWidth,height:this.clientHeight};}
    insertAdjacentHTML(_where,value){this.innerHTML+=value;}
  }
  const get=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id);};
  const context={console,Date,Math,JSON,Promise,Set,Map,Object,Array,Number,String,innerWidth:1440,innerHeight:900,devicePixelRatio:1,
    document:{querySelector:get,getElementById:id=>get('#'+id),body:get('body'),documentElement:get('html'),createElement:tag=>new Element('created-'+tag),addEventListener(name,fn){(events['doc:'+name]||=[]).push(fn);}},
    localStorage:{getItem:()=>null,setItem:noop},setTimeout:()=>1,clearTimeout:noop,requestAnimationFrame:fn=>frames.push(fn),addEventListener:noop,
    AtlasAudio:{start:noop,setLevels:noop,setScene:noop,cue:noop},Research:{mount:noop},Image:class{constructor(){this.complete=false;}}};
  context.window=context;vm.createContext(context);
  for(const file of ['data.js','landmarks.js','quotes.js','portraits.js','architecture.js','atmosphere.js','render-world.js','app.js'])vm.runInContext(read(file),context,{filename:file});
  const styles=new Set(),architecture=context.CampusArchitecture.draw;
  context.CampusArchitecture.draw=(ctx,b,env)=>{const handled=architecture(ctx,b,env);if(b.type==='landmark'){assert.equal(handled,true,`signature landmark ${b.style} is handled`);styles.add(b.style);}return handled;};
  let now=0;
  return{context,draw,styles,get,game:context.AtlasGame,
    click(act){for(const fn of events['doc:click']||[])fn({target:{closest:()=>({dataset:{act}})}});},
    frame(width=1440,height=900){get('#world').clientWidth=width;get('#world').clientHeight=height;const fn=frames.shift();assert.ok(fn);fn(now+=50);assert.equal(draw.depth,0,'frame balances its Canvas state');},
    html:id=>get(id).innerHTML};
}

test('every chapter has its verified archival leader and quotation sources stay within the excerpt budget',()=>{
  const h=load(),q=h.context.ATLAS_QUOTES,partA=json('quotes-part-a.json'),partB=json('quotes-part-b.json');
  assert.ok(q.menu.length>=2);assert.equal(Object.keys(q.chapters).length,18);
  const researched=[...Object.values(partA.quotes),...partB.chapters,...partB.menu];
  const lookup=new Set(researched.map(v=>v.author+'|'+v.source+'|'+v.text));
  const expected={1:'Amy Gutmann',2:'Charles William Eliot',3:'Charles William Eliot',8:'Charles M. Vest',9:'Charles William Eliot',10:'Joseph E. Aoun',11:'Gerhard Casper',12:'Eric J. Barron',13:'William H. Danforth',14:'Jared L. Cohon',15:'Shirley M. Tilghman',16:'Gerhard Casper',17:'Charles M. Vest',18:'Charles M. Vest'};
  const pages=new Map();
  for(const [key,v]of [...q.menu.map((v,i)=>['menu '+i,v]),...Object.entries(q.chapters)]){
    assert.ok(lookup.has(v.author+'|'+v.source+'|'+v.text),`${key}: wording and attribution match the researched source ledger`);
    assert.match(v.source,/^https:\/\//);assert.ok(v.sourceTitle&&v.context);
    if(!key.startsWith('menu')){assert.ok(v.role&&v.tenure);assert.match(v.role,/President|Chancellor/);if(expected[key])assert.equal(v.author,expected[key]);}
    const url=new URL(v.source);url.hash='';const page=url.href;
    if(!pages.has(page))pages.set(page,new Set());pages.get(page).add(v.text);
  }
  for(const [page,texts]of pages){const words=[...texts].join(' ').match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)||[];assert.ok(words.length<=22,`${page}: ${words.length} quoted words per distinct source page`);}
  assert.match(q.chapters[13].role,/Chancellor/,'WashU uses the correct leader title');
  const first=h.html('#app');h.click('quote-next');assert.notEqual(h.html('#app'),first,'the menu offers another verified quotation');
});

test('runtime scripts, local portrait media and music exist with explicit non-generative provenance',()=>{
  const html=read('index.html'),css=read('style.css');
  for(const [,ref]of html.matchAll(/(?:src|href)="([^"]+)"/g)){
    if(ref.startsWith('#')||/^(https?:|data:)/.test(ref))continue;
    assert.ok(fs.existsSync(path.join(dist,ref)),`runtime file ${ref} exists`);
  }
  assert.doesNotMatch(html+css,/fonts\.googleapis|fonts\.gstatic|@import\s+url/i,'no remote font dependency');
  assert.doesNotMatch(read('app.js')+html+css,/menu-campus\.png|generated-menu|imagegen/i,'runtime has no generated menu bitmap reference');
  assert.ok(!fs.existsSync(path.join(dist,'assets/menu-campus.png')),'former generated menu asset is absent');
  const provenance=json('assets/provenance.json');assert.equal(provenance.scenery.generationModel,false);assert.equal(provenance.portraits.generationModel,false);
  const h=load(),portraits=h.context.ATLAS_PORTRAITS;assert.ok(Array.isArray(portraits)&&portraits.length>=18);
  assert.equal(new Set(portraits.map(p=>p.name)).size,portraits.length,'portrait subjects are uniquely identified');
  for(const p of portraits){
    assert.ok(p.name&&p.source&&p.file&&p.license);assert.match(p.source,/^https:\/\//);
    const full=path.resolve(dist,p.file);assert.ok(full.startsWith(dist+path.sep),'portrait path stays within the deliverable');
    assert.ok(fs.existsSync(full),`${p.name}: portrait exists`);const bytes=fs.readFileSync(full);assert.ok(bytes.length>512,`${p.name}: nonempty image`);
    if(/\.jpe?g$/i.test(full))assert.equal(bytes.subarray(0,3).toString('hex'),'ffd8ff',`${p.name}: actual JPEG, not a downloaded HTML page`);
    else if(/\.png$/i.test(full))assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',`${p.name}: actual PNG`);
  }
  const music=json('assets/music-credits.json');assert.ok(music.localFile&&music.sourcePage&&music.license);
  const runtimeSource=read('audio.js').match(/MUSIC_SRC\s*=\s*['"]([^'"]+)['"]/);assert.ok(runtimeSource,'audio runtime declares its music source');
  const ogg=fs.readFileSync(path.join(dist,runtimeSource[1]));assert.equal(ogg.subarray(0,4).toString(),'OggS');assert.equal(runtimeSource[1],music.localFile,'music runtime and credits refer to the same local recording');
});

test('all eighteen research scenes display named source photographs rather than missing portrait placeholders',()=>{
  const h=load();
  for(let id=1;id<=18;id++){
    h.game.enterCampus(id);h.game.state.found.push(id);h.click('research');const html=h.html('#overlays');
    assert.ok(html.includes('scholar-profile'),`${id}: named portrait is shown`);
    assert.ok(!html.includes('portrait-missing'),`${id}: every credited portrait in the scene is available`);
    assert.match(html,/Photo source/);assert.match(html,/ink-and-color filter/);
    if(id===9)for(const name of ['Gary King','Jennifer Pan','Margaret E. Roberts'])assert.ok(html.includes(name));
    if(id===11)for(const name of ['Timnit Gebru','Fei-Fei Li'])assert.ok(html.includes(name));
  }
});

test('all eighteen campuses draw at desktop and portrait sizes with finite geometry and valid radii',()=>{
  const h=load();h.frame();
  for(let id=1;id<=18;id++)for(const [width,height]of [[1440,900],[1158,1244]])for(const reduced of [true,false]){
    h.game.enterCampus(id);h.game.state.settings.reduced=reduced;const before=JSON.stringify(h.game.grid),count=h.draw.count;
    h.frame(width,height);assert.ok(h.draw.count>count,`${id}: scene issues draw operations`);assert.equal(JSON.stringify(h.game.grid),before,'landscaping never changes the collision grid');
  }
  assert.equal(h.styles.size,13,'all thirteen signature architectural renderers are exercised by the campaign');
});

test('ground detail and prop coordinates are reproducible for each campus',()=>{
  const h=load(),a=h.context.CampusAtmosphere;
  const iso=(x,y)=>({x:(x-y)*30,y:(x+y)*15});
  const hash=(x,y)=>{let n=(Math.imul(x,374761393)+Math.imul(y,668265263))>>>0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296;};
  const shade=(hex,n)=>'#'+[1,3,5].map(i=>Math.max(0,Math.min(255,parseInt(hex.slice(i,i+2),16)+n)).toString(16).padStart(2,'0')).join('');
  for(let id=1;id<=18;id++){
    h.game.enterCampus(id);const e={iso,hash,shade,id,grid:h.game.grid,N:26,TW:60,TH:30,time:12,reduced:true};
    const once=()=>{h.draw.reset();a.drawGround(h.draw.ctx,e);const props=a.props(e);assert.ok(props.length>=15);for(const p of props){assert.ok(Number.isFinite(p.depth));p.draw(h.draw.ctx);}assert.equal(h.draw.depth,0);return[h.draw.count,h.draw.digest];};
    assert.deepEqual(once(),once(),`${id}: surfaces and decorative props are seed-reproducible`);
  }
});
