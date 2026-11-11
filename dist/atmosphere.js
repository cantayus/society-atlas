/* Original Canvas geometry, hand specified palettes and deterministic surface detail.
   These compact landscapes are designed reconstructions, not surveyed campus plans. */
(function(){
'use strict';
const families={
 penn:{key:'penn',name:'Philadelphia streets',lawn:'#87906c',lawn2:'#939879',pave:'#aaa89b',joint:'#807d71',brick:'#9a6b53',edge:'#c6bba3',tree:'elm',leaves:true,urban:true,flowers:['#bb9a7f','#c3bba1']},
 harvard:{key:'harvard',name:'Brick walks and the Yard',lawn:'#818d68',lawn2:'#909c75',pave:'#a88165',joint:'#80634f',brick:'#9f7055',edge:'#c4b599',tree:'elm',leaves:true,flowers:['#b29a7c','#d0bf94']},
 indiana:{key:'indiana',name:'Wooded limestone walks',lawn:'#778a62',lawn2:'#8b9970',pave:'#b9b69f',joint:'#92907d',brick:'#a18e72',edge:'#cfc9ad',tree:'oak',leaves:true,wooded:true,flowers:['#b9a1ad','#cfbd98']},
 ucla:{key:'ucla',name:'Warm terraces and palms',lawn:'#89966d',lawn2:'#9aa47b',pave:'#c5b69c',joint:'#a99a85',brick:'#aa785a',edge:'#ded0b2',tree:'palm',dry:true,terrace:true,flowers:['#ae7896','#cbb383']},
 notreDame:{key:'notreDame',name:'Formal lawns and pale walks',lawn:'#758b66',lawn2:'#879b73',pave:'#b9b69e',joint:'#97957f',brick:'#a1967c',edge:'#d0c8aa',tree:'oak',formal:true,flowers:['#d5caac','#ad9fbc']},
 columbia:{key:'columbia',name:'An urban stone terrace',lawn:'#7f8a69',lawn2:'#929b7a',pave:'#b6b2a3',joint:'#969284',brick:'#a58c73',edge:'#d2c8af',tree:'plane',urban:true,terrace:true,flowers:['#a99cb2','#b6b591']},
 mit:{key:'mit',name:'Granite walks by the river',lawn:'#829074',lawn2:'#96a082',pave:'#b5b6ac',joint:'#96988e',brick:'#a58c78',edge:'#d1cdbd',tree:'plane',river:true,flowers:['#a5aab6','#c5c6a0']},
 northeastern:{key:'northeastern',name:'City sidewalks and brick courtyards',lawn:'#7e8d6c',lawn2:'#909d79',pave:'#a99f91',joint:'#8c8278',brick:'#9d735d',edge:'#c8baa1',tree:'plane',urban:true,street:true,flowers:['#bdb38d','#ad8e8b']},
 stanford:{key:'stanford',name:'Sandstone walks and dry gardens',lawn:'#a0a078',lawn2:'#b0ac85',pave:'#c7b894',joint:'#ab9d7e',brick:'#b18c65',edge:'#decda6',tree:'cypress',dry:true,formal:true,flowers:['#a18fa6','#c4b18b']},
 pennState:{key:'pennState',name:'Broad lawns beneath elms',lawn:'#7c9069',lawn2:'#8da179',pave:'#b9b6a2',joint:'#999582',brick:'#a29076',edge:'#d3ccb2',tree:'elm',wooded:true,flowers:['#d0c7b0','#b19eab']},
 washu:{key:'washu',name:'Red stone and garden terraces',lawn:'#829267',lawn2:'#96a478',pave:'#baaa92',joint:'#9d8a74',brick:'#a6765b',edge:'#d3c0a3',tree:'oak',terrace:true,formal:true,flowers:['#b18c9a','#cbbb91']},
 cmu:{key:'cmu',name:'Brick slopes and retaining walls',lawn:'#86916a',lawn2:'#98a17b',pave:'#b1a58c',joint:'#92856f',brick:'#a3825d',edge:'#cbbf9f',tree:'oak',hillside:true,leaves:true,flowers:['#b6a185','#c4bc8c']},
 princeton:{key:'princeton',name:'Slate paths and ivy courtyards',lawn:'#7b8c67',lawn2:'#8e9c75',pave:'#aaa995',joint:'#8b8b7b',brick:'#9d8366',edge:'#c5bea1',tree:'elm',leaves:true,ivy:true,flowers:['#a68eaa','#c5b99a']}
};
const sequence=['penn','harvard','harvard','indiana','ucla','notreDame','columbia','mit','harvard','northeastern','stanford','pennState','washu','cmu','princeton','stanford','mit','mit'];
function profile(id){return families[sequence[(+id||1)-1]]||families.harvard;}
function polygon(c,pts,fill,stroke,width=.6){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function line(c,pts,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();}
function plan(c,e,x,y,w,h,fill,stroke){const a=e.iso(x,y),b=e.iso(x+w,y),d=e.iso(x,y+h),f=e.iso(x+w,y+h);polygon(c,[[a.x,a.y+15],[b.x,b.y+15],[f.x,f.y+15],[d.x,d.y+15]],fill,stroke);}
function tile(c,e,x,y,color,stroke){const p=e.iso(x,y);polygon(c,[[p.x,p.y],[p.x+e.TW/2,p.y+e.TH/2],[p.x,p.y+e.TH],[p.x-e.TW/2,p.y+e.TH/2]],color,stroke);}
function paved(x,y,p){
 const arterial=x>=15&&x<=17||y>=19&&y<=21||y>=8&&y<=10||x>=23||y>=23;
 if(p.key==='penn')return arterial||x<9&&y>16||x<3;
 if(p.key==='columbia')return arterial||y<12||x<9&&y>10;
 if(p.key==='northeastern')return arterial||x<3||y>21;
 if(p.key==='stanford')return arterial||x>=8&&x<=10||y===17;
 if(p.formal)return arterial||x>=8&&x<=9||y===17;
 return arterial||x>=8&&x<=9&&y>=7&&y<=19;
}
// Small, irregular painted marks are placed from a fixed seed. They are not
// frame noise. The world renderer may raster-cache these source-drawn layers.
function patch(c,x,y,rx,ry,seed,color,hash){const pts=[];for(let n=0;n<13;n++){const a=n/13*Math.PI*2,k=.72+hash(seed+n,121)*.37;pts.push([x+Math.cos(a)*rx*k,y+Math.sin(a)*ry*k]);}polygon(c,pts,color);}
function surface(c,e,q,x,y,p,brick){
 const P=(u,v)=>[q.x+(u-v)*30,q.y+(u+v)*15],hash=e.hash;
 c.save();c.beginPath();c.moveTo(q.x,q.y);c.lineTo(q.x+30,q.y+15);c.lineTo(q.x,q.y+30);c.lineTo(q.x-30,q.y+15);c.closePath();c.clip();
 if(brick){
   for(let row=0;row<4;row++)for(let n=-1;n<4;n++){
     const u=n/3+(row%2)/6,v=row/4,h=hash(x*37+n,y*19+row),m=.025,pts=[P(u+m,v+m),P(u+1/3-m,v+m),P(u+1/3-m,v+.25-m),P(u+m,v+.25-m)];
     polygon(c,pts,e.shade(p.brick,Math.floor(h*27)-11));line(c,[pts[0],pts[1]],h>.4?'#d5af7b65':'#be947367',.7);line(c,[pts[1],pts[2]],'#634f4260',.8);
     if(h>.7){const a=P(u+.1,v+.06),b=P(u+.14,v+.17);line(c,[a,b],'#6a574443',.6);}
   }
 }else{
   for(let row=0;row<2;row++)for(let n=-1;n<3;n++){
     const u=n/2+(row%2)*.13,v=row/2,h=hash(x*29+n,y*23+row),m=.022,chip=.025+h*.045;
     const pts=[P(u+m+chip,v+m),P(u+.5-m,v+m),P(u+.5-m,v+.5-m-chip),P(u+.5-m-chip,v+.5-m),P(u+m,v+.5-m),P(u+m,v+m+chip)];
     polygon(c,pts,e.shade(p.pave,Math.floor(h*24)-10));line(c,[pts[0],pts[1]],'#e6dac177',.7);line(c,[pts[2],pts[3],pts[4]],p.joint+'80',.7);
     if(h>.77)line(c,[P(u+.1,v+.06),P(u+.19,v+.23),P(u+.15,v+.38)],p.joint+'73',.7);
   }
 }
 // Sand settles in joints; worn center strips soften the manufactured grid.
 for(let n=0;n<9;n++){const u=hash(x*41+n,y+24),v=hash(y*37+n,x+83),a=P(u,v);c.fillStyle=n%3?'#f0dcba35':'#4c51422a';c.fillRect(a[0],a[1],.8+hash(n,x)*1.5,.6);}
 c.restore();
}
function drawGround(c,e){
 const p=profile(e.id),hash=e.hash,shade=e.shade;c.save();
 // A neighborhood edge or river gives each grounds a setting beyond the quad.
 if(p.river){plan(c,e,26,2,4,24,'#536f70');plan(c,e,26.05,2,.35,24,'#354e4f');plan(c,e,26.4,2,.7,24,'#617e7b');for(let n=0;n<160;n++){const xx=26.1+hash(n,72)*3.7,yy=2+hash(n,39)*24,a=e.iso(xx,yy),b=e.iso(xx+.12+hash(n,84)*.75,yy+.04);line(c,[[a.x,a.y+16],[b.x,b.y+16]],['#a8b5a664','#889f9250','#233e4240','#b9c1a641'][n%4],.65+hash(n,47));}for(let n=0;n<48;n++){const a=e.iso(25.6,2+n*.5),b=e.iso(26,2+n*.5);polygon(c,[[a.x,a.y+14],[b.x,b.y+14],[b.x,b.y+22],[a.x,a.y+22]],n%3?'#aaa98c':'#b7af91','#6f756156');line(c,[[a.x,a.y+13],[b.x,b.y+13]],'#d7c7a7',1.2);}}
 if(p.urban){plan(c,e,-1,26,28,2.3,p.key==='penn'?'#8e8a7d':'#787c75');plan(c,e,-1,25.9,28,.18,'#d0c5aa');if(p.street)for(let n=0;n<13;n++)plan(c,e,n*2,27,.8,.08,'#bfbda3');}
 for(let y=0;y<e.N;y++)for(let x=0;x<e.N;x++){
   const ground=e.grid[y][x];if(ground!==0&&ground!==2)continue;
   const r=hash(x+e.id*31,y+11),isPath=ground===0&&paved(x,y,p),gardenStone=ground===2&&(p.dry||p.key==='columbia'||p.key==='penn'),base=gardenStone?(p.dry?'#b9ad8c':p.pave):isPath?p.pave:p.lawn,color=shade(base,Math.floor(r*(isPath?9:5))-(isPath?4:2));
   tile(c,e,x,y,color);
   const q=e.iso(x,y);
   if(ground===2){
     if(gardenStone)for(let n=0;n<4;n++){const xx=q.x-16+hash(x+n,y)*32,yy=q.y+9+hash(y+n,x)*13;polygon(c,[[xx-1.5,yy],[xx+1,yy-.7],[xx+2,yy+.7],[xx,yy+1.4]],shade(base,-13));}
     else{for(let n=0;n<3;n++){const xx=q.x-16+hash(x+n,y)*32,yy=q.y+10+hash(y+n,x)*12;line(c,[[xx-1,yy],[xx,yy-3],[xx+1,yy]],'#4b6c4560',.6);}}
   }else if(isPath){
     const brick=p.key==='harvard'||p.key==='northeastern'||p.key==='penn'&&y<22;
     surface(c,e,q,x,y,p,brick);
     if(p.leaves&&r>.72){for(let n=0;n<2;n++){const xx=q.x+(hash(x+n,y)*28-14),yy=q.y+10+hash(y+n,x)*10;polygon(c,[[xx-2,yy],[xx+2,yy+1],[xx+1,yy+3],[xx-2,yy+2]],['#a39164','#8f835e','#b29c72'][(x+y+n)%3]);}}
     if(p.urban&&r>.83){c.fillStyle='#5c62572b';c.beginPath();c.ellipse(q.x+7,q.y+17,7,2.5,0,0,Math.PI*2);c.fill();}
   }else{
     patch(c,q.x+4,q.y+17,20,6,x*33+y,p.dry?'#c1b48133':'#354c3423',hash);patch(c,q.x-5,q.y+12,14,4,x*41-y,p.dry?'#796f4b29':'#bec88b24',hash);
     for(let n=0;n<13;n++){const u=hash(x*3+n,y*7),v=hash(y*2+n,x*5),xx=q.x+(u-v)*27,yy=q.y+(u+v)*14+1,h=1.4+hash(n+x,y)*2.4;
       line(c,[[xx-1.5,yy],[xx-.3,yy-h],[xx+.5,yy-.8],[xx+1.6,yy-h*.8]],n%3===0?(p.dry?'#c4b88791':'#acba7b83'):(p.dry?'#6e704c6e':'#3e5b3c71'),.65);
       if(n%4===0){c.fillStyle=p.dry?'#d1bc8b74':'#d5c89b50';c.fillRect(xx+2,yy+.6,1.2,.65);}}
     if(r>.74){patch(c,q.x-1,q.y+18,12,3.6,x*11+y,p.dry?'#b0986a50':'#9b91624a',hash);for(let n=0;n<4;n++)line(c,[[q.x-9+n*4,q.y+17+n%2],[q.x-6+n*4,q.y+18+n%2]],'#c6b58855',.7);}
   }
   // A thin pale edging follows lawn-to-walk transitions without hiding tile access.
   if(!isPath){for(const [dx,dy,a,b]of[[1,0,[0,30],[30,15]],[0,1,[-30,15],[0,30]]])if(e.grid[y+dy]?.[x+dx]===0&&paved(x+dx,y+dy,p)){const edge=[[q.x+a[0],q.y+a[1]],[q.x+b[0],q.y+b[1]]];line(c,edge,p.dry?'#9b875f75':'#847b5160',5);line(c,edge,p.edge,1.3);}}
 }
 // The protected central plot changes its use with the campus. It is never a
 // universal pond: low stone or planted borders explain its non-walkable edge.
 const bx=9.5,by=10.5,bw=5,bh=4;
 plan(c,e,bx,by,bw,bh,undefined,shade(p.edge,-8));
 // Weathered low masonry explains the protected plot's non-walkable edge.
 for(let n=0;n<11;n++){const a=e.iso(bx+n*bw/11,by+bh),b=e.iso(bx+(n+1)*bw/11,by+bh);polygon(c,[[a.x,a.y+11],[b.x,b.y+11],[b.x,b.y+16],[a.x,a.y+16]],shade(p.edge,-18),'#5a614247');line(c,[[a.x,a.y+10],[b.x,b.y+10]],shade(p.edge,11),1.4);}
 if(p.key==='penn'){
   for(let n=0;n<3;n++){plan(c,e,10.05+n*1.45,11.1,1.05,2.65,'#7c7659','#a69a77');for(let m=0;m<7;m++){const q=e.iso(10.3+n*1.45,11.35+m*.34);c.fillStyle=m%2?'#72824f':'#87915d';c.beginPath();c.ellipse(q.x,q.y+12,6,3,0,0,6.3);c.fill();}}
 }else if(p.key==='stanford'){
   plan(c,e,10.2,11.1,3.6,.23,'#a89a78');plan(c,e,11.7,11.3,.22,2.5,'#a89a78');
   for(const [xx,yy]of [[10.4,11.7],[13.4,11.5],[10.6,13.4],[13.3,13.4]]){const q=e.iso(xx,yy);for(let n=0;n<5;n++){c.strokeStyle=n%2?'#879068':'#6f815b';c.lineWidth=2;c.beginPath();c.moveTo(q.x,q.y+14);c.quadraticCurveTo(q.x+(n-2)*4,q.y-1,q.x+(n-2)*5,q.y+3);c.stroke();}}
 }else if(p.key==='columbia'){
   for(const [xx,yy]of [[10.2,11.1],[12.6,11.1],[10.2,13],[12.6,13]])plan(c,e,xx,yy,1.35,1.15,'#7e8b63',p.edge);
 }else if(p.formal){
   for(const [xx,yy]of [[9.9,10.9],[12.2,10.9],[9.9,12.8],[12.2,12.8]]){plan(c,e,xx,yy,1.85,1.35,p.lawn2,shade(p.lawn,-12));plan(c,e,xx+.16,yy+.16,1.53,1.03,p.lawn,shade(p.lawn2,-10));}
 }else if(p.hillside){
   for(let n=0;n<4;n++){plan(c,e,9.8,10.8+n*.85,4.4,.13,p.edge);plan(c,e,9.8,10.95+n*.85,4.4,.5,shade(p.lawn,n%2?3:-2));}
 }else{
   // A soft, irregular herbaceous edge leaves broad tree-shaded lawn inside.
   for(let n=0;n<24;n++){const xx=9.75+(n%8)*.62,yy=n<8?10.75:n<16?14.15:11.1+(n-16)*.38,q=e.iso(n<16?xx:9.75,yy);c.fillStyle=['#6b8054','#7b8d5d','#8b9766'][n%3];c.beginPath();c.ellipse(q.x,q.y+11,5+hash(n,e.id)*3,3,0,0,6.3);c.fill();}
 }
 // Garden borders sit beside the central walk rather than on its route.
 const beds=p.key==='columbia'?[[9.1,16.2,4.8,.6],[1,22,5,.7]]:p.dry?[[10,16.2,4.6,.55],[19,22,.65,2]]:[[10,16.2,4.5,.5],[19,22,2.3,.55]];
 for(const [x,y,w,h]of beds){plan(c,e,x,y,w,h,p.key==='stanford'?'#b2a07b':'#655b42',p.edge);for(let n=0;n<Math.ceil(w*10);n++){const xx=x+hash(n+50,e.id)*w,yy=y+hash(n,e.id+6)*h,q=e.iso(xx,yy),hh=3+hash(e.id,n)*4;line(c,[[q.x,q.y+15],[q.x-1,q.y+15-hh]],'#4e693c',.9);line(c,[[q.x,q.y+12],[q.x-4,q.y+10]],'#789047',1.1);for(let petal=0;petal<3;petal++){const a=petal*2.1;c.fillStyle=p.flowers[n%p.flowers.length];c.fillRect(q.x-1+Math.cos(a)*1.6,q.y+14-hh+Math.sin(a),1.7,1.2);}c.fillStyle='#d2b16c';c.fillRect(q.x-1,q.y+14-hh,.8,.8);}}
 if(p.terrace||p.hillside){for(let n=0;n<3;n++)plan(c,e,1,23.4+n*.25,6,.1,shade(p.edge,-n*9));}
 c.restore();
}
function shadow(c,x,y,w=24){c.fillStyle='#2b322524';c.beginPath();c.ellipse(x+8,y+16,w,6,0,0,6.3);c.fill();}
const foliageColors={
 penn:['#273b2c','#3e5232','#596b3c','#7a8a4b','#a8ae69','#927143'],harvard:['#29392a','#455733','#627344','#899553','#b5b374','#9e7545'],
 indiana:['#253c2a','#3e5733','#5c733e','#84934e','#aca864','#997b46'],ucla:['#253e31','#3f5940','#65794b','#8c9b60','#b2b37a','#92744f'],
 notreDame:['#273d2b','#3e5835','#5d7842','#87984f','#b5b973','#9b7c45'],columbia:['#303e2c','#4a5d37','#6c7d45','#929d58','#bbb97b','#a48a4c'],
 mit:['#263c31','#415c3c','#66804d','#8e9e63','#bdc187','#9d824e'],northeastern:['#2a3c30','#435838','#647b45','#879655','#b3b478','#a28653'],
 stanford:['#233e36','#355648','#517357','#728c61','#99a575','#887451'],pennState:['#263e2c','#405d36','#627e43','#8ca359','#b5bd7b','#9c7a46'],
 washu:['#2d3b28','#4a5c34','#707e40','#96a154','#c0b977','#a37848'],cmu:['#303a27','#4c5730','#73763b','#98934f','#c4ad6a','#a27340'],
 princeton:['#293c2c','#405a35','#617b43','#899755','#b8b773','#a08249']
};
function crownMass(c,e,x,y,rx,ry,seed,colors,warm){
 const hash=e.hash,points=[];
 for(let n=0;n<25;n++){const a=n/25*Math.PI*2,k=.78+hash(seed+n,31)*.29;points.push([x+Math.cos(a)*rx*k,y+Math.sin(a)*ry*k]);}
 polygon(c,points,warm?'#6d6538':colors[1]);
 // Each mass carries lit upper-left leaves, cool deep pockets and a broken rim.
 for(let n=0;n<74;n++){
   const angle=hash(seed+n*3,71)*Math.PI*2,r=Math.sqrt(hash(seed+n*5,82))*.94,xx=x+Math.cos(angle)*rx*r,yy=y+Math.sin(angle)*ry*r;
   const lit=(-Math.cos(angle)*.35-Math.sin(angle)*.65)*r,choice=hash(seed+n,99),index=lit>.25?(choice>.48?4:3):lit<-.22?(choice>.5?0:1):choice>.58?3:2;
   const color=warm&&choice>.42?['#5b4c2d','#796039','#987a43','#b09453','#c7ac69'][Math.min(4,index)]:colors[index],w=1.1+hash(n+seed,48)*2.4,h=.7+hash(seed,n+26)*1.1;
   polygon(c,[[xx-w,yy],[xx-.3,yy-h],[xx+w,yy-.15],[xx+w*.4,yy+h],[xx-w*.65,yy+h*.4]],color);
   if(choice>.83)line(c,[[xx-w*.4,yy-h],[xx+w*.55,yy-h*.2]],colors[4],.5);
 }
 // A few larger leaf lobes break a smooth silhouette at meaningful sprite size.
 for(let n=0;n<10;n++){const a=n/10*Math.PI*2,k=.82+hash(seed,n)*.12,xx=x+Math.cos(a)*rx*k,yy=y+Math.sin(a)*ry*k;
   polygon(c,[[xx-2,yy],[xx-1,yy-2.5],[xx+2,yy-1],[xx+2.5,yy+1],[xx-.5,yy+2]],n<5?colors[3]:colors[1]);}
}
function tree(c,e,x,y,species,size=1){
 const p=e.iso(x,y),hash=e.hash,pal=profile(e.id),colors=foliageColors[pal.key],seed=Math.round(x*113+y*197+e.id*59),r=hash(seed,15);c.save();c.translate(p.x,p.y+14);c.scale(size,size);
 // A broken canopy shadow and radiating roots anchor the miniature to the soil.
 patch(c,23,4,44,12,seed,'#182b284b',hash);patch(c,12,3,30,8,seed+2,'#1f302b3b',hash);
 for(let n=0;n<6;n++){const angle=hash(seed,n)*Math.PI*2,end=[Math.cos(angle)*(10+hash(n,seed)*9),Math.sin(angle)*5+3];line(c,[[0,0],end],n%2?'#786c493b':'#5b563b50',1.4);}
 const bark=species==='plane'?['#756a4c','#a09572','#c3b18b']:['#514c36','#77684a','#aa9164'];
 polygon(c,[[-5,3],[-3,-24],[-5,-48],[-2,-70],[3,-70],[4,-34],[5,2]],bark[0]);
 polygon(c,[[-3,2],[-2,-29],[-3,-50],[0,-71],[2,-70],[1,-28],[2,1]],bark[1]);line(c,[[-2,0],[-1,-27],[-2,-48]],bark[2],1.25);
 for(let n=0;n<9;n++){const yy=-6-n*6;line(c,[[n%2?-3:1,yy],[n%2?-1:3,yy-4]],'#302e2570',.7);}
 if(species==='palm'){
   // Bent, ringed trunk and hand-shaped fronds with individual leaflets.
   polygon(c,[[-5,3],[-7,-36],[-1,-78],[3,-111],[8,-112],[4,-75],[-1,-34],[1,2]],'#77674b');
   line(c,[[-4,0],[-4,-34],[2,-78],[6,-111]],'#b5a073',2);
   for(let n=0;n<20;n++){const yy=-4-n*5,xx=-4+Math.max(0,-yy-30)*.1;line(c,[[xx-2,yy],[xx+4,yy+1]],n%2?'#c0a77a':'#5c5640',.9);}
   for(let n=0;n<11;n++){
     const angle=n/11*Math.PI*2+(hash(seed,n)-.5)*.25,dx=Math.cos(angle)*(40+hash(n,seed)*19),dy=Math.sin(angle)*20+19,ox=5,oy=-112;
     const spine=[];for(let k=0;k<=15;k++){const t=k/15;spine.push([ox+dx*t,oy+dy*t-22*Math.sin(t*Math.PI)]);}line(c,spine,n<5?'#7b8d56':'#415b3d',1.7);
     for(let k=1;k<15;k++){const t=k/15,pt=spine[k],len=Math.sin(t*Math.PI)*(10+hash(seed,k+n)*5);for(const side of[-1,1])line(c,[[pt[0],pt[1]],[pt[0]-dx*.08+side*Math.sin(angle)*len,pt[1]+4+side*Math.cos(angle)*len*.48]],n<4?'#96a05f':n>8?'#7c7850':'#597847',.9);}
   }
 }else if(species==='cypress'){
   const outline=[[-12,-14],[-16,-33],[-13,-46],[-16,-63],[-12,-77],[-10,-94],[-6,-108],[-3,-127],[0,-142],[4,-128],[6,-113],[10,-98],[11,-80],[15,-65],[12,-49],[15,-31],[10,-14]];polygon(c,outline,colors[0]);
   for(let n=0;n<280;n++){const yy=-18-hash(seed+n,35)*116,t=(-yy-18)/116,w=(1-t)*12+3,xx=(hash(seed+n,67)-.5)*w*2,color=xx<0?(n%3?colors[3]:colors[4]):n%4?colors[1]:colors[2];line(c,[[xx-2,yy+3],[xx,yy-3-hash(n,seed)*5],[xx+1.5,yy+1]],color,.8+hash(seed,n)*.6);}
   line(c,[[-3,-23],[-2,-72],[0,-123]],'#8e9b642c',1.7);
 }else{
   const elm=species==='elm',plane=species==='plane';
   const forks=elm?[[-22,-62],[-34,-76],[19,-67],[32,-82],[-6,-98]]:[[-30,-55],[-40,-70],[29,-54],[35,-79],[3,-94]];
   for(let n=0;n<forks.length;n++){const [xx,yy]=forks[n];polygon(c,[[-2,-22],[xx-2,yy+8],[xx,yy],[xx+2,yy+6],[2,-29]],bark[0]);line(c,[[0,-27],[xx*.65,yy*.75],[xx,yy+1]],bark[1],1.6);}
   const masses=elm?[[0,-102,17,22],[-16,-87,22,22],[17,-90,21,23],[-30,-69,23,22],[1,-69,28,26],[28,-68,22,21],[-17,-49,23,19],[13,-48,24,19]]:
     [[-7,-95,25,22],[-30,-79,24,23],[24,-82,26,24],[-38,-58,24,22],[-6,-64,32,29],[31,-56,27,24],[-19,-39,24,17],[13,-39,26,19]];
   for(let n=0;n<masses.length;n++){const [xx,yy,rx,ry]=masses[n],jitter=(hash(seed,n)-.5)*8,warm=pal.leaves&&r>.63&&n%3!==1;crownMass(c,e,xx+jitter,yy+(plane?5:0),rx,ry,seed+n*103,colors,warm);}
   // Visible branch forks in the dark lower canopy, with light catching one side.
   line(c,[[-1,-16],[-2,-35],[-13,-51]],bark[0],2.2);line(c,[[0,-28],[9,-43],[17,-50]],bark[1],1.1);
 }
 if(pal.leaves)for(let n=0;n<20;n++){const xx=(hash(seed,n+91)-.5)*53,yy=hash(seed,n+18)*13-1;polygon(c,[[xx-2,yy],[xx,yy-1],[xx+2,yy+.7],[xx-.4,yy+1.5]],['#9a814c','#ba9b5e','#796c41'][n%3]);}
 c.restore();
}
function bench(c,e,x,y){const p=e.iso(x,y);shadow(c,p.x,p.y,24);const wood=profile(e.id).key==='stanford'?'#95815e':'#826d4d';for(const xx of [-16,12]){line(c,[[p.x+xx,p.y+8],[p.x+xx,p.y+18]],'#4c5446',2.3);line(c,[[p.x+xx+7,p.y+1],[p.x+xx+7,p.y+12]],'#4c5446',2);}
 for(let n=0;n<3;n++){polygon(c,[[p.x-22,p.y+n*2],[p.x+15,p.y+17+n*2],[p.x+23,p.y+13+n*2],[p.x-14,p.y-4+n*2]],wood,'#b09c7266');}
 for(let n=0;n<3;n++)line(c,[[p.x-18,p.y-13+n*3],[p.x+20,p.y+5+n*3]],n%2?'#a18a60':wood,2.5);line(c,[[p.x-18,p.y-13],[p.x-18,p.y+6]],'#545947',1.6);line(c,[[p.x+20,p.y+5],[p.x+20,p.y+23]],'#545947',1.6);}
function lamp(c,e,x,y,old){const p=e.iso(x,y);shadow(c,p.x,p.y,11);line(c,[[p.x,p.y+14],[p.x,p.y-46]],'#4b5146',2.3);c.fillStyle='#626552';c.fillRect(p.x-4,p.y+10,8,5);if(old){polygon(c,[[p.x-6,p.y-46],[p.x-5,p.y-60],[p.x+5,p.y-60],[p.x+6,p.y-46]],'#d7ccb0','#4e5549');polygon(c,[[p.x-8,p.y-60],[p.x,p.y-66],[p.x+8,p.y-60]],'#59604e');line(c,[[p.x,p.y-60],[p.x,p.y-46]],'#6c705b',.8);}else{line(c,[[p.x,p.y-46],[p.x+9,p.y-50],[p.x+17,p.y-49]],'#535c50',2);c.fillStyle='#c3c2a6';c.fillRect(p.x+10,p.y-50,12,3);}}
function bike(c,e,x,y){const p=e.iso(x,y);c.strokeStyle='#566052';c.lineWidth=1.3;for(const xx of [-13,12]){c.beginPath();c.ellipse(p.x+xx,p.y+11,9,7,.18,0,6.3);c.stroke();}line(c,[[p.x-13,p.y+11],[p.x-3,p.y-3],[p.x+12,p.y+11],[p.x-6,p.y+7],[p.x-13,p.y+11]],'#7e6650',1.5);line(c,[[p.x-3,p.y-3],[p.x-6,p.y+7],[p.x+12,p.y+11],[p.x+7,p.y-7],[p.x+13,p.y-8]],'#657066',1.5);line(c,[[p.x-7,p.y-5],[p.x+1,p.y-4]],'#4b5449',2);}
function planter(c,e,x,y,large){const p=e.iso(x,y),w=large?19:10,pal=profile(e.id);shadow(c,p.x,p.y,w);polygon(c,[[p.x-w,p.y],[p.x+w,p.y],[p.x+w-4,p.y+16],[p.x-w+4,p.y+16]],pal.dry?'#a37a54':'#8e8972','#5c624d');polygon(c,[[p.x-w,p.y],[p.x,p.y-6],[p.x+w,p.y],[p.x,p.y+5]],'#b4a17a','#c7b18d');line(c,[[p.x-w+2,p.y+3],[p.x-w+5,p.y+14]],'#c3ab7c',1.2);polygon(c,[[p.x-w+3,p.y],[p.x,p.y-4],[p.x+w-3,p.y],[p.x,p.y+3]],'#514e36');for(let n=0;n<6;n++){const xx=p.x+(n-2.5)*w*.25,yy=p.y-5-(n%3)*3;patch(c,xx,yy,4.5,6,n+Math.round(x*37),'#4d683e',e.hash);for(let k=0;k<9;k++){const px=xx+(e.hash(n+k,x)-.5)*7,py=yy+(e.hash(k+n,y)-.5)*9;line(c,[[px-1.5,py],[px,py-2],[px+1,py]],k%3?'#789550':'#a9ad62',.8);}}}
function wall(c,e,x,y,length){const pal=profile(e.id);for(let n=0;n<length;n++){const p=e.iso(x+n*.55,y);polygon(c,[[p.x-9,p.y+8],[p.x+8,p.y+16],[p.x+8,p.y],[p.x-9,p.y-8]],pal.pave,pal.joint);polygon(c,[[p.x-9,p.y-8],[p.x-4,p.y-11],[p.x+13,p.y-3],[p.x+8,p.y]],pal.edge,pal.joint);}}
function table(c,e,x,y){const p=e.iso(x,y);shadow(c,p.x,p.y,24);for(const xx of [-17,14])line(c,[[p.x+xx,p.y+3],[p.x+xx,p.y+18]],'#6c6650',2);polygon(c,[[p.x-26,p.y-12],[p.x+8,p.y+4],[p.x+27,p.y-5],[p.x-7,p.y-21]],'#9b8964','#746e52');polygon(c,[[p.x-8,p.y-14],[p.x+5,p.y-8],[p.x+13,p.y-12],[p.x,p.y-18]],'#d4cdb3','#aaa68a');line(c,[[p.x-3,p.y-13],[p.x+6,p.y-10]],'#a6a58c',.7);polygon(c,[[p.x-20,p.y-12],[p.x-12,p.y-8],[p.x-7,p.y-10],[p.x-15,p.y-14]],'#687766');line(c,[[p.x-19,p.y-10],[p.x-12,p.y-7]],'#d0c8ac',1.1);}
function basket(c,e,x,y){const p=e.iso(x,y);c.fillStyle='#5f6857';c.fillRect(p.x-5,p.y-4,10,17);for(let n=-3;n<=3;n+=2)line(c,[[p.x+n,p.y-2],[p.x+n,p.y+11]],'#9ca087',.6);c.fillStyle='#4d5a4c';c.beginPath();c.ellipse(p.x,p.y-4,6,2,0,0,6.3);c.fill();}
function sign(c,e,x,y){const p=e.iso(x,y);line(c,[[p.x,p.y+14],[p.x,p.y-24]],'#746b50',2);polygon(c,[[p.x-13,p.y-28],[p.x+14,p.y-15],[p.x+14,p.y-7],[p.x-13,p.y-20]],'#a39772','#6e7057');for(let n=0;n<2;n++)line(c,[[p.x-8,p.y-22+n*3],[p.x+8,p.y-14+n*3]],'#ddd2ae',.9);}
function ivy(c,e,x,y){const p=e.iso(x,y);for(let n=0;n<14;n++){const xx=p.x+(e.hash(n,e.id)-.5)*65,yy=p.y-5-e.hash(n+7,e.id)*36;line(c,[[xx,p.y+10],[xx-3,yy]],'#67714d',.7);c.fillStyle=n%2?'#617a4e':'#7e8d58';c.beginPath();c.ellipse(xx-3,yy,3.8,2.8,n,0,6.3);c.fill();}}
function props(e){
 const p=profile(e.id),out=[],push=(x,y,type,args=[],depth=x+y+.6)=>out.push({depth,x,y,kind:type,draw:c=>({tree,bench,lamp,bike,planter,wall,table,basket,sign,ivy}[type])(c,e,x,y,...args)});
 let trees=[[1.2,3.5,1.1],[.7,9.8,1.2],[1.8,14.9,.95],[24,3.2,1.1],[24.6,19.3,1.05],[8.1,24.6,1.15],[19.3,24.8,.95]];
 if(p.key==='harvard')trees=[[.9,2.8,1.25],[2.3,1,1.1],[1.2,11.6,1.2],[.5,15.2,.95],[1.4,23.4,1.1],[8.7,24.8,1.15],[23.9,3.1,1.25],[24.7,12.4,1.05],[23.6,23.6,1.2]];
 if(p.wooded)trees=trees.concat([[.5,6.4,1.25],[1.9,7.8,.9],[14.2,1.4,1.2],[15.6,.6,.95],[2.2,23.1,1.2],[10.1,25,1.05],[23.3,23.8,1.1]]);
 if(p.key==='indiana')trees.push([12.2,12.3,'garden']);
 if(p.key==='stanford')trees=[[1.2,8.7,1.15],[.6,11.3,1.3],[2,10.6,.9],[14.1,1.2,1.1],[24.4,2.8,1.15],[24,9.5,1.3],[24.8,11.5,1.05],[7.8,24.1,1.1],[18.4,24.8,1.25]];
 if(p.key==='mit')trees=[[1.3,2.7,1.1],[14.2,1.7,1.2],[24.1,4.7,.95],[24.4,18.7,1.1],[9.1,24.6,1.2]];
 if(p.key==='penn')trees=[[1.1,10.1,1.05],[8.4,24.4,1.2],[18.4,24.7,1.1],[24.3,19.5,1.05]];
 if(p.key==='ucla')trees=[[1.4,2.2,1.05],[14.1,1.2,1.2],[24.2,3.7,1.1],[23.9,11.6,.95],[23.1,22.5,1.2],[7.5,24.2,1.05],[18,24.9,1.3]];
 if(p.key==='columbia')trees=[[1,2,.85],[1,16,.9],[24,4,.9],[24,19,.95],[10,24,.85],[18,24,.85]];
 for(const [x,y,s]of trees){const scale=s==='garden'?.9:s,at=e.iso(x,y),halfWidth=p.tree==='cypress'?27:p.tree==='palm'?64:65;const hidesClue=[[12,20],[20,8],[6,16]].some(([cx,cy])=>{const q=e.iso(cx,cy),dy=at.y-q.y;return Math.abs(at.x-q.x)<halfWidth*scale+15&&dy> -20&&dy<160*scale;});if(!hidesClue)push(x,y,'tree',[p.tree,scale]);}
 for(const [x,y]of [[10,18],[18.8,19],[9,22.6],[22,11.1]])push(x,y,'bench');
 for(const [x,y]of [[10.3,20.7],[17.7,10.1],[23.2,18.2],[8.7,8.8]])push(x,y,'lamp',[e.id===1||[2,3,14,15].includes(e.id)]);
 push(17.6,22.5,'basket');push(9.5,17.4,'basket');push(17.4,11.3,'sign');
 push(20.2,22.5,'table');push(21.9,23.2,'bench');
 if(e.id!==1){push(16.1,22.6,'bike');push(16.8,23.4,'bike');}
 if(p.dry||p.urban){for(const [x,y]of [[16.7,8.9],[22.9,10.6],[9.5,22.8]])push(x,y,'planter',[p.dry]);}
 if(p.terrace||p.hillside){push(1.3,22.4,'wall',[8]);push(18.3,25,'wall',[8]);}
 if(p.formal){push(10,16.1,'planter',[true]);push(14.1,16.1,'planter',[true]);}
 if(p.ivy){push(7,8.1,'ivy');push(10.2,8.1,'ivy');push(4,16.05,'ivy');}
 if(p.key==='penn'){push(2,21.6,'basket');push(5.5,21.8,'table');push(6.3,21.8,'sign');}
 // Furniture is decorative: no collision edits and no interaction-point obstruction.
 return out;
}
window.CampusAtmosphere={profile,drawGround,props};
})();
