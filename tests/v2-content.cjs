const path=require('path');global.window=global;global.performance={now:()=>0};global.document={createElement:()=>({getContext:()=>new Proxy({}, {get:()=>()=>({addColorStop(){}})}),width:0,height:0}),getElementById:()=>null};
const d=path.resolve(__dirname, '..', 'dist');
for(const f of ['legacy/data.js','legacy/landmarks.js','legacy/challenge.js','js/core.js','js/voice.js','js/props.js','js/worldgen.js','js/campuses.js','js/encounters.js'])require(path.join(d,f));
const SA=window.SA;SA.save=SA.blankSave();SA.UI={toast(){},modal(){}};SA.Audio={sfx(){},ctx:null};
global.AudioContext=undefined;
for(const f of ['js/music.js','js/mentors.js','js/progress.js','js/tasks.js','js/labs2.js','js/pack2.js'])require(path.join(d,f));
let bad=0;
for(const k of Object.keys(SA.Campuses)){const def=SA.Campuses[k];const ids=Object.keys(SA.VISITS).filter(i=>SA.VISITS[i].uni===k);
 for(const id of ids){const enc=SA.Encounters.get(+id)||{year:2026,office:'Fellowship House'};const v=SA.VISITS[id];const w=SA.World.generate(def,{year:enc.year,office:enc.office,season:v.season||def.season||'autumn',variant:v.variant||0});
  const B=w.buildings;for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){const a=B[i],b=B[j];if(a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h){console.log('OVERLAP',k,a.name,b.name);bad++;}}
  const seen=w.reach(w.spawn.x,w.spawn.y);for(const [n,p] of Object.entries(w.pois)){if(n==='blackSquirrels'||n==='tram'||n==='piper')continue;if(!seen[p.y*w.N+p.x]){console.log('UNREACHABLE',k,id,n,p.x,p.y);bad++;}}
  for(const n of ['directory','office','archive','library','landmark'])if(!w.pois[n]){console.log('MISSING',k,n);bad++;}
  if(w.sketches.length<5){console.log('SKETCHES',k,w.sketches.length);bad++;}
  const eggs=SA.Progress.EGGS[k]||[];if(eggs.length!==2){console.log('EGGS',k,eggs.length);bad++;}
  for(const e of eggs){if(e.thing&&!w.interact.some(t=>t.kind===e.thing)&&!e.spot){console.log('EGG THING MISSING',k,e.thing);bad++;} if(e.prop&&!w.props.some(p=>p.k===e.prop)){console.log('EGG PROP MISSING',k,e.prop);bad++;}
   if(e.spot==='bridge'&&!Array.from(w.terrain).some((t,i)=>t===15&&seen[i])){console.log('EGG BRIDGE UNREACHABLE',k);bad++;}}
  if(+id&&!SA.Tasks.forEncounter(+id)){console.log('NO TASK',id);bad++;}
  if(+id>18&&!SA.Labs2.labs[+id]){console.log('NO LAB',id);bad++;}
 }
 const sc=SA.Music.scores[k];if(!sc){console.log('NO MUSIC',k);bad++;}else for(const ph of ['A','A2','B','B2']){const n=SA.Music.phraseLength(sc[ph]);if(n!==sc.bar*4){console.log('PHRASE',k,ph,n,'!=',sc.bar*4);bad++;}}
}
console.log('encounters',SA.Encounters.count,'campuses',Object.keys(SA.Campuses).length,'problems',bad);
// save migration: a first-edition journey becomes a V2 save and is never written back
const v1={version:1,started:true,current:3,completed:[1,2],found:[1,2],clues:[1],evidence:[{id:1,text:'x'}],puzzles:{},challenges:{},settings:{muted:true}};
const m=SA.migrateV1(v1);if(!(m.version===2&&m.completed.length===2&&m.importedV1&&m.settings.muted===true&&v1.version===1)){console.log('MIGRATION FAILED');bad++;}
if(SA.Encounters.all.some((e,i)=>e.id!==i+1)){console.log('ENCOUNTER IDS NOT CONTIGUOUS');bad++;}
for(const e of SA.Encounters.all){if(!SA.Encounters.sourcesFor(e).length){console.log('NO SOURCE',e.id);bad++;}if(!SA.VISITS[e.id]){console.log('NO VISIT',e.id);bad++;}}
process.exit(bad?1:0);
