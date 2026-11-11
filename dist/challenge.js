/* Deterministic challenge progress. Time advances only when the caller samples
   an active attempt. No timers, DOM, network or research-scoring decisions. */
(function () {
 'use strict';
 const VERSION=1,MAX_ERRORS=5,MAX_ELAPSED=7*24*60*60*1000,MAX_ATTEMPT=9999;
 const states=new Set(['ready','active','paused','passed','failed']);
 const tiers={QuickInsight:{label:'Quick Insight',points:100},SteadyInsight:{label:'Steady Insight',points:50},ResearchSeal:{label:'Research Seal',points:25}};
 const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
 const bounded=(value,low,high,fallback)=>Number.isFinite(Number(value))?Math.min(high,Math.max(low,Math.floor(Number(value)))):fallback;
 const elapsed=value=>bounded(value,0,MAX_ELAPSED,0);
 const errors=value=>bounded(value,0,MAX_ERRORS,0);
 const attempt=value=>bounded(value,1,MAX_ATTEMPT,1);
 function tierFor(ms){return ms<=120000?'QuickInsight':ms<=300000?'SteadyInsight':'ResearchSeal';}
 function awardFor(ms,mistakes,number){const value=elapsed(ms),id=tierFor(value);return Object.freeze({id,label:tiers[id].label,points:tiers[id].points,elapsedMs:value,errors:Math.min(4,errors(mistakes)),attempt:attempt(number)});}
 function readAward(value){if(!object(value)||!Object.prototype.hasOwnProperty.call(tiers,value.id))return null;return awardFor(value.elapsedMs,value.errors,value.attempt);}
 function readBest(value){return object(value)?Object.freeze({elapsedMs:elapsed(value.elapsedMs),errors:Math.min(4,errors(value.errors)),attempt:attempt(value.attempt)}):null;}
 function normalize(target){
  let status=states.has(target.status)?target.status:'ready',mistakes=errors(target.errors),ms=elapsed(target.elapsedMs),number=attempt(target.attempt);
  const award=readAward(target.award);let best=readBest(target.best);
  // A stored active interval never includes time spent outside this controller.
  if(status==='active')status='paused';
  if(status==='failed'||mistakes===MAX_ERRORS){status='failed';mistakes=MAX_ERRORS;}
  else if(status==='ready'&&(mistakes>0||ms>0))status='paused';
  let firstAward=award;
  if(status==='passed'){
   firstAward=firstAward||awardFor(ms,mistakes,number);
   const cleared={elapsedMs:ms,errors:mistakes,attempt:number};
   if(!best||ms<best.elapsedMs||(ms===best.elapsedMs&&mistakes<best.errors))best=Object.freeze(cleared);
  }
  const clean={version:VERSION,attempt:number,status,errors:mistakes,elapsedMs:ms,award:firstAward,best};
  for(const key of Object.keys(target))if(!Object.prototype.hasOwnProperty.call(clean,key))delete target[key];
  Object.assign(target,clean);return target;
 }
 function create(record,options={}){
  const state=normalize(object(record)?record:{});
  const now=typeof options.now==='function'?options.now:()=>typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
  const onChange=typeof options.onChange==='function'?options.onChange:()=>{};
  let activeAt=null,destroyed=false;
  function stamp(){const value=Number(now());return Number.isFinite(value)?value:activeAt===null?0:activeAt;}
  function accrue(){
   if(destroyed||state.status!=='active'||activeAt===null)return;
   const time=stamp();
   if(time>=activeAt){state.elapsedMs=Math.min(MAX_ELAPSED,state.elapsedMs+Math.max(0,Math.floor(time-activeAt)));activeAt=time;}
  }
  function view(extra={}){
   return {version:VERSION,attempt:state.attempt,status:state.status,errors:state.errors,elapsedMs:state.elapsedMs,
    remainingErrors:Math.max(0,MAX_ERRORS-state.errors),hintUnlocked:state.errors>=2,running:!destroyed&&state.status==='active',
    award:state.award?Object.freeze({...state.award}):null,best:state.best?Object.freeze({...state.best}):null,points:state.award?.points||0,
    autoHint:false,awardGranted:false,...extra};
  }
  function changed(type,extra={}){const result=view(extra);onChange(result,Object.freeze({type,autoHint:!!extra.autoHint,awardGranted:!!extra.awardGranted,failed:state.status==='failed'}));return result;}
  const terminal=()=>state.status==='passed'||state.status==='failed';
  function begin(){state.status='active';activeAt=stamp();}
  const api={
   start(){if(destroyed||terminal())return view();if(state.status==='active'){accrue();return view();}begin();return changed('start');},
   pause(){if(destroyed||state.status!=='active')return view();accrue();activeAt=null;state.status='paused';return changed('pause');},
   resume(){if(destroyed||state.status!=='paused')return view();begin();return changed('resume');},
   wrong(){
    if(destroyed||terminal())return view();
    if(state.status==='ready')begin();accrue();state.errors=Math.min(MAX_ERRORS,state.errors+1);
    if(state.errors===MAX_ERRORS){state.status='failed';activeAt=null;}
    return changed('wrong',{autoHint:state.errors===2});
   },
   correct(){
    if(destroyed||terminal())return view();
    if(state.status==='ready')begin();accrue();activeAt=null;state.status='passed';
    const cleared=Object.freeze({elapsedMs:state.elapsedMs,errors:state.errors,attempt:state.attempt});
    if(!state.best||cleared.elapsedMs<state.best.elapsedMs||(cleared.elapsedMs===state.best.elapsedMs&&cleared.errors<state.best.errors))state.best=cleared;
    const granted=!state.award;if(granted)state.award=awardFor(state.elapsedMs,state.errors,state.attempt);
    return changed('correct',{awardGranted:granted});
   },
   reset(){
    if(destroyed||state.status!=='failed')return view();
    activeAt=null;state.attempt=Math.min(MAX_ATTEMPT,state.attempt+1);state.status='ready';state.errors=0;state.elapsedMs=0;
    return changed('reset');
   },
   snapshot(){accrue();return view();},
   destroy(){
    if(destroyed)return view();
    if(state.status==='active'){accrue();activeAt=null;state.status='paused';destroyed=true;return changed('destroy');}
    destroyed=true;activeAt=null;return view();
   }
  };
  return api;
 }
 function total(records){
  const list=Array.isArray(records)?records:object(records)?Object.values(records):[];let sum=0;const seen=new Set();
  for(const record of list){if(!object(record)||seen.has(record))continue;seen.add(record);const award=readAward(record.award);if(award)sum+=award.points;}
  return sum;
 }
 function awardDescription(value){const award=readAward(object(value)&&value.award?value.award:value);if(!award)return'No research seal earned yet.';return award.label+' · '+award.points+' points';}
 const exported={version:VERSION,create,total,awardDescription};
 const host=typeof window!=='undefined'?window:globalThis;host.AtlasChallenge=exported;
 if(typeof module!=='undefined'&&module.exports)module.exports=exported;
})();
