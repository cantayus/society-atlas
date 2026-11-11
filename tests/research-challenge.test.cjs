/* Attempt grading tests use the actual research UI through a small DOM adapter.
 * Numerical/experiment checks remain in tools/check-research.cjs. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.resolve(__dirname,'../dist/research.js'),'utf8');
function harness(id=1,opts={}){
 class El{constructor(tag='div',attr='',body=''){this.tag=tag;this.nodes=[];this.listeners={};this.textContent='';this.checked=/\bchecked\b/.test(attr);this.disabled=/\bdisabled\b/.test(attr);this.id=(attr.match(/\bid="([^"]*)"/)||[])[1];this.classes=(attr.match(/\bclass="([^"]*)"/)||[])[1]||'';this.value=(attr.match(/\bvalue="([^"]*)"/)||[])[1]||'';if(tag==='select'){const a=[...body.matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/g)],chosen=a.find(o=>/\bselected\b/.test(o[1]))||a[0];this.value=chosen?(chosen[1].match(/\bvalue="([^"]*)"/)||[])[1]||'':'';}}
  set innerHTML(html){this.html=html;this.nodes=[];const re=/<([a-z][a-z0-9-]*)\b([^>]*)>/gi;let m;while(m=re.exec(html))this.nodes.push(new El(m[1],m[2],html.slice(re.lastIndex).split('</'+m[1]+'>')[0]));}
  get innerHTML(){return this.html||'';}
  querySelectorAll(s){const out=[];for(const n of this.nodes){if(s.split(',').some(x=>x[0]==='#'?n.id===x.slice(1):x[0]==='.'?n.classes.split(' ').includes(x.slice(1)):n.tag===x))out.push(n);out.push(...n.querySelectorAll(s));}return out;}
  querySelector(s){return this.querySelectorAll(s)[0]||null;}addEventListener(e,fn){this.listeners[e]=fn;}focus(){}appendChild(el){this.nodes.push(el);}}
 const head=new El(),box={window:{},document:{head,createElement:t=>new El(t),getElementById:id=>head.querySelector('#'+id)}};vm.createContext(box);vm.runInContext(source,box);const state=opts.state||{},container=new El(),events=[],submits=[];let interactions=0,completed=0,over=0,errors=opts.errors||0,remoteFailed=!!opts.failed;
 const api={state,save(){},interact(){interactions++;events.push('interact');},complete(){completed++;events.push('complete');},gameOver(){over++;events.push('gameover');},...(opts.external===false?{}:{isFailed:()=>remoteFailed,submit(attempt){submits.push({...attempt});events.push(attempt.correct?'correct':'wrong');if(!attempt.correct)errors++;remoteFailed=errors>=5;return{errors,failed:remoteFailed,reward:attempt.correct?25:0};}})};
 const mount=()=>box.window.Research.mount(container,{id},api);mount();const get=id=>{const el=container.querySelector('#'+id);assert.ok(el,'control '+id);return el;};return{state,container,events,submits,get,mount,click(id){const e=get(id);e.listeners.click?.({target:e});},set(id,value){const e=get(id);e.value=String(value);e.listeners.change?.({target:e});},check(value=true){const e=get('lab-limit');e.checked=value;e.listeners.change({target:e});},get interactions(){return interactions;},get completed(){return completed;},get gameOvers(){return over;},get errors(){return errors;}};
}
function comparison(h){h.set('lab-prediction','same');for(const id of[0,1,3])h.click('street-'+id);h.click('compare');}

test('only meaningful interaction starts timing; incomplete answers and predictions are ungraded',()=>{
 const h=harness();assert.equal(h.interactions,0);h.click('lab-hint');h.click('lab-submit');assert.equal(h.interactions,0);assert.equal(h.submits.length,0);h.set('lab-prediction','different');h.click('lab-submit');assert.equal(h.submits.length,0);assert.equal(h.interactions,1);comparison(h);h.set('lab-transfer','universal');h.click('lab-submit');assert.equal(h.submits.length,0,'unacknowledged limitation is validation, not a wrong answer');h.check();h.set('lab-transfer','');h.click('lab-submit');assert.equal(h.submits.length,0,'blank transfer uses no attempt');assert.equal(h.interactions,1,'later inputs do not restart the timer');
});

test('two wrong transfers produce contextual automatic help; five end the challenge and block completion',()=>{
 const h=harness();comparison(h);h.check();h.set('lab-transfer','universal');h.click('lab-submit');assert.equal(h.errors,1);assert.doesNotMatch(h.get('lab-hint-text').textContent,/Automatic/);h.click('lab-submit');assert.equal(h.errors,2);assert.match(h.get('lab-hint-text').textContent,/Automatic hint \(2\/5\)/);assert.match(h.get('lab-hint-text').textContent,/Bellwether/);assert.match(h.get('lab-hint-text').textContent,/missing Bellwether street/);h.click('lab-submit');assert.match(h.get('lab-hint-text').textContent,/Automatic help \(3\/5\)/);h.click('lab-submit');h.click('lab-submit');assert.equal(h.errors,5);assert.equal(h.gameOvers,1);assert.equal(h.get('lab-submit').disabled,true);h.set('lab-transfer','evidence');h.click('lab-submit');h.click('lab-submit');assert.equal(h.submits.length,5);assert.equal(h.completed,0);assert.equal(h.gameOvers,1);
});

test('correct evaluation precedes completion and a completed replay cannot issue another reward',()=>{
 const h=harness();comparison(h);h.check();h.set('lab-transfer','evidence');h.click('lab-submit');assert.equal(h.completed,1);assert.equal(h.submits.length,1);assert.equal(h.submits[0].correct,true);assert.equal(h.submits[0].reason,'bounded-transfer');assert.ok(h.events.indexOf('correct')<h.events.indexOf('complete'));assert.equal(h.state.completed,true);h.click('lab-submit');assert.equal(h.completed,1);assert.equal(h.submits.length,1);h.mount();h.set('lab-prediction','uncertain');h.click('lab-submit');assert.equal(h.completed,1);assert.equal(h.submits.length,1);assert.equal(h.interactions,1,'replaying does not start another reward clock');
});

test('failure state is respected on mount and fallback grading also locks after five mistakes',()=>{
 const failed=harness(1,{failed:true});failed.set('lab-prediction','different');failed.click('street-0');failed.click('lab-submit');assert.equal(failed.interactions,0);assert.equal(failed.submits.length,0);assert.equal(failed.state.lab.visited.length,0);assert.equal(failed.completed,0);const local=harness(1,{external:false});comparison(local);local.check();local.set('lab-transfer','ignore');for(let i=0;i<7;i++)local.click('lab-submit');assert.equal(local.state.researchAttempts.errors,5);assert.equal(local.state.researchAttempts.failed,true);assert.equal(local.gameOvers,1);assert.equal(local.completed,0);
});

test('King codebook validation grades only complete nonblank answers, not missing evidence',()=>{
 const h=harness(9);h.set('lab-prediction','same');h.click('before');h.click('after');h.click('rates');assert.equal(h.submits.length,0);for(let i=0;i<6;i++)h.set('post-'+i,'neither');h.click('rates');assert.equal(h.submits.length,1);assert.equal(h.submits[0].reason,'post-codebook');['criticism','criticism','action','action','both','neither'].forEach((v,i)=>h.set('post-'+i,v));h.click('rates');assert.equal(h.state.lab.audited,true);assert.equal(h.submits.length,1,'correct intermediate work is not a final reward');
});

test('CV correction requires observation and a label before a wrong answer can consume an attempt',()=>{
 const h=harness(11);h.set('lab-prediction','uncertain');h.set('correct','vehicle');h.click('fix');assert.equal(h.submits.length,0);h.click('image-2');h.click('inspect');h.set('correct','');h.click('fix');assert.equal(h.submits.length,0);h.set('correct','vehicle');h.click('fix');assert.equal(h.submits.length,1);assert.equal(h.submits[0].reason,'detector-label');h.set('correct','bench');h.click('fix');assert.equal(h.state.lab.corrected,true);assert.equal(h.submits.length,1);
});
