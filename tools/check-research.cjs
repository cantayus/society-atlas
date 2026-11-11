const fs = require('fs');
const assert = require('assert');
global.window = {};
require('../dist/research.js');
const T=window.Research._test;
assert.deepStrictEqual(T.neighborhood(11),T.neighborhood(11));
assert.deepStrictEqual(T.runNeighborhood(T.neighborhood(11),.4,11),T.runNeighborhood(T.neighborhood(11),.4,11));
for(const prefer of [false,true]){const g=T.growNetwork(17,prefer);assert.equal(g.degree.length,27);assert.equal(g.edges.length,51);assert.equal(g.degree.reduce((a,b)=>a+b,0),102);assert(T.largest(27,g.edges,[0,1,2,3,4])<=22);}
assert.equal(T.musicMarket(23,true).reduce((a,b)=>a+b),160);
assert.deepStrictEqual(T.musicMarket(23,true),T.musicMarket(23,true));
for(const kind of ['clustered','shortcut'])for(const threshold of [1,2]){const d=T.diffuse(T.diffusionEdges(kind),[0,1],threshold);assert.equal(d.hist.length,9);assert(d.hist.every((n,i)=>!i||n>=d.hist[i-1]));}
assert.equal(T.mae(T.driftData.trace.slice(0,4),T.driftData.truth.slice(0,4)),1);
assert.equal(T.mae(T.driftData.trace.slice(4),T.driftData.truth.slice(4)),14);
assert.equal(T.mae(T.driftData.baseline.slice(4),T.driftData.truth.slice(4)),2);
assert.equal(T.variance([0,2,4,6]),5); assert.equal(T.variance([3,3,3,3]),0);
for(const side of ['student','seminar'])assert.equal(T.blockingPairs(T.deferred(side).match).length,0);
assert.notDeepStrictEqual(T.deferred('student').match,T.deferred('seminar').match);
assert(T.blockingPairs([1,2,0]).length>0);
for(const unit of ['individual','cluster'])for(const spill of [false,true])for(const site of ['A','B']){const x=T.fieldStudy(unit,spill,site);assert.equal(x.assignment.filter(Boolean).length,16);assert(x.outcomes.every(v=>v===0||v===1));assert(x.treat>=0&&x.treat<=1);assert.deepStrictEqual(x,T.fieldStudy(unit,spill,site));}
for(const rule of ['restricted','shared'])for(const p of [2,1.1]){const h=T.institutionWorld(rule,p);assert.equal(h.length,5);let capital=20;for(const r of h){const next=capital-r.investment.reduce((a,b)=>a+b)+r.output;assert(Math.abs(next-r.capital.reduce((a,b)=>a+b))<1e-8);capital=next;}}
// Independently enumerate the Pearl toy model, rather than copy its result.
const rows=[];for(const a of [0,1])for(const i of [0,1]){const pi=a?.8:.2,weight=.5*(i?pi:1-pi);rows.push({a,i,weight,y:.1+.5*a+.2*i});}
const group=i=>rows.filter(r=>r.i===i).reduce((s,r)=>s+r.weight*r.y,0)/rows.filter(r=>r.i===i).reduce((s,r)=>s+r.weight,0);
assert(Math.abs(group(1)-.7)<1e-9);assert(Math.abs(group(0)-.2)<1e-9);
console.log('Numerical checks: deterministic simulations, graph invariants, matching stability, forecast MAE, variance, experiment assignment, capital accounting, and causal enumeration passed.');

// Small DOM adapter tests authored interaction paths without a browser dependency.
class El{
 constructor(tag='div',attr='',body=''){this.tag=tag;this.attrs=attr;this.nodes=[];this.listeners={};this.textContent='';this.checked=/\bchecked\b/.test(attr);this.disabled=/\bdisabled\b/.test(attr);this.id=(attr.match(/\bid="([^"]*)"/)||[])[1];this.classes=(attr.match(/\bclass="([^"]*)"/)||[])[1]||'';this.value=(attr.match(/\bvalue="([^"]*)"/)||[])[1]||'';if(tag==='select'){const opts=[...body.matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/g)];const chosen=opts.find(o=>/\bselected\b/.test(o[1]))||opts[0];this.value=chosen?(chosen[1].match(/\bvalue="([^"]*)"/)||[])[1]||'':'';}}
 set innerHTML(html){this.html=html;this.nodes=[];const re=/<([a-z][a-z0-9-]*)\b([^>]*)>/gi;let m;while(m=re.exec(html)){const body=html.slice(re.lastIndex).split('</'+m[1]+'>')[0];this.nodes.push(new El(m[1],m[2],body));}}
 get innerHTML(){return this.html||'';}
 querySelector(sel){for(const n of this.nodes){if(sel[0]==='#'?n.id===sel.slice(1):sel[0]==='.'?n.classes.split(' ').includes(sel.slice(1)):n.tag===sel)return n;const nested=n.querySelector(sel);if(nested)return nested;}return null;}
 addEventListener(e,fn){this.listeners[e]=fn;}
 focus(){}
 appendChild(el){this.nodes.push(el);}
}
const head=new El();global.document={head,createElement:t=>new El(t),getElementById:id=>head.querySelector('#'+id)};
function lab(id){const c=new El(),state={};let complete=false;window.Research.mount(c,{id},{state,save(){},complete(){complete=true;}});const get=id=>{const e=c.querySelector('#'+id);assert(e,'Missing '+id);return e;};const click=id=>{const e=get(id);assert(!e.disabled,'Disabled '+id);assert(e.listeners.click,'No listener '+id);e.listeners.click({target:e});};const set=(id,val)=>{const e=get(id);e.value=String(val);if(e.listeners.change)e.listeners.change({target:e});};set('lab-prediction','uncertain');return {c,state,click,set,get,finish(){get('lab-limit').checked=true;get('lab-limit').listeners.change({target:get('lab-limit')});set('lab-transfer','evidence');click('lab-submit');assert(complete,'Encounter '+id+' failed: '+c.querySelector('.lab-feedback').textContent);console.log('Encounter '+id+' interaction path completed.');}};}
{
 const x=lab(1);[0,1,3].forEach(i=>x.click('street-'+i));x.click('compare');x.finish();
}
{
 const x=lab(2);const grid=x.state.lab.grid;x.click('cell-'+grid.findIndex(v=>v!=='.'));x.click('cell-'+grid.findIndex(v=>v==='.'));x.click('run-board');x.set('threshold',.6);x.click('run-board');x.finish();
}
{
 const x=lab(3);[0,1,2,3].forEach(i=>x.click('contact-'+i));x.click('send');x.click('reset');[0,1,4,5].forEach(i=>x.click('contact-'+i));x.click('send');x.finish();
}
{
 const x=lab(4);x.click('season');x.set('rule','cap');x.get('maintenance').checked=true;x.get('monitor').checked=true;x.click('season');x.set('rain','dry');x.click('season');x.finish();
}
{
 const x=lab(5);[0,1,2].forEach(i=>x.click('arrow-'+i));x.click('query');x.set('mode','intervene');x.click('query');x.set('adjust','access');x.finish();
}
{
 const x=lab(6);x.click('attack');x.set('failure','hubs');x.click('attack');x.finish();
}
{
 const x=lab(7);x.click('market');x.set('influence','visible');x.click('market');x.set('world',51);x.click('market');x.finish();
}
{
 const x=lab(8);for(const kind of ['clustered','shortcut'])for(const threshold of [1,2]){x.set('network',kind);x.set('exposures',threshold);x.click('diffuse');}x.finish();
}
{
 const x=lab(9);x.click('before');x.click('after');['criticism','criticism','action','action','both','neither'].forEach((v,i)=>x.set('post-'+i,v));x.click('rates');x.click('survivors');x.finish();
}
{
 const x=lab(10);x.click('open-before');x.click('open-after');x.click('audit');x.set('forecast','baseline');x.click('audit');x.finish();
}
{
 const x=lab(11);for(let i=0;i<4;i++){x.click('image-'+i);x.click('inspect');}x.set('correct','bench');x.click('fix');x.click('evening');x.finish();
}
{
 const x=lab(12);[0,1,2].forEach(i=>x.click('dev-'+i));x.set('codebook','v2');x.click('freeze');x.click('heldout');x.click('synthetic');x.set('next-validation','fresh');x.finish();assert.equal(x.state.lab.score,3);
}
{
 const x=lab(13);x.click('snapshot');x.set('mechanism','repel');x.click('snapshot');for(const f of ['open','own','bridge']){x.set('feed',f);x.click('feed-run');}x.set('observation','absolute');x.finish();
}
{
 const x=lab(14);x.click('search');x.set('search-rule','exhaustive');x.click('search');x.set('budget',4);x.click('search');x.finish();
}
{
 const x=lab(15);x.click('gain');x.click('safe');x.click('loss');x.click('risky');x.click('population');x.set('context','transparent');x.click('population');x.set('choice-model','rational');x.click('population');x.finish();
}
{
 const x=lab(16);x.click('blocking');x.click('deferred');x.set('proposers','seminar');x.click('deferred');x.finish();
}
{
 const x=lab(17);x.set('study-outcome','attendance');x.click('randomize');x.set('unit','cluster');x.set('spill','on');x.click('randomize');x.set('study-site','B');x.click('randomize');x.finish();
}
{
 const x=lab(18);x.click('society');x.set('institution','shared');x.click('society');x.set('productivity',1.1);x.click('society');x.set('history-card','discriminate');x.click('historical');x.finish();
}
console.log('All 18 authored research interactions pass completion checks.');

