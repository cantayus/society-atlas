/* Designed autumn weather, not a live forecast or a historical observation.
 * Regional references are NOAA/NWS climate resources; every on-screen condition
 * is an authored scenic choice. Runtime is offline, deterministic Canvas code.
 * ground() is called in world coordinates before buildings; screen() is called
 * after restoring the world transform, with CSS-pixel width and height.
 */
(()=>{'use strict';
const TAU=Math.PI*2,SEASON='Designed autumn ambience';
const sources={
 boston:{title:'NWS CWSU Nashua Weather Impact Playbook — Boston climatology',url:'https://www.weather.gov/media/aviation/wips/ZBW-WIP-1109.pdf',scope:'The Boston climate discussion describes maritime moderation and changing fair, cloudy, and wet weather. The game selects gentle examples; it does not simulate observed dates.'},
 philadelphia:{title:'NWS Philadelphia/Mount Holly — Philadelphia climate normals',url:'https://www.weather.gov/phi/clinormalsKPHL',scope:'Local seasonal normals anchor a cooling autumn setting; breeze and leaf motion are artistic choices.'},
 princeton:{title:'NWS Philadelphia/Mount Holly — Trenton climate normals',url:'https://www.weather.gov/phi/clinormalsKTTN',scope:'Trenton is a nearby regional reference for Princeton, not a campus weather station. The game uses crisp autumn light rather than claiming a measured campus condition.'},
 indiana:{title:'NWS Indianapolis — 1991–2020 climate normals, including Bloomington',url:'https://www.weather.gov/ind/newnormals2021',scope:'Central Indiana seasonal temperature and precipitation context; the chosen soft shower is fictional.'},
 indianaFreeze:{title:'NWS Indianapolis — frost and freeze dates for central Indiana',url:'https://www.weather.gov/ind/frostfreezedate',scope:'Includes Bloomington and the region’s autumn cooling. No specific game day or historical temperature is inferred.'},
 losAngeles:{title:'NOAA/NWS Technical Memorandum WR-261 — overview of Los Angeles climate',url:'https://www.weather.gov/media/wrh/online_publications/TMs/TM-261.pdf',scope:'The overview discusses a dry-summer/rainy-winter regime, marine-layer influence and light sea breezes. The game chooses a mild dry interval and faint coastal haze, with no snow.'},
 bayArea:{title:'NWS San Francisco Bay Area — Ask the Expert',url:'https://www.weather.gov/mtr/ask_expert',scope:'Explains coastal marine fog and seasonal storm-track changes. Palo Alto is not equated with foggier coastal San Francisco; only a light marine haze is used.'},
 southBend:{title:'NWS Northern Indiana — South Bend climate',url:'https://www.weather.gov/iwx/climatology_southbend_climate',scope:'Discusses Lake Michigan influence, cool-season cloudiness, and a snow season beginning in late autumn. The game occasionally uses a few gentle flakes without accumulation.'},
 newYork:{title:'NWS New York — Central Park climate normals and extremes',url:'https://www.weather.gov/media/okx/Climate/CentralPark/nycnormals.pdf',scope:'1991–2020 seasonal and monthly climate context. Central Park is a regional reference; the Columbia scene’s drizzle is an authored choice.'},
 centralPA:{title:'NWS State College — local climate resources',url:'https://www.weather.gov/ctp/moreclimate',scope:'Provides State College climate references and central Pennsylvania autumn freeze context.'},
 centralPASnow:{title:'NWS State College — snowfall and seasonal water resources',url:'https://www.weather.gov/ctp/moreWater?tabName=Snowfall',scope:'Documents central Pennsylvania snowfall climatology and first accumulating snow context. Sparse scenic flurries are not a claim about the date of a visit.'},
 stLouis:{title:'NWS St. Louis — Regional Climate Summary',url:'https://www.weather.gov/lsx/regionalclimatesummary',scope:'Describes increased autumn variability and dry intervals between weather systems. The game uses passing cloud and brighter intervals, not severe weather.'},
 pittsburgh:{title:'NWS Pittsburgh — November climatic data, 1991–2020 normals',url:'https://www.weather.gov/media/pbz/normals/November%20data.pdf',scope:'Anchors a cool late-autumn setting. Soft overcast and light drizzle are authored scenic examples, not a reconstruction of 1978.'}
};
const families={
 penn:{region:'Philadelphia, Pennsylvania',campus:'University of Pennsylvania',weather:'Brisk air and a light leaf breeze',modes:['breeze','clouds'],warmth:.025,cloud:.021,wind:.62,sourceIds:['philadelphia']},
 harvard:{region:'Cambridge / Boston, Massachusetts',campus:'Harvard University',weather:'Passing clouds and an occasional light drizzle',modes:['clouds','drizzle','breeze'],warmth:.006,cloud:.025,wind:.48,sourceIds:['boston']},
 indiana:{region:'Bloomington, Indiana',campus:'Indiana University',weather:'Gentle overcast with passing light showers',modes:['drizzle','clouds'],warmth:.008,cloud:.028,wind:.36,sourceIds:['indiana','indianaFreeze']},
 ucla:{region:'Los Angeles, California',campus:'UCLA',weather:'Soft autumn sunshine and faint coastal haze',modes:['sun','haze'],warmth:.038,cloud:.008,wind:.2,sourceIds:['losAngeles']},
 notreDame:{region:'South Bend, Indiana',campus:'University of Notre Dame',weather:'Cool cloud cover with occasional gentle flurries',modes:['clouds','flurry','clouds'],warmth:0,cloud:.029,wind:.39,sourceIds:['southBend']},
 columbia:{region:'New York City, New York',campus:'Columbia University',weather:'Mild overcast and a little autumn drizzle',modes:['drizzle','clouds'],warmth:.006,cloud:.025,wind:.3,sourceIds:['newYork']},
 mit:{region:'Cambridge / Boston, Massachusetts',campus:'Massachusetts Institute of Technology',weather:'A river breeze beneath drifting clouds',modes:['breeze','clouds','drizzle'],warmth:.009,cloud:.023,wind:.65,sourceIds:['boston']},
 northeastern:{region:'Boston, Massachusetts',campus:'Northeastern University',weather:'Soft cloud cover with occasional fine drizzle',modes:['clouds','drizzle'],warmth:.005,cloud:.025,wind:.43,sourceIds:['boston']},
 stanford:{region:'Palo Alto, California',campus:'Stanford University',weather:'Pale sunshine and a trace of marine haze',modes:['sun','haze'],warmth:.028,cloud:.009,wind:.23,sourceIds:['bayArea']},
 pennState:{region:'State College, Pennsylvania',campus:'Penn State',weather:'Cool mist with an occasional late-autumn flurry',modes:['mist','flurry','clouds'],warmth:0,cloud:.026,wind:.3,sourceIds:['centralPA','centralPASnow']},
 washu:{region:'St. Louis, Missouri',campus:'Washington University in St. Louis',weather:'Changeable autumn light and passing clouds',modes:['clouds','sun','breeze'],warmth:.021,cloud:.022,wind:.44,sourceIds:['stLouis']},
 cmu:{region:'Pittsburgh, Pennsylvania',campus:'Carnegie Mellon University',weather:'Soft overcast with a little fine drizzle',modes:['drizzle','clouds'],warmth:.004,cloud:.028,wind:.28,sourceIds:['pittsburgh']},
 princeton:{region:'Princeton, New Jersey',campus:'Princeton University',weather:'Crisp air and a gentle autumn breeze',modes:['breeze','sun','clouds'],warmth:.023,cloud:.018,wind:.54,sourceIds:['princeton','philadelphia']}
};
const sequence=['penn','harvard','harvard','indiana','ucla','notreDame','columbia','mit','harvard','northeastern','stanford','pennState','washu','cmu','princeton','stanford','mit','mit'];
const clocks=new Map();
function keyFor(id){return typeof id==='string'&&families[id]?id:sequence[(Number(id)||1)-1]||'harvard';}
function profile(id){const key=keyFor(id),p=families[key];return{key,...p,modes:p.modes.slice(),season:SEASON,designed:true,isForecast:false,sources:p.sourceIds.map(x=>({...sources[x]})),context:'An authored, pleasant late-autumn condition chosen within regional climate context. It does not report current weather or establish what the weather was during the historical encounter.'};}
function label(id){return `${families[keyFor(id)].weather} · designed autumn ambience`;}
function hash(a,b=0){let n=(a*374761393+b*668265263)>>>0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296;}
function clock(e){const k=e.id||1,stamp=Number(e.time)||0;let c=clocks.get(k);if(!c||stamp<c.source){c={source:stamp,value:e.reduced?0:stamp};clocks.set(k,c);}if(stamp!==c.source){if(e.enabled!==false&&!e.paused&&!e.reduced)c.value+=Math.max(0,stamp-c.source);c.source=stamp;}return c.value;}
function modeAt(p,t,reduced){return p.modes[reduced?0:Math.floor(t/180)%p.modes.length];}
function polygon(c,points){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();}
function enabled(e){return e&&e.enabled!==false;}
function ground(c,e){
 const t=clock(e);if(!enabled(e)||!c||typeof e.iso!=='function')return;const p=profile(e.id),kind=modeAt(p,t,e.reduced),N=Number(e.N)||26,worldTime=e.reduced?0:t;
 c.save();const points=[e.iso(-7,-7),e.iso(N+7,-7),e.iso(N+7,N+7),e.iso(-7,N+7)];polygon(c,points.map(q=>[q.x,q.y+14]));c.clip();
 // Very faint cloud shadows pass under buildings, so office signs stay crisp.
 const cloudy=['clouds','drizzle','flurry','mist'].includes(kind),count=cloudy?3:kind==='haze'?1:0;
 for(let i=0;i<count;i++){const xx=-7+((worldTime*.017+i*12.7+hash(i,Number(e.id)||1)*13)%42),yy=2+hash(i+11,Number(e.id)||1)*25,pos=e.iso(xx,yy);c.save();c.translate(pos.x,pos.y+14);c.scale(1,.38);const g=c.createRadialGradient(0,0,15,0,0,190);g.addColorStop(0,`rgba(43,54,66,${p.cloud})`);g.addColorStop(.6,`rgba(43,54,66,${p.cloud*.56})`);g.addColorStop(1,'rgba(43,54,66,0)');c.fillStyle=g;c.fillRect(-192,-192,384,384);c.restore();}
 c.restore();
}
function dimensions(e){return{W:Math.max(0,Number(e.width)||0),H:Math.max(0,Number(e.height)||0)};}
function protectedRects(e,W,H){const out=[{x:0,y:0,w:Math.min(280,W),h:H},{x:0,y:H-110,w:W,h:110},{x:0,y:0,w:W,h:79},{x:W-180,y:0,w:180,h:151}];if(typeof e.iso==='function'){const cam=e.cam||e.iso(13,14),z=Number(e.zoom)||1,ax=Number.isFinite(e.anchorX)?e.anchorX:W*(e.mode==='menu'?.68:.57),ay=Number.isFinite(e.anchorY)?e.anchorY:H*(e.mode==='menu'?.55:.52);for(const[x,y,w]of[[20,9,250],[12,21.35,245],[6,17,110],[20,18,110]]){const q=e.iso(x,y),sx=ax+(q.x-cam.x)*z,sy=ay+(q.y-cam.y)*z;out.push({x:sx-w/2,y:sy-26,w,h:49});}}return out;}
function isClear(x,y,rects,margin=3){return rects.every(r=>x<r.x-margin||x>r.x+r.w+margin||y<r.y-margin||y>r.y+r.h+margin);}
function precipitation(c,e,p,t,kind,W,H){
 if(e.reduced||W<350||H<230)return;const rects=protectedRects(e,W,H),snow=kind==='flurry',count=snow?20:52,left=Math.min(285,W-50),right=W-18,top=84,bottom=H-114,width=right-left,height=bottom-top;if(width<30||height<30)return;
 c.save();c.beginPath();c.rect(left,top,width,height);c.clip();
 for(let i=0;i<count;i++){const seed=hash(i+41,(Number(e.id)||1)*11),speed=snow?8+hash(i,8)*8:48+hash(i,9)*28,wind=p.wind*(snow?3:7),x=left+((seed*width+t*wind+Math.sin(t*.12+i)*3)%width+width)%width,y=top+((hash(i+17,7)*height+t*speed)%height+height)%height,dx=snow?0:1.5+hash(i,2)*2.3,dy=snow?0:4+hash(i,4)*3.8;if(!isClear(x,y,rects)||!isClear(x+dx,y+dy,rects))continue;
  if(snow){const radius=.65+hash(i,5)*.75;c.fillStyle=`rgba(235,239,233,${.065+hash(i,6)*.04})`;c.beginPath();c.arc(x+Math.sin(t*.42+i)*2,y,radius,0,TAU);c.fill();}
  else{c.strokeStyle=`rgba(194,211,218,${.065+hash(i,6)*.038})`;c.lineWidth=.55+hash(i,3)*.3;c.beginPath();c.moveTo(x,y);c.lineTo(x+dx,y+dy);c.stroke();}
 }
 c.restore();
}
function leaves(c,e,p,t,W,H){if(e.reduced||W<500||H<300)return;const rects=protectedRects(e,W,H),left=285,width=W-left-30,height=H-212;if(width<20||height<20)return;c.save();for(let i=0;i<6;i++){const speed=3.3+hash(i,19)*2.5,x=left+((hash(i,e.id)*width+t*p.wind*8)%width+width)%width,y=94+((hash(i,18)*height+t*speed)%height+height)%height;if(!isClear(x,y,rects,6))continue;const angle=t*.23+i;c.save();c.translate(x,y);c.rotate(angle);c.fillStyle=i%2?'rgba(166,126,65,0.115)':'rgba(185,143,76,0.115)';polygon(c,[[-2.3,0],[0,-1.4],[2.5,.2],[0,1.4]]);c.fill();c.restore();}c.restore();}
function screen(c,e){
 const t=clock(e);if(!enabled(e)||!c)return;const {W,H}=dimensions(e);if(W<1||H<1)return;const p=profile(e.id),kind=modeAt(p,t,e.reduced);c.save();
 // Low-opacity light changes are deliberately restrained: no bloom, white-out,
 // dramatic contrast pumping, lightning, or timed visibility changes.
 const tint=c.createLinearGradient(W*.25,0,W,H);if(kind==='sun'||kind==='breeze'){tint.addColorStop(0,`rgba(242,205,128,${p.warmth})`);tint.addColorStop(.65,`rgba(242,205,128,${p.warmth*.24})`);tint.addColorStop(1,'rgba(242,205,128,0)');}
 else if(kind==='haze'){tint.addColorStop(0,'rgba(222,222,198,0.018)');tint.addColorStop(.62,'rgba(232,224,196,0.009)');tint.addColorStop(1,'rgba(232,224,196,0)');}
 else if(kind==='mist'){tint.addColorStop(0,'rgba(205,218,217,0.023)');tint.addColorStop(.6,'rgba(205,218,217,0.012)');tint.addColorStop(1,'rgba(205,218,217,0)');}
 else{tint.addColorStop(0,'rgba(96,119,137,0.014)');tint.addColorStop(.65,'rgba(96,119,137,0.007)');tint.addColorStop(1,'rgba(96,119,137,0)');}c.fillStyle=tint;c.fillRect(0,0,W,H);
 if(kind==='drizzle'||kind==='flurry')precipitation(c,e,p,t,kind,W,H);else if(kind==='breeze')leaves(c,e,p,t,W,H);c.restore();
}
window.CampusWeather={profile,label,ground,screen,metadata:{season:SEASON,disclaimer:'Designed regional autumn ambience. Not live weather, a forecast, or an assertion about the weather in a historical encounter.',sources:Object.entries(sources).map(([id,s])=>({id,...s})),families:Object.keys(families)},_test:{modeAt,protectedRects,isClear,hash,clock}};
})();
