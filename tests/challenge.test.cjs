const test=require('node:test');
const assert=require('node:assert/strict');
const Challenge=require('../dist/challenge.js');

function rig(record={}){let time=1000;const events=[];const controller=Challenge.create(record,{now:()=>time,onChange:(snapshot,event)=>events.push({snapshot,event})});return{record,events,controller,advance(ms){time+=ms;},setTime(ms){time=ms;}};}

test('first-clear reward thresholds use active milliseconds, including exact boundaries',()=>{
 for(const [ms,id,points]of[[0,'QuickInsight',100],[120000,'QuickInsight',100],[120001,'SteadyInsight',50],[300000,'SteadyInsight',50],[300001,'ResearchSeal',25]]){
  const h=rig();h.controller.start();h.advance(ms);const out=h.controller.correct();assert.equal(out.status,'passed');assert.equal(out.award.id,id);assert.equal(out.points,points);assert.equal(out.elapsedMs,ms);assert.equal(out.awardGranted,true);assert.equal(h.record.version,1);assert(Object.isFrozen(h.record.award));
 }
});

test('practice time excludes paused, closed, hidden and restored intervals',()=>{
 const h=rig();h.controller.resume();assert.equal(h.controller.snapshot().status,'ready','opening a research modal does not start an untouched attempt');h.advance(500000);h.controller.start();h.advance(60000);h.controller.pause();h.advance(500000);assert.equal(h.controller.snapshot().elapsedMs,60000);h.controller.resume();h.advance(60000);const saved=JSON.parse(JSON.stringify(h.controller.snapshot()));
 const restored=rig(saved);assert.equal(restored.controller.snapshot().status,'paused','stored active state restores as paused');restored.advance(999999);assert.equal(restored.controller.snapshot().elapsedMs,120000);restored.controller.resume();assert.equal(restored.controller.correct().award.id,'QuickInsight');
});

test('second error requests one automatic hint; the fifth error locks the attempt',()=>{
 const h=rig();assert.equal(h.controller.wrong().errors,1);const second=h.controller.wrong();assert.equal(second.errors,2);assert.equal(second.autoHint,true);assert.equal(second.hintUnlocked,true);assert.equal(h.events.at(-1).event.autoHint,true);
 for(let i=3;i<=5;i++){const out=h.controller.wrong();assert.equal(out.errors,i);assert.equal(out.autoHint,false);assert.equal(out.status,i===5?'failed':'active');}
 assert.equal(h.controller.snapshot().remainingErrors,0);const before=JSON.stringify(h.record),count=h.events.length;h.advance(900000);assert.equal(h.controller.correct().award,null);h.controller.wrong();h.controller.start();h.controller.resume();assert.equal(JSON.stringify(h.record),before);assert.equal(h.events.length,count);
});

test('failed retries reset the attempt but preserve an existing award and best result',()=>{
 const record={version:1,attempt:2,status:'failed',errors:5,elapsedMs:450000,award:{id:'QuickInsight',points:100,elapsedMs:100000,errors:1,attempt:1},best:{elapsedMs:100000,errors:1,attempt:1}};
 const h=rig(record),award=JSON.stringify(record.award);const ready=h.controller.reset();assert.equal(ready.status,'ready');assert.equal(ready.attempt,3);assert.equal(ready.errors,0);assert.equal(ready.elapsedMs,0);assert.equal(ready.hintUnlocked,false);assert.equal(JSON.stringify(record.award),award);assert.equal(record.best.elapsedMs,100000);
 h.controller.start();h.advance(200000);const cleared=h.controller.correct();assert.equal(cleared.status,'passed');assert.equal(cleared.awardGranted,false);assert.equal(cleared.points,100);assert.equal(JSON.stringify(record.award),award);assert.equal(record.best.elapsedMs,100000);assert.equal(Challenge.total({first:record}),100);
});

test('passing is idempotent and passed replays cannot farm points or improve the first award',()=>{
 const h=rig();h.controller.start();h.advance(150000);h.controller.correct();const ledger=JSON.stringify(h.record),count=h.events.length;for(let i=0;i<4;i++){h.controller.reset();h.controller.start();h.controller.correct();h.controller.wrong();h.controller.pause();h.controller.resume();h.advance(1000);}assert.equal(JSON.stringify(h.record),ledger);assert.equal(h.events.length,count);assert.equal(Challenge.total([h.record,h.record]),50);assert.equal(Challenge.awardDescription(h.controller.snapshot()),'Steady Insight · 50 points');
});

test('correct without an explicit start is valid at zero time; paused correct does not count hidden time',()=>{
 const h=rig();assert.equal(h.controller.correct().elapsedMs,0);assert.equal(h.record.award.id,'QuickInsight');const p=rig();p.controller.start();p.advance(300001);p.controller.pause();p.advance(900000);const out=p.controller.correct();assert.equal(out.elapsedMs,300001);assert.equal(out.award.id,'ResearchSeal');
});

test('normalization bounds imports, ignores arbitrary awarded point values and strips unknown clocks',()=>{
 const record={version:99,attempt:Infinity,status:'active',errors:-20,elapsedMs:Infinity,startedAt:123456,extra:'unused',award:{id:'QuickInsight',points:999999,elapsedMs:300001,errors:40,attempt:-3},best:{elapsedMs:-1,errors:-1,attempt:0}};
 const h=rig(record);assert.equal(record.version,1);assert.equal(record.attempt,1);assert.equal(record.errors,0);assert.equal(record.elapsedMs,0);assert.equal(record.status,'paused');assert.equal(record.startedAt,undefined);assert.equal(record.extra,undefined);assert.equal(record.award.id,'ResearchSeal');assert.equal(record.award.points,25);assert.equal(record.award.errors,4);assert.equal(record.award.attempt,1);assert.equal(record.best.elapsedMs,0);assert.equal(Challenge.total({a:record,b:{award:{id:'missing',points:100000}}}),25);
 const malformed=rig({status:'passed',errors:9,elapsedMs:100});assert.equal(malformed.record.status,'failed');assert.equal(malformed.record.errors,5);assert.equal(malformed.record.award,null);assert.equal(h.controller.snapshot().running,false);
});

test('destroy checkpoints active time, pauses persistence and cannot leak work or mutate again',()=>{
 const h=rig();h.controller.start();h.advance(8000);const out=h.controller.destroy();assert.equal(out.status,'paused');assert.equal(out.elapsedMs,8000);assert.equal(out.running,false);assert.equal(h.events.at(-1).event.type,'destroy');const before=JSON.stringify(h.record),count=h.events.length;h.advance(50000);h.controller.destroy();h.controller.start();h.controller.resume();h.controller.wrong();h.controller.correct();h.controller.reset();h.controller.snapshot();assert.equal(JSON.stringify(h.record),before);assert.equal(h.events.length,count);
});

test('clock rollback never removes active time or counts the same interval twice',()=>{
 const h=rig();h.controller.start();h.advance(5000);assert.equal(h.controller.snapshot().elapsedMs,5000);h.setTime(2000);assert.equal(h.controller.snapshot().elapsedMs,5000);h.setTime(7000);assert.equal(h.controller.pause().elapsedMs,6000);
});
