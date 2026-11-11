/* Original, source-informed miniature architectural rendering. Landmark exteriors
   use recognizable material and silhouette; scale and plans are reconstructed. */
(function () {
  'use strict';
  function draw(ctx, b, env) {
    if (!b || !['landmark', 'secondary', 'office', 'archive', 'library', 'rowhouse'].includes(b.type)) return false;
    const { iso, box, poly, shade } = env;
    const { x, y, w, h, wall:sourceWall, roof:sourceRoof, style } = b;
    function pigment(hex,saturation=1.1,light=0){const raw=hex.replace('#',''),rgb=[0,2,4].map(i=>parseInt(raw.slice(i,i+2),16)),mean=(rgb[0]+rgb[1]+rgb[2])/3;return '#'+rgb.map((v,i)=>Math.round(Math.max(0,Math.min(255,mean+(v-mean)*saturation+light+[3,0,-4][i]))).toString(16).padStart(2,'0')).join('');}
    function blend(a,c,t){return '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(c.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');}
    const wall=pigment(sourceWall||'#a68b69',1.18,3),roof=pigment(sourceRoof||'#635f52',1.16,-5);
    const z = b.height || 74;
    const trim = blend(wall,'#ead7ad',.67), dark = '#243c38';
    const P = (xx, yy, zz = 0) => { const p = iso(xx, yy); return [p.x, p.y - zz]; };
    const noise = (a,c=0) => {let n=(Math.imul(Math.round(a*197),374761393)+Math.imul(Math.round(c*173),668265263))>>>0;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;};
    const mix = (a,c,t) => [a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t];
    const line = (pts, color, width = 1) => { ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); pts.forEach((p,i) => i ? ctx.lineTo(p[0],p[1]) : ctx.moveTo(p[0],p[1])); ctx.stroke(); };
    function faceRect(bd, u, v, uw, vh, color, side = false, stroke) {
      const pt = (a, q) => side ? P(bd.x+bd.w, bd.y+a, q) : P(bd.x+a, bd.y+bd.h, q);
      poly([pt(u,v),pt(u+uw,v),pt(u+uw,v+vh),pt(u,v+vh)], color, stroke);
    }
    function grain(points,seed,material='stone') {
      // Pixel-scale surface marks are deterministic source-coded texture, clipped
      // to the architectural plane. No bitmap or generated asset is sampled.
      const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),minX=Math.floor(Math.min(...xs)),maxX=Math.ceil(Math.max(...xs)),minY=Math.floor(Math.min(...ys)),maxY=Math.ceil(Math.max(...ys));
      ctx.save();ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.clip();
      const step=material==='roof'?3.2:3.8;
      for(let yy=minY;yy<maxY;yy+=step)for(let xx=minX;xx<maxX;xx+=step){const r=noise(xx+seed,yy-seed);if(r<.42)continue;ctx.fillStyle=r>.81?'#f3deac20':r>.64?'#d1b38916':'#1c302a1c';ctx.fillRect(xx+r*.9,yy+(r>.7?.7:0),r>.84?1.8:.8,material==='roof'?.55:.6+r*.5);}
      ctx.restore();
    }
    function litMass(bd,height,color=wall,top=roof){
      const a=P(bd.x,bd.y,height),bb=P(bd.x+bd.w,bd.y,height),c=P(bd.x+bd.w,bd.y+bd.h,height),d=P(bd.x,bd.y+bd.h,height),front=[P(bd.x,bd.y+bd.h),P(bd.x+bd.w,bd.y+bd.h),c,d],side=[P(bd.x+bd.w,bd.y),P(bd.x+bd.w,bd.y+bd.h),c,bb];
      const warm=ctx.createLinearGradient(d[0]-20,d[1]-20,c[0]+20,c[1]+height);warm.addColorStop(0,shade(color,22));warm.addColorStop(.30,shade(color,7));warm.addColorStop(1,shade(color,-16));
      const cool=ctx.createLinearGradient(bb[0],bb[1]-5,c[0],c[1]+height);cool.addColorStop(0,blend(shade(color,-20),'#374c4a',.11));cool.addColorStop(1,blend(shade(color,-36),'#324744',.18));
      poly(front,warm);poly(side,cool);poly([a,bb,c,d],top);grain(front,bd.x*173+bd.y*43);grain(side,bd.x*97+bd.y*311);
      // A fine bright arris is the shared upper-left key light on every mass.
      line([P(bd.x,bd.y+bd.h,0),d],shade(color,25),.8);
    }
    function arch(bd,u,v,uw,vh,color,pointed=false,side=false) {
      const pt = (a,q) => side ? P(bd.x+bd.w,bd.y+a,q) : P(bd.x+a,bd.y+bd.h,q);
      const p0=pt(u,v),p1=pt(u+uw,v),p2=pt(u+uw,v+vh*.55),top=pt(u+uw/2,v+vh),p3=pt(u,v+vh*.55);
      ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p1);ctx.lineTo(...p2);
      if(pointed){ctx.quadraticCurveTo(...pt(u+uw*.9,v+vh*.84),...top);ctx.quadraticCurveTo(...pt(u+uw*.1,v+vh*.84),...p3);}
      else {ctx.bezierCurveTo(...pt(u+uw,v+vh*.90),...pt(u+uw*.75,v+vh),...top);ctx.bezierCurveTo(...pt(u+uw*.25,v+vh),...pt(u,v+vh*.90),...p3);}
      ctx.closePath();ctx.fill();
    }
    function prism(xx,yy,ww,hh,base,height,color,top=trim) {
      const a=P(xx,yy,base+height),bb=P(xx+ww,yy,base+height),c=P(xx+ww,yy+hh,base+height),d=P(xx,yy+hh,base+height);
      poly([P(xx,yy+hh,base),P(xx+ww,yy+hh,base),c,d],color);
      poly([P(xx+ww,yy,base),P(xx+ww,yy+hh,base),c,bb],shade(color,-19));
      poly([a,bb,c,d],top);return {a,b:bb,c,d};
    }
    function cornice(bd, height, color=trim) {
      for(const [depth,hh,cc]of[[.035,height-4,shade(color,-24)],[.075,height-1,color],[.11,height+1,shade(color,10)]]){
        const a=P(bd.x-depth,bd.y+bd.h+depth,hh),c=P(bd.x+bd.w+depth,bd.y+bd.h+depth,hh),d=P(bd.x+bd.w+depth,bd.y-depth,hh);
        line([a,c,d],cc,2.1);
      }
      if(bd.w>3.8)for(let u=.25;u<bd.w;u+=.4){faceRect(bd,u,height-9,.085,4,shade(color,-8));}
    }
    function windows(bd,height,rows=3,round=false) {
      const n=Math.max(bd.w<2?2:4,Math.floor(bd.w*1.3));
      for(let r=0;r<rows;r++)for(let i=0;i<n;i++){
        const u=(i+.4)*bd.w/n, ww=bd.w/n*.43, v=height-15-r*19;
        if(v<7)continue;
        // The surround projects, the jamb catches light, and glass sits in shadow.
        faceRect(bd,u-.075,v-2.2,ww+.17,16.2,'#23362b80');
        faceRect(bd,u-.065,v-1.5,ww+.13,15.4,shade(trim,-9));
        faceRect(bd,u-.025,v-.5,ww+.05,13.4,'#1b302f');
        const glass=ctx.createLinearGradient(...P(bd.x+u,bd.y+bd.h,v+12),...P(bd.x+u,bd.y+bd.h,v));glass.addColorStop(0,'#172e2c');glass.addColorStop(.44,noise(i+bd.x,r+bd.y)>.86?'#b4a773':'#486966');glass.addColorStop(1,'#293f38');
        if(round)arch(bd,u,v,ww,12,glass,/endTowers|gatewayTower/.test(style));else faceRect(bd,u,v,ww,12,glass);
        faceRect(bd,u,v,ww*.13,11,'#152d2e90');
        faceRect(bd,u+ww*.15,v+7,ww*.70,2.4,'#c7d2b938');
        line([P(bd.x+u+ww/2,bd.y+bd.h,v),P(bd.x+u+ww/2,bd.y+bd.h,v+11)],'#bac4b3',.65);
        line([P(bd.x+u,bd.y+bd.h,v+5),P(bd.x+u+ww,bd.y+bd.h,v+5)],'#9fac9d',.65);
        prism(bd.x+u-.08,bd.y+bd.h-.015,ww+.16,.115,v-2.5,2,shade(trim,-13),shade(trim,17));
        if(!round)line([P(bd.x+u-.07,bd.y+bd.h, v+13),P(bd.x+u+ww+.07,bd.y+bd.h,v+13)],shade(trim,12),1.25);
      }
      for(let r=0;r<rows;r++)for(let j=.5;j<bd.h-.2;j+=.8){const v=height-15-r*19;if(v<7)continue;faceRect(bd,j-.035,v-1,.33,14,shade(trim,-31),true);faceRect(bd,j,v,.26,12,'#344c49',true);faceRect(bd,j+.11,v,.025,11,'#9ba99b',true);faceRect(bd,j,v+5,.26,.7,'#829789',true);}
    }
    function masonry(bd,height,brick=false) {
      const spacing=brick?4.2:7.2, bw=brick?.26:.53;
      // Stable per-block variation supplies weathered brick/stone rather than a flat fill.
      for(let row=0;row<Math.floor(height/spacing);row++){
        const v=row*spacing;
        for(let u=-(row%2)*bw*.5;u<bd.w;u+=bw){const a=Math.max(0,u),width=Math.min(bw-.020,bd.w-a);if(width<=0)continue;const r=noise(a+bd.x,row+bd.y);faceRect(bd,a,v+.35,width,spacing-.6,r>.73?'#f2d5a71e':r<.23?'#1e3a331e':'#b7ae8d04');if(!brick&&r>.78)line([P(bd.x+a,bd.y+bd.h,v+spacing-.4),P(bd.x+a+width,bd.y+bd.h,v+spacing-.4)],'#efe1bd42',.5);}
        for(let u=-(row%2)*bw*.5;u<bd.h;u+=bw){const a=Math.max(0,u),width=Math.min(bw-.025,bd.h-a);if(width>0)faceRect(bd,a,v+.4,width,spacing-.7,noise(a+bd.y,row)<.5?'#35483d12':'#eee2c109',true);}
        line([P(bd.x,bd.y+bd.h,v),P(bd.x+bd.w,bd.y+bd.h,v),P(bd.x+bd.w,bd.y,v)],'#e0d8ba1e',.6);
      }
      // Uneven rain streaks beneath the cornice, without obscuring openings.
      for(let u=.25;u<bd.w;u+=.57){const r=noise(u+bd.x,bd.y);faceRect(bd,u,height-9-r*15,.025,5+r*10,'#31463c0d');}
      // Dressed corners and a substantial stone plinth anchor the mass.
      for(let v=0;v<height-5;v+=10){for(const u of[0,Math.max(0,bd.w-.19)])faceRect(bd,u,v,.19,8.5,'#e7ddbc29');faceRect(bd,Math.max(0,bd.h-.19),v,.19,8.5,'#e7ddbc18',true);}
      faceRect(bd,0,0,bd.w,5,shade(wall,-19));faceRect(bd,0,0,bd.h,5,shade(wall,-34),true);
      line([P(bd.x,bd.y+bd.h,6),P(bd.x+bd.w,bd.y+bd.h,6),P(bd.x+bd.w,bd.y,6)],shade(wall,19),1.3);
      for(let u=.25;u<bd.w;u+=.37){const v=4+noise(u+bd.x,bd.y)*7;faceRect(bd,u,1,.025,v,'#36513726');}
    }
    function pitched(bd,height,rise=22,color=roof) {
      const a=P(bd.x-.09,bd.y-.09,height),bb=P(bd.x+bd.w+.09,bd.y-.09,height),c=P(bd.x+bd.w+.09,bd.y+bd.h+.09,height),d=P(bd.x-.09,bd.y+bd.h+.09,height);
      const r1=P(bd.x+.2,bd.y+bd.h/2,height+rise),r2=P(bd.x+bd.w-.2,bd.y+bd.h/2,height+rise);
      const frontGrad=ctx.createLinearGradient(...r1,...c);frontGrad.addColorStop(0,shade(color,26));frontGrad.addColorStop(.6,color);frontGrad.addColorStop(1,shade(color,-20));
      poly([a,bb,r2,r1],shade(color,19),'#304438');poly([bb,c,r2],shade(color,-30),'#293d33');poly([d,c,r2,r1],frontGrad,'#293d33');
      const plane=[d,c,r2,r1],slope=Math.hypot(r1[0]-d[0],r1[1]-d[1]),courses=Math.max(7,Math.ceil(slope/3.9)),cols=Math.max(8,Math.ceil(Math.hypot(c[0]-d[0],c[1]-d[1])/5.8));
      // Small staggered slates follow the roof plane; no oversized checker patches.
      for(let j=0;j<courses;j++){
        const t=j/courses,nt=(j+1)/courses,L=mix(d,r1,t),R=mix(c,r2,t),NL=mix(d,r1,nt),NR=mix(c,r2,nt);
        for(let i=-1;i<cols;i++){
          const start=Math.max(0,(i+(j%2)*.5)/cols),end=Math.min(1,(i+1+(j%2)*.5)/cols);if(end<=start)continue;
          const tone=noise(i+bd.x*13,j+bd.y*7),A=mix(L,R,start),B=mix(L,R,end),C=mix(NL,NR,end),D=mix(NL,NR,start);
          poly([A,B,C,D],tone>.75?'#e6d0a51f':tone<.24?'#112e2929':'#a0a98c05');
          line([A,B],tone>.5?'#d0d6bd45':'#1e302e75',.55);line([B,C],'#233b344a',.45);
        }
      }
      grain(plane,bd.x*201+bd.y*71,'roof');grain([a,bb,r2,r1],bd.x*181+bd.y*91,'roof');
      for(let j=1;j<courses;j++){const t=j/courses,L=mix(a,r1,t),R=mix(bb,r2,t);line([L,R],'#263d3450',.55);for(let i=1;i<cols;i++){const u=(i+(j%2)*.5)/cols,A=mix(L,R,u),B=mix(mix(a,r1,(j+1)/courses),mix(bb,r2,(j+1)/courses),u);line([A,B],'#d6d4b32b',.5);}}
      line([d,c],shade(color,-28),3);line([d,c],shade(color,8),.7);line([c,bb],shade(color,-39),2.5);
      const ridgeCount=Math.max(4,Math.ceil(Math.hypot(r2[0]-r1[0],r2[1]-r1[1])/7));
      for(let i=0;i<ridgeCount;i++){const A=mix(r1,r2,i/ridgeCount),B=mix(r1,r2,(i+1)/ridgeCount);line([[A[0],A[1]-1],[B[0],B[1]-1]],shade(color,34),3);line([[A[0],A[1]-1.5],[B[0],B[1]-1.5]],'#efe2bd4a',.7);ctx.fillStyle=shade(color,-12);ctx.fillRect(B[0]-.45,B[1]-2.5,.7,3);}
    }
    function body(bd,height=z,rows=3,pitch=true,color=wall) {
      // Foundations must sit behind the volume; drawing their full top afterwards
      // would paint over the lower facade in this projected view.
      prism(bd.x-.07,bd.y-.07,bd.w+.14,bd.h+.14,-2.4,5.5,blend(color,'#7e8271',.38),shade(trim,-9));
      litMass(bd,height,color,roof);
      const grad=ctx.createLinearGradient(0,P(bd.x,bd.y,height)[1],0,P(bd.x+bd.w,bd.y+bd.h,0)[1]);grad.addColorStop(0,'#f3d7a60c');grad.addColorStop(.6,'#f3d7a600');grad.addColorStop(1,'#1b302b1b');
      poly([P(bd.x,bd.y+bd.h),P(bd.x+bd.w,bd.y+bd.h),P(bd.x+bd.w,bd.y+bd.h,height),P(bd.x,bd.y+bd.h,height)],grad);
      masonry(bd,height,/twintower|arcade|urban|roundtower/.test(style));windows(bd,height,rows,/endTowers|gatewayTower|twintower/.test(style));
      faceRect(bd,0,height-8,bd.w,8,'#15342b3b');faceRect(bd,0,height-9,bd.h,9,'#142b294f',true);cornice(bd,height-3);
      for(let floor=1;floor<rows;floor++)line([P(bd.x,bd.y+bd.h,height-20*floor-1),P(bd.x+bd.w,bd.y+bd.h,height-20*floor-1),P(bd.x+bd.w,bd.y,height-20*floor-1)],'#d2c6a936',1.2);
      // A broad stepped plinth and dark contact joint ground the wall in terrain.
      line([P(bd.x,bd.y+bd.h,0),P(bd.x+bd.w,bd.y+bd.h,0),P(bd.x+bd.w,bd.y,0)],'#20382c60',1.8);
      if(pitch)pitched(bd,height,style==='endTowers'?26:bd.type&&['archive','library','office'].includes(bd.type)?18+noise(bd.x*17,bd.y*13)*6:18);else{
        prism(bd.x-.05,bd.y-.05,bd.w+.1,bd.h+.1,height-1,4,shade(color,12),shade(trim,-10));
        const inset=.17,plane=[P(bd.x+inset,bd.y+inset,height+2),P(bd.x+bd.w-inset,bd.y+inset,height+2),P(bd.x+bd.w-inset,bd.y+bd.h-inset,height+2),P(bd.x+inset,bd.y+bd.h-inset,height+2)];poly(plane,shade(roof,-20));grain(plane,bd.x*211+bd.y*41,'roof');cornice(bd,height+3);
        if(bd.w>3.5&&bd.h>1.5)prism(bd.x+bd.w*.78,bd.y+bd.h*.30,.35,.45,height+2,4,shade(roof,3),shade(roof,21));
      }
    }
    function stair(bd,start,span,steps=4) {
      for(let i=steps-1;i>=0;i--){const dep=.11*(i+1),base=-i*1.5;prism(bd.x+start,bd.y+bd.h,span,dep,base,1.7,shade(wall,-4-i*3),shade(trim,-i*3));}
      const yy=bd.y+bd.h+.11*steps;
      for(const xx of[bd.x+start+.07,bd.x+start+span-.07]){line([P(xx,bd.y+bd.h,13),P(xx,yy,6)],'#686f5b',1.2);for(let k=0;k<=steps;k++){const yq=bd.y+bd.h+k*.11;line([P(xx,yq,0-k*1.5),P(xx,yq,13-k*1.5)],'#6f745e',.9);}}
    }
    function lantern(bd,u,v) {
      const p=P(bd.x+u,bd.y+bd.h+.04,v);line([[p[0],p[1]+6],[p[0]-2,p[1]-3],[p[0]-6,p[1]-4]],'#4c5143',1.2);
      poly([[p[0]-9,p[1]-4],[p[0]-3,p[1]-4],[p[0]-4,p[1]+5],[p[0]-8,p[1]+5]],'#3c4b41');poly([[p[0]-8,p[1]-3],[p[0]-5,p[1]-3],[p[0]-5,p[1]+3],[p[0]-7,p[1]+3]],'#d0c18b');line([[p[0]-9,p[1]-5],[p[0]-6,p[1]-8],[p[0]-3,p[1]-5]],'#394b3d',1);
    }
    function door(bd,u,hh=25,ww=.5,pointed=false){
      arch(bd,u-ww/2-.11,0,ww+.22,hh+4,trim,pointed);arch(bd,u-ww/2-.035,0,ww+.07,hh+1,shade(wall,-34),pointed);arch(bd,u-ww/2,0,ww,hh,'#4a4938',pointed);
      faceRect(bd,u-ww*.40,3,ww*.32,hh*.54,'#706046');faceRect(bd,u+ww*.07,3,ww*.32,hh*.54,'#63563f');faceRect(bd,u-.013,0,.026,hh*.81,'#2e392f');
      const p=P(bd.x+u+.07,bd.y+bd.h,11);ctx.fillStyle='#c1a365';ctx.fillRect(p[0],p[1],1.4,3);stair(bd,u-ww/2-.24,ww+.48,3);lantern(bd,u-ww/2-.25,23);
    }
    function classical(height=z,rows=3) {
      const core={x,y,w,h:h*.78};body(core,height,rows,false);
      // Projecting wings create real court depth instead of a single flat block.
      for(const xx of[x,x+w*.82]){const wing={x:xx,y:y+h*.34,w:w*.18,h:h*.66};body(wing,height-7,rows,false);}
      return core;
    }
    function dormers(bd,height,count=5) {
      for(let i=0;i<count;i++){const u=.7+(bd.w-1.4)*i/Math.max(1,count-1),yy=bd.y+bd.h*.81,dw=.47;
        const d={x:bd.x+u-dw/2,y:yy-.35,w:dw,h:.48};prism(d.x,d.y,d.w,d.h,height+2,12,shade(wall,11),roof);
        faceRect(d,.08,height+4,.31,9,trim);faceRect(d,.115,height+5,.24,7.6,dark);faceRect(d,.225,height+5,.018,7.5,'#bcb995');
        pitched(d,height+14,6);line([P(d.x+.08,d.y+d.h,height+4),P(d.x+.39,d.y+d.h,height+4)],shade(trim,12),1);
      }
    }
    function chimneys(bd,height,count=2){
      for(let i=0;i<count;i++){const xx=bd.x+bd.w*(count===1?.76:.20+i*.60),yy=bd.y+bd.h*.38,cw=.22,ch=.31,base=height+8;
        prism(xx,yy,cw,ch,base,17,shade(wall,-17),trim);for(let v=base+3;v<base+16;v+=3)line([P(xx,yy+ch,v),P(xx+cw,yy+ch,v),P(xx+cw,yy,v)],'#e2d1a336',.55);
        prism(xx-.035,yy-.035,cw+.07,ch+.07,base+16,3,shade(trim,-20),shade(trim,5));const p=P(xx+cw*.52,yy+ch*.52,base+19);ctx.fillStyle='#263a30';ctx.beginPath();ctx.ellipse(p[0],p[1],2.6,1.1,0,0,Math.PI*2);ctx.fill();
      }
    }
    function crossGable(bd,height){
      const cx=bd.x+bd.w/2,fy=bd.y+bd.h+.04,span=Math.min(.85,bd.w*.18),back=fy-Math.min(1.5,bd.h*.53),rise=19;
      const L=P(cx-span,fy,height),R=P(cx+span,fy,height),T=P(cx,fy,height+rise),LB=P(cx-span,back,height),RB=P(cx+span,back,height),TB=P(cx,back,height+rise);
      poly([L,T,TB,LB],shade(roof,14),'#334538');poly([T,R,RB,TB],shade(roof,-18),'#2a3d32');
      poly([L,R,T],shade(wall,13),shade(trim,-5));line([L,T,R],trim,1.3);const front={x:cx-span,y:fy-.1,w:span*2,h:.1};arch(front,span-.14,height+2,.28,10,dark,/gothic/.test(style));line([T,TB],shade(roof,27),1.6);
    }
    function columns(bd,height=55,count=8,start=.6,span=bd.w-1.2){
      const portico={x:bd.x+start-.25,y:bd.y+bd.h-.64,w:span+.50,h:.95};
      // Return walls, porch soffit, and front entablature give the colonnade depth.
      poly([P(portico.x,portico.y+portico.h,8),P(portico.x+portico.w,portico.y+portico.h,8),P(portico.x+portico.w,portico.y,8),P(portico.x,portico.y,8)],shade(trim,-24));
      prism(portico.x,portico.y,portico.w,portico.h,height,6,shade(trim,-5),shade(trim,10));
      faceRect(portico,.08,9,span+.34,height-10,'#35473b50');
      for(let i=0;i<count;i++){
        const u=.25+span*i/(count-1), p=P(portico.x+u,portico.y+portico.h,0);
        const cg=ctx.createLinearGradient(p[0]-4,0,p[0]+4,0);cg.addColorStop(0,shade(trim,-20));cg.addColorStop(.3,shade(trim,8));cg.addColorStop(1,shade(trim,-32));
        poly([[p[0]-3.4,p[1]-8],[p[0]+3.4,p[1]-8],[p[0]+2.7,p[1]-height],[p[0]-2.7,p[1]-height]],cg);
        for(const a of[-1.5,.1,1.6])line([[p[0]+a,p[1]-10],[p[0]+a*.75,p[1]-height+3]],'#7f887627',.55);
        prism(portico.x+u-.13,portico.y+portico.h-.10,.26,.20,height-2,4,shade(trim,-5),shade(trim,15));
        prism(portico.x+u-.14,portico.y+portico.h-.10,.28,.20,5,3,shade(trim,-10),trim);
      }
      const left=P(portico.x-.06,portico.y+portico.h,height+7),right=P(portico.x+portico.w+.06,portico.y+portico.h,height+7),top=P(portico.x+portico.w/2,portico.y+portico.h,height+29);
      poly([left,right,top],trim,shade(wall,-20));line([[left[0]+7,left[1]-2],[top[0],top[1]+5],[right[0]-7,right[1]-2]],shade(wall,-2),1.25);
      const backTop=P(portico.x+portico.w/2,portico.y,height+29),backLeft=P(portico.x,portico.y,height+7),backRight=P(portico.x+portico.w,portico.y,height+7);
      poly([top,right,backRight,backTop],shade(trim,-23));poly([left,top,backTop,backLeft],shade(trim,4));
      // Tympanum relief is abstract, avoiding invented university insignia.
      const q=mix(mix(left,right,.5),top,.35);ctx.fillStyle=shade(wall,-9);ctx.beginPath();ctx.ellipse(q[0],q[1],5,4,0,0,Math.PI*2);ctx.fill();
      stair(portico,0,portico.w,6);
    }
    function drum(cx,cy,base,radius,height,color=trim,open=false) {
      const p=P(cx,cy,base),top=p[1]-height;
      const gradient=ctx.createLinearGradient(p[0]-radius,0,p[0]+radius,0);gradient.addColorStop(0,shade(color,-18));gradient.addColorStop(.35,shade(color,18));gradient.addColorStop(1,shade(color,-30));
      ctx.fillStyle=gradient;ctx.beginPath();ctx.ellipse(p[0],p[1],radius,radius*.32,0,0,Math.PI);ctx.lineTo(p[0]-radius,top);ctx.ellipse(p[0],top,radius,radius*.32,0,Math.PI,Math.PI*2);ctx.closePath();ctx.fill();
      ctx.fillStyle=shade(color,12);ctx.beginPath();ctx.ellipse(p[0],top,radius,radius*.32,0,0,Math.PI*2);ctx.fill();
      if(open)for(let i=-2;i<=2;i++){const q=p[0]+i*radius*.34,ww=radius*.20;ctx.fillStyle='#42564b';ctx.beginPath();ctx.roundRect(q-ww/2,top+4+Math.abs(i)*1.4,ww,Math.max(8,height-8),[ww/2,ww/2,0,0]);ctx.fill();}
      return {x:p[0],y:top};
    }
    function dome(cx,cy,base,radius,rise,color,drumHeight=20,gold=false) {
      const p=drum(cx,cy,base,radius*.84,drumHeight,gold?'#bfa76a':trim,false),yy=p.y;
      const grad=ctx.createLinearGradient(p.x-radius,0,p.x+radius,0);grad.addColorStop(0,shade(color,-20));grad.addColorStop(.35,shade(color,38));grad.addColorStop(.8,color);grad.addColorStop(1,shade(color,-35));
      ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(p.x-radius,yy);ctx.bezierCurveTo(p.x-radius,yy-rise*.65,p.x-radius*.45,yy-rise,p.x,yy-rise);ctx.bezierCurveTo(p.x+radius*.45,yy-rise,p.x+radius,yy-rise*.65,p.x+radius,yy);ctx.quadraticCurveTo(p.x,yy+radius*.22,p.x-radius,yy);ctx.fill();
      for(let i=-2;i<=2;i++){const t=i/3;ctx.strokeStyle=gold?'#f6df8c70':'#e5e6cf70';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(p.x,yy-rise);ctx.quadraticCurveTo(p.x+radius*t*1.1,yy-rise*.5,p.x+radius*t,yy+5);ctx.stroke();}
      line([[p.x-radius,yy],[p.x,yy+radius*.12],[p.x+radius,yy]],gold?'#af883a':shade(color,-20),2);
      return {x:p.x,y:yy-rise};
    }
    function clock(xx,yy,r=7) {ctx.fillStyle='#e6dcc0';ctx.beginPath();ctx.arc(xx,yy,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#4e574b';ctx.lineWidth=1;ctx.stroke();line([[xx,yy-r*.6],[xx,yy],[xx+r*.5,yy+r*.12]],'#465147',1);}
    function tower(tx,ty,tw,th,height,cap='hip',color=wall){const bd={x:tx,y:ty,w:tw,h:th};litMass(bd,height,color,roof);masonry(bd,height);windows(bd,height,Math.max(2,Math.floor(height/25)),true);faceRect(bd,0,height-8,tw,8,'#16352b47');faceRect(bd,0,height-9,th,9,'#102d2b55',true);cornice(bd,height-2);if(cap==='hip')pitched(bd,height,14);return bd;}
    // Grounded building shadow, contained near the reconstructed footprint.
    const aa=P(x,y),bb=P(x+w,y),cc=P(x+w,y+h),dd=P(x,y+h);
    poly([[dd[0]-9,dd[1]],[cc[0]+34,cc[1]+12],[bb[0]+40,bb[1]+10],[aa[0]+8,aa[1]]],'#263a2f29');
    ctx.save();
    if (['office', 'archive', 'library', 'rowhouse'].includes(b.type)) {
      const rows=Math.max(1,Math.floor(z/22));
      if(b.type==='rowhouse'){
        const count=Math.max(1,Math.round(w/1.6)),span=w/count;
        for(let i=0;i<count;i++){
          const house={x:x+i*span,y,w:span,h};
          body(house,z+(i%3===1?2:0),Math.max(2,rows),true,shade(wall,Math.round(noise(i+x,y)*16)-8));
          // Narrow party-wall strips and individual roofs keep the terrace legible.
          faceRect(house,0,0,.07,z+2,shade(wall,-20));
          door(house,span*.68,23,Math.min(.32,span*.23));
          const chimney=prism(house.x+span*.20,y+h*.42,.18,.24,z+10,14,shade(wall,-14),trim);
          prism(house.x+span*.18,y+h*.42-.025,.22,.29,z+23,3,shade(wall,-23),shade(trim,-18));
        }
      }else{
        const flat=style==='urban';
        body(b,z,rows,!flat);
        if(!flat){
          if(b.type==='library'){crossGable(b,z);dormers(b,z,Math.max(2,Math.floor(w/2)));chimneys(b,z,1);}
          else if(b.type==='archive'){dormers(b,z,Math.max(2,Math.floor(w/2)));chimneys(b,z,noise(x,y)>.5?1:2);}
          else if(style==='gothic'){crossGable(b,z);chimneys(b,z,1);}
          else{dormers(b,z,2);chimneys(b,z,1);}
        }
        // A compact entrance pavilion is contained inside the actual footprint;
        // its front door stays on the walkable facade edge (office grid 20,8).
        const pw=b.type==='library'?1.35:1.12,mid=w/2;
        const porch={x:x+mid-pw/2,y:y+h-.56,w:pw,h:.56};
        const ph=b.type==='library'?32:29;
        litMass(porch,ph,shade(wall,11),roof);
        masonry(porch,ph,/urban|arcade/.test(style));cornice(porch,ph-1);
        if(flat){prism(porch.x-.035,porch.y-.035,pw+.07,.63,ph,3,trim,shade(trim,-10));}
        else pitched(porch,ph,b.type==='archive'?10:8);
        door(porch,pw/2,25,.56,b.type==='library'&&style==='gothic');
        for(const u of[.04,pw-.12]){prism(porch.x+u,porch.y+porch.h-.07,.08,.10,0,ph-2,shade(trim,-13),trim);}
        // Brass identification plate: a visual marker, with no fabricated room text.
        faceRect(porch,pw*.77,14,.13,4,'#b49a5e');faceRect(porch,pw*.78,14.7,.11,.8,'#e4d3a0');
        if(b.type==='library'){
          const portal={x,y,w,h};
          for(const u of[.45,w-.85]){arch(portal,u-.035,12,.47,23,trim,false);arch(portal,u,13,.40,20,dark,false);faceRect(portal,u+.18,13,.026,18,'#b4baa2');}
        }
        // A return bay changes the roof and facade depth without a second landmark.
        if(b.type==='office'&&w>=5){
          const wing={x:x+w-.95,y:y+.45,w:.95,h:h*.48};
          prism(wing.x,wing.y,wing.w,wing.h,z-9,9,shade(wall,-9),flat?shade(roof,5):roof);
          if(!flat)pitched(wing,z,12);
        }
      }
      ctx.restore();return true;
    }
    switch(style){
      case 'gates': {
        for(const [xx,ww]of[[x,w*.29],[x+w*.71,w*.29]]){const bd={x:xx,y:y+h-.8,w:ww,h:.8};litMass(bd,19,wall,trim);masonry(bd,19);cornice(bd,19);}
        for(const tx of [x+w*.24,x+w*.68]){
          const bd={x:tx,y:y+h-1.25,w:1.1,h:1.25};litMass(bd,59,wall,trim);masonry(bd,59);cornice(bd,57);
          faceRect(bd,.17,20,.76,22,shade(wall,-11));faceRect(bd,.22,22,.66,18,shade(wall,4));faceRect(bd,.24,35,.62,1,'#ded5b63a');
          for(const q of[0,.89])prism(tx+q,bd.y+1.04,.21,.21,0,63,trim,shade(trim,3));
          const p=P(tx+.55,y+h-.6,62);poly([[p[0]-17,p[1]+6],[p[0],p[1]-7],[p[0]+17,p[1]+6],[p[0],p[1]+14]],shade(wall,30));
          line([P(tx-.05,bd.y+bd.h,9),P(tx+1.15,bd.y+bd.h,9)],shade(trim,12),2);
        }
        // An open central gateway, not a solid building face.
        line([P(x+w*.40,y+h,0),P(x+w*.60,y+h,0)],'#b18a5f',2);break;
      }
      case 'endTowers': {
        body(b,z,3,true);dormers(b,z,4);for(const [tx,hh]of[[x+.15,z+32],[x+w-1.75,z+44]]){const t=tower(tx,y+h-1.8,1.6,1.8,hh,'hip');cornice(t,hh-16);}
        const u=w*.5;poly([P(x+u-.85,y+h,z),P(x+u+.85,y+h,z),P(x+u,y+h,z+28)],shade(wall,10),trim);arch(b,u-.16,z+2,.32,11,dark,true);door(b,w/2,31,.68,true);break;
      }
      case 'twintower': {
        body(b,z-12,2,true);for(let u=.4;u<w-.3;u+=.72){arch(b,u-.055,1,.59,32,shade(trim,-6));arch(b,u,1,.48,29,dark);prism(x+u-.12,y+h-.06,.12,.12,0,28,shade(wall,16),trim);}
        for(const [tx,hh]of[[x+.25,z+49],[x+w-2,z+43]]){const t=tower(tx,y+h-2.1,1.7,2.0,hh,'hip');for(const band of[hh-24,hh-42,hh-65]){faceRect(t,0,band,t.w,2.1,trim);faceRect(t,0,band,t.h,2.1,shade(trim,-18),true);}for(let u=.22;u<1.5;u+=.52){arch(t,u-.045,hh-21,.39,18,trim);arch(t,u,hh-20,.30,15,dark);}cornice(t,hh-2);}
        break;
      }
      case 'columns': {classical(z,3);columns(b,z-12,8,w*.20,w*.60);break;}
      case 'dome': {classical(z-3,3);columns(b,z-17,8,w*.22,w*.56);dome(x+w*.51,y+h*.40,z+6,48,43,'#a5afa2',24);break;}
      case 'lowDome': {classical(z-10,2);columns(b,z-20,8,w*.13,w*.74);dome(x+w*.50,y+h*.35,z-2,58,28,'#929b8f',18);break;}
      case 'goldDome': {
        body(b,z+6,4,true);dormers(b,z+6,6);const raised={x:x+w*.40,y:y+h*.30,w:w*.20,h:h*.70};body(raised,z+15,4,false);const p=dome(x+w*.50,y+h*.40,z+21,38,44,'#ccaa45',27,true);
        ctx.fillStyle='#dfc76b';ctx.beginPath();ctx.ellipse(p.x,p.y-10,3,6,0,0,Math.PI*2);ctx.fill();poly([[p.x,p.y-5],[p.x-5,p.y+3],[p.x+5,p.y+3]],'#c8aa54');line([[p.x,p.y-5],[p.x,p.y+9]],'#d8bc62',3);door(b,w/2,28,.7);break;
      }
      case 'urban': {
        const core={x,y,w,h:h*.83};body(core,z,3,false);for(const xx of[x,x+w*.78]){body({x:xx,y:y+h*.20,w:w*.22,h:h*.8},z-4,3,false);}
        const entry={x:x+w*.40,y:y+h*.54,w:w*.20,h:h*.46};body(entry,z+4,3,false);for(let u=.15;u<entry.w-.1;u+=.38){faceRect(entry,u,30,.16,z-31,shade(wall,-20));}door(entry,entry.w/2,29,.55);break;
      }
      case 'arcade': {
        const left={x,y,w:w*.27,h},right={x:x+w*.73,y,w:w*.27,h};body(left,35,1,true);body(right,35,1,true);
        const church={x:x+w*.31,y:y+.35,w:w*.38,h:h*.65};body(church,78,2,true);const fy=church.y+church.h;
        poly([P(church.x,fy,78),P(church.x+church.w,fy,78),P(church.x+church.w/2,fy,111)],shade(wall,18),trim);
        // Warm geometric mosaic, original decoration rather than copied iconography.
        for(let i=0;i<7;i++)for(let j=0;j<4;j++){const u=church.w*.15+i*church.w*.10;faceRect(church,u,52+j*6,church.w*.08,5,['#a38150','#8a9c83','#c7a36b','#9b704e'][(i+j)%4]);}
        const rp=P(church.x+church.w/2,fy,88);ctx.fillStyle='#cfbd8a';ctx.beginPath();ctx.arc(rp[0],rp[1],7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#617e73';ctx.beginPath();ctx.arc(rp[0],rp[1],4.5,0,Math.PI*2);ctx.fill();
        for(let i=0;i<3;i++){const u=church.w*(.14+i*.26);arch(church,u-.055,0,church.w*.19+.11,34,trim);arch(church,u,0,church.w*.19,31,dark);}
        const front={x,y:y+h-1,w,h:1};litMass(front,32,wall,roof);masonry(front,32);cornice(front,31);pitched(front,32,10);for(let u=.2;u<w-.2;u+=.62){arch(front,u-.045,0,.51,28,shade(trim,-7));arch(front,u,0,.42,25,dark);prism(x+u-.12,y+h-.07,.11,.14,0,26,trim,shade(trim,10));}break;
      }
      case 'clocktower': {
        classical(z-8,3);columns(b,z-18,8,w*.20,w*.60);const t=tower(x+w*.45,y+h*.30,1.35,1.35,z+42,'none');const cp=P(t.x+.6,t.y+t.h,z+24);clock(cp[0],cp[1],8);
        const pp=drum(t.x+.67,t.y+.67,z+43,13,22,trim,true);ctx.fillStyle=roof;ctx.beginPath();ctx.ellipse(pp.x,pp.y-1,16,7,0,0,Math.PI*2);ctx.fill();line([[pp.x,pp.y-6],[pp.x,pp.y-15]],trim,2);break;
      }
      case 'gatewayTower': {
        body(b,z-4,3,true);for(const xx of[x+.12,x+w-1.62]){const wing={x:xx,y:y+h-1.8,w:1.5,h:1.8};body(wing,z+2,3,true);poly([P(wing.x,wing.y+wing.h,z+2),P(wing.x+wing.w,wing.y+wing.h,z+2),P(wing.x+wing.w/2,wing.y+wing.h,z+24)],shade(wall,8),trim);}
        const t=tower(x+w*.40,y+h-2.1,w*.20,2.1,z+57,'none');arch(t,t.w*.25-.07,0,t.w*.5+.14,53,trim,true);arch(t,t.w*.25,0,t.w*.5,50,'#293f35',true);cornice(t,z+55);cornice(t,z+48);
        // Brookings' restrained corner turrets are square masonry, not spires.
        for(const [tx,ty]of[[t.x,t.y],[t.x+t.w-.22,t.y],[t.x,t.y+t.h-.22],[t.x+t.w-.22,t.y+t.h-.22]])box(tx,ty,.22,.22,z+63,trim,shade(wall,7));
        for(const u of[.07,t.w-.20])prism(t.x+u,t.y+t.h-.10,.13,.18,0,z+52,shade(trim,-10),trim);
        faceRect(t,t.w*.33,z+14,t.w*.34,25,trim);arch(t,t.w*.38,z+17,t.w*.24,20,dark,true);stair(t,t.w*.22,t.w*.56,5);break;
      }
      case 'roundtower': {
        body(b,z-8,3,true);const bay={x:x+w*.70,y:y+h*.45,w:w*.30,h:h*.55};body(bay,z-14,2,true);const cx=x+w*.60,cy=y+h*.43,p=drum(cx,cy,z+3,29,54,wall,false);drum(cx,cy,z+58,31,27,trim,true);const cap=P(cx,cy,z+86);ctx.fillStyle='#617b6c';ctx.beginPath();ctx.ellipse(cap[0],cap[1]-2,34,13,0,Math.PI,Math.PI*2);ctx.lineTo(cap[0]+34,cap[1]+3);ctx.quadraticCurveTo(cap[0],cap[1]+16,cap[0]-34,cap[1]+3);ctx.closePath();ctx.fill();line([[cap[0]-33,cap[1]+3],[cap[0],cap[1]+12],[cap[0]+33,cap[1]+3]],'#e0c99c',2);door(b,w*.38,30,.65);break;
      }
      case 'cupola': {
        body(b,z-4,3,true);door(b,w*.5,27,.62);const t=tower(x+w*.47,y+h*.38,.75,.75,z+29,'none',trim),cp=P(t.x+.35,t.y+t.h,z+17);clock(cp[0],cp[1],5.5);const p=drum(t.x+.38,t.y+.38,z+30,11,16,trim,true);dome(t.x+.38,t.y+.38,z+46,14,10,'#739b90',0);line([[p.x,p.y-20],[p.x,p.y-29]],'#766444',1.2);line([[p.x-5,p.y-25],[p.x+6,p.y-25]],'#766444',1);
        // Low ivy clusters leave windows, doors and the selected unit readable.
        for(let i=0;i<8;i++){const p=P(x+.25+i*w/8,y+h,4);ctx.fillStyle='#5f765650';ctx.beginPath();ctx.ellipse(p[0],p[1]-4,7,8,0,0,Math.PI*2);ctx.fill();}break;
      }
      default: ctx.restore();return false;
    }
    ctx.restore();return true;
  }
  window.CampusArchitecture = { draw };
})();
