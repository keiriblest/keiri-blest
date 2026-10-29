(()=>{
window._cdPlayerActive=true;
const $=id=>document.getElementById(id),detail=$('detail'),dt=$('dt'),pv=$('pv'),back=$('back'),stage=$('stage'),au=$('au');
if(!detail||!pv||!stage)return;
const dw=detail.querySelector('.dwrap'),RAF=window.requestAnimationFrame,raf0=f=>RAF.call(window,f),norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,''),fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');

let held=null;
function freeze(){if(held)return;held=[];window.requestAnimationFrame=cb=>{held.push(cb);return 0};stage.style.pointerEvents='none'}
function thaw(){if(!held)return;window.requestAnimationFrame=RAF;const h=held;held=null;stage.style.pointerEvents='';h.forEach(cb=>RAF.call(window,cb))}

const cap={scene:null,cam:null,obj:null,lid:null,cd:null,on:false,p:0,tk:0,swx:0,swr:0,wpp:1};
let T3=null;

function pose(){
  const o=cap.obj,c=cap.cam;
  if(!o||!c||!cap.q0||cap.p<=.0001)return;
  cap.qT.setFromAxisAngle(cap.yAx,cap.swr*Math.PI/180);
  o.quaternion.copy(cap.q0).slerp(cap.qT,cap.p);
  o.position.x=cap.o0.x+cap.swx*cap.wpp*cap.p;
  o.position.y=cap.o0.y*(1-cap.p);
  c.position.lerpVectors(cap.c0,cap.cF,cap.p);
  c.lookAt(cap.tg);
}

function restore(){
  const o=cap.obj;
  if(o&&cap.q0){
    o.quaternion.copy(cap.q0);
    o.position.x=cap.o0.x;
    if(cap.cam&&cap.c0)cap.cam.position.copy(cap.c0);
  }
}

import('three').then(m=>{
  T3=m;
  const O=m.Object3D.prototype,U=O.updateMatrixWorld;
  O.updateMatrixWorld=function(f){
    if(this.isScene){
      cap.scene=this;
      if(cap.on)try{pose()}catch(_){}
    }else if(this.isCamera)cap.cam=this;
    return U.call(this,f);
  };
}).catch(()=>{});

function locate(){
  const s=cap.scene;
  if(!s||!cap.cam)return false;
  let tex=null,any=null,lid=null,cd=null;
  s.traverse(o=>{
    if(o.isMesh){
      any=any||o;
      const m=Array.isArray(o.material)?o.material:[o.material];
      if(!tex&&m.some(x=>x&&x.map))tex=o;
    }
    if(o.isGroup && Math.abs(o.position.x + 1.25) < 0.15) lid=o;
    if(o.isGroup && Math.abs(o.position.x) < 0.01 && o.children && o.children.length>=2 && o.children.some(c=>c.geometry && (c.geometry.type==='RingGeometry'||c.geometry.type==='CylinderGeometry'))) cd=o;
  });
  let o=tex||any;
  if(!o)return false;
  while(o.parent&&o.parent!==s)o=o.parent;
  cap.obj=o;
  cap.lid=lid;
  cap.cd=cd;
  return true;
}

function snap(){
  const o=cap.obj,c=cap.cam;
  cap.q0=o.quaternion.clone();
  cap.qT=o.quaternion.clone();
  cap.o0=o.position.clone();
  cap.c0=c.position.clone();
  cap.tg=o.position.clone().set(0,0,0);
  cap.yAx=new o.position.constructor(0,1,0);
  const d0=cap.c0.distanceTo(cap.tg)||5.8;
  let d=null;if(T3&&c.isPerspectiveCamera){
    const q=o.quaternion.clone();
    o.quaternion.identity();
    o.updateMatrixWorld(true);
    const b=new T3.Box3().setFromObject(o),sz=b.getSize(new T3.Vector3());
    o.quaternion.copy(q);
    o.updateMatrixWorld(true);
    const half=Math.max(sz.y/2,sz.x/2/(c.aspect||1)),t=Math.tan(c.fov*Math.PI/360);
    d=half/t/.82+sz.z/2;
  }
  d=Math.min(d0*1.5,Math.max(d0*.55,d||d0));
  cap.cF=cap.tg.clone();
  cap.cF.z+=d;
  cap.wpp=c.isPerspectiveCamera?2*d*Math.tan(c.fov*Math.PI/360)/(stage.getBoundingClientRect().height||440):1;
}

function tween(to,ms){
  const tk=++cap.tk;
  return new Promise(res=>{
    const from=cap.p,t0=performance.now(),st=()=>{
      if(tk!==cap.tk){res();return}
      const k=Math.min(1,(performance.now()-t0)/ms),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
      cap.p=from+(to-from)*e;
      if(k<1)raf0(st);
      else res();
    };
    st();
  });
}

function animateLid(targetAngle,ms){
  return new Promise(res=>{
    if(!cap.lid){res();return;}
    const startAng=cap.lid.rotation.y,t0=performance.now();
    const step=()=>{
      const k=Math.min(1,(performance.now()-t0)/ms);
      const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
      cap.lid.rotation.y=startAng+(targetAngle-startAng)*e;
      if(k<1)raf0(step);
      else res();
    };
    step();
  });
}

const release=()=>{
  if(cap.p<=.001){
    cap.p=0;
    restore();
    cap.on=false;
    stage.style.pointerEvents='';
  }
};

function drive(a,tbl){
  return new Promise(res=>{
    const step=()=>{
      if(a.playState==='finished'||a.playState==='idle'){
        cap.swx=0;cap.swr=0;res();return;
      }
      const k=Math.min(1,(a.currentTime||0)/a.effect.getTiming().duration);
      let i=1;
      while(i<tbl.length-1&&tbl[i][0]<k)i++;
      const A=tbl[i-1],B=tbl[i],u=(k-A[0])/(B[0]-A[0]||1),e=u*u*(3-2*u);
      cap.swx=A[1]+(B[1]-A[1])*e;
      cap.swr=A[2]+(B[2]-A[2])*e;
      raf0(step);
    };
    raf0(step);
  });
}

const SWIN=[[0,0,0],[.12,-16,-12],[.22,-30,-18],[.32,-30,-18],[.45,-10,-6],[.58,18,10],[.72,-6,-9],[.85,8,-3],[1,0,0]];

let DB={};
fetch('letras-sync.json',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(d=>{DB=d||{}}).catch(()=>{});

const find=()=>{
  const t=norm(dt.textContent);
  for(const k in DB){
    const e=DB[k];
    if(e&&e.lines&&e.lines.length&&norm(e.title)===t){
      e.slug=k;
      return e;
    }
  }
  return null;
};

const css=document.createElement('style');
css.textContent=`.dwrap{position:relative}.stage{z-index:2}
.cdf{position:absolute;z-index:1;border-radius:50%;pointer-events:none;will-change:transform,opacity;background-size:cover;background-position:center;-webkit-mask:radial-gradient(circle,transparent 9%,#000 9.6%);mask:radial-gradient(circle,transparent 9%,#000 9.6%);filter:drop-shadow(0 14px 18px rgba(0,0,0,.35))}
.cdf::after{content:'';position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 20deg,rgba(255,255,255,.45),transparent 25%,rgba(255,255,255,.3) 50%,transparent 75%,rgba(255,255,255,.45))}
.cdp{--h:150;--s:90%;--ac:hsl(var(--h) var(--s) 66%);--ac2:hsl(var(--h) var(--s) 42%);--acd:hsl(var(--h) 22% 10%);--acd2:hsl(var(--h) 22% 5%);display:none;flex-direction:column;align-items:center;gap:18px;width:min(560px,100%);margin-top:40px}.cdp.on{display:flex;animation:up .6s both cubic-bezier(.2,.8,.2,1)}
.cdp-dev{position:relative;width:100%;display:grid;grid-template-columns:1fr 112px;align-items:center;gap:20px;padding:46px 26px 24px;border-radius:30px;background:var(--card);border:1px solid var(--line);box-shadow:0 24px 60px rgba(0,0,0,.12),0 2px 12px rgba(0,0,0,.05);transition:box-shadow .6s}
html[data-theme='dark'] .cdp-dev{box-shadow:0 24px 60px rgba(0,0,0,.55)}
.cdp.in .cdp-dev{box-shadow:0 24px 60px rgba(0,0,0,.14),0 0 44px hsl(var(--h) var(--s) 55%/.22)}
.cdp-slot{position:absolute;top:16px;left:26px;right:26px;height:12px;border-radius:10px;background:#050507;box-shadow:inset 0 2px 5px #000;overflow:hidden;transition:box-shadow .3s}
.cdp.ins .cdp-slot{box-shadow:inset 0 2px 5px #000,0 0 22px 4px var(--ac)}
.cdp-slot::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,var(--ac),transparent);transform:translateX(-100%);opacity:0}
.cdp.in .cdp-slot::after{opacity:1;animation:cdscan 2.4s ease-in-out infinite}@keyframes cdscan{to{transform:translateX(100%)}}
.cdp-lcd{display:flex;flex-direction:column;gap:9px;padding:14px 16px;border-radius:16px;background:linear-gradient(var(--acd),var(--acd2));box-shadow:0 0 0 1px hsl(var(--h) var(--s) 60%/.18),inset 0 2px 10px rgba(0,0,0,.5);color:var(--ac);font-family:ui-monospace,Menlo,monospace;min-width:0;transition:background .5s,color .5s}
.cdp-ti{font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cdp-tm{font-size:.82rem;opacity:.85}.cdp-t{font-size:1.6rem;font-weight:600}
.cdp-bar{height:5px;border-radius:5px;background:hsl(var(--h) var(--s) 66%/.18);overflow:hidden}.cdp-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--ac2),var(--ac));border-radius:5px}
.cdp-eq{display:flex;gap:3px;align-items:flex-end;height:14px}.cdp-eq u{display:block;width:4px;height:3px;border-radius:2px;background:var(--ac);text-decoration:none}
.cdp.run .cdp-eq u{animation:cdeq .7s ease-in-out infinite alternate}.cdp-eq u:nth-child(2){animation-delay:-.2s}.cdp-eq u:nth-child(3){animation-delay:-.4s}.cdp-eq u:nth-child(4){animation-delay:-.1s}.cdp-eq u:nth-child(5){animation-delay:-.5s}@keyframes cdeq{to{height:14px}}
.cdp-win{position:relative;width:112px;height:112px;border-radius:50%;background:radial-gradient(circle,#15151a,#050507);box-shadow:0 0 0 5px var(--soft),0 0 0 6px var(--line),inset 0 8px 22px rgba(0,0,0,.5)}
.cdp-win::before{content:'';position:absolute;left:50%;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:radial-gradient(circle,#050507 40%,#8e8e96 42%,#2a2a2f);z-index:2}
.cdp-win::after{content:'';position:absolute;inset:0;border-radius:50%;background:linear-gradient(135deg,rgba(255,255,255,.16),transparent 40%);z-index:3;pointer-events:none}
.cdp-disc{position:absolute;inset:6px;border-radius:50%;background-size:cover;background-position:center;opacity:0;transition:opacity .5s;-webkit-mask:radial-gradient(circle,transparent 9%,#000 9.6%);mask:radial-gradient(circle,transparent 9%,#000 9.6%);animation:cdspin 2.4s linear infinite;animation-play-state:paused}
.cdp.in .cdp-disc{opacity:1}.cdp.run .cdp-disc{animation-play-state:running}@keyframes cdspin{to{transform:rotate(360deg)}}
.cdp-lc{position:relative;width:100%;padding:14px 20px;border-radius:26px;background:var(--card);border:1px solid var(--line);box-shadow:0 10px 30px rgba(0,0,0,.06);transition:opacity .4s}.cdp.leaving .cdp-lc{opacity:0}
.cdp-lc::before{content:'';position:absolute;left:0;right:0;top:0;height:72px;border-radius:26px 26px 0 0;background:linear-gradient(var(--card),transparent);z-index:1;pointer-events:none}
.cdp-lyr{height:190px;overflow:hidden;text-align:center}
.cdp-lyr .l{display:none;font-size:1.05rem;line-height:1.75;color:var(--muted);transition:color .3s,font-size .3s}.cdp-lyr .l.s{display:block;animation:up .5s both}.cdp-lyr .l.c{color:var(--text);font-weight:700;font-size:1.45rem;line-height:1.5}
.cdp-ctl{display:flex;gap:12px}.cdp .fbtn.main{background:var(--ac2)}.cdp-att{color:var(--muted);font-size:.74rem;text-align:center}.cdp-att a{text-decoration:underline}
@media(max-width:480px){.cdp-dev{grid-template-columns:1fr 88px}.cdp-win{width:88px;height:88px}.cdp-t{font-size:1.3rem}}`;
document.head.appendChild(css);

const P=document.createElement('div');P.className='cdp';
P.innerHTML=`<div class='cdp-dev'><div class='cdp-slot'></div><div class='cdp-lcd'><span class='cdp-ti'></span><span class='cdp-tm'><b class='cdp-t'>0:00</b> / <span class='cdp-d'>0:30</span></span><div class='cdp-bar'><i></i></div><div class='cdp-eq'><u></u><u></u><u></u><u></u><u></u></div></div><div class='cdp-win'><div class='cdp-disc'></div></div></div><div class='cdp-lc'><div class='cdp-lyr'></div></div><div class='cdp-ctl'><button class='fbtn main cdp-pp' type='button'>Pausar</button><button class='fbtn cdp-x' type='button'>Salir</button></div><small class='cdp-att'>Vista previa de 30 s cortesía de iTunes · <a class='cdp-a' target='_blank' rel='noopener'>Escuchar completa en Apple Music</a></small>`;
dw.appendChild(P);

const q=s=>P.querySelector(s),T=q('.cdp-t'),D=q('.cdp-d'),BAR=q('.cdp-bar i'),TI=q('.cdp-ti'),L=q('.cdp-lyr'),SL=q('.cdp-slot'),DISC=q('.cdp-disc'),B1=q('.cdp-pp'),B2=q('.cdp-x'),A=q('.cdp-a');
const pa=new Audio();pa.preload='auto';
let cur=null,raf=0,busy=false,cd=null,idx=-1,els=[];

function jsonp(url){
  return new Promise((res,rej)=>{
    const cb='_cb'+Math.random().toString(36).slice(2),s=document.createElement('script'),to=setTimeout(()=>{end();rej()},8000);
    function end(){clearTimeout(to);delete window[cb];s.remove()}
    window[cb]=d=>{end();res(d)};
    s.onerror=()=>{end();rej()};
    s.src=url+'&callback='+cb;
    document.head.appendChild(s);
  });
}

async function preview(e){
  if(e.previewUrl) return e.previewUrl;
  for(const c of ['us','es','ng','zm','mx']){
    try{
      const d=await jsonp('https://itunes.apple.com/lookup?id='+e.appleId+'&country='+c),r=(d.results||[]).find(x=>x.previewUrl);
      if(r)return r.previewUrl;
    }catch(_){}
  }
  return null;
}

function accent(src){
  return new Promise(res=>{
    const im=new Image();
    im.onload=()=>{
      try{
        const c=document.createElement('canvas');c.width=c.height=24;
        const x=c.getContext('2d');x.drawImage(im,0,0,24,24);
        const d=x.getImageData(0,0,24,24).data;
        let sx=0,sy=0,W=0,S=0;
        for(let i=0;i<d.length;i+=4){ 
          const r=d[i]/255,g=d[i+1]/255,b=d[i+2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),df=mx-mn,s=mx?df/mx:0;
          if(mx<.15||!df)continue;
          let h=mx===r?((g-b)/df)%6:mx===g?(b-r)/df+2:(r-g)/df+4;
          h*=60*Math.PI/180;
          const w=s*s*mx+.001;
          sx+=Math.cos(h)*w;sy+=Math.sin(h)*w;S+=s*w;W+=w;
        }
        if(W<.8||S/W<.14){res({h:0,s:0});return}
        let h=Math.atan2(sy,sx)*180/Math.PI;if(h<0)h+=360;
        res({h:Math.round(h),s:Math.round(Math.min(90,Math.max(45,S/W*100)))});
      }catch(_){res(null)}
    };
    im.onerror=()=>res(null);
    im.src=src;
  });
}

function setAc(c){
  c=c||{h:150,s:90};
  P.style.setProperty('--h',c.h);
  P.style.setProperty('--s',c.s+'%');
}

const rel=el=>{
  const a=el.getBoundingClientRect(),b=dw.getBoundingClientRect();
  return{x:a.left-b.left+a.width/2,y:a.top-b.top+a.height/2,w:a.width,h:a.height};
};

const coverOf=e=>e.cover||'assets/covers/'+e.slug+'.jpg';

function makeCd(e,s){
  const W=Math.min(s.w,s.h)*.6,d=document.createElement('div');
  d.className='cdf';
  d.style.cssText=`width:${W}px;height:${W}px;left:${s.x-W/2}px;top:${s.y-W/2}px;background-image:url("${coverOf(e)}")`;
  dw.appendChild(d);
  return d;
}

function keysIn(s,t){
  const dx=t.x-s.x,dy=t.y-s.y,K=[];
  const f=(o,x,y,rx,sc,op,e)=>K.push({offset:o,transform:`translate(${x}px,${y}px) perspective(700px) rotateX(${rx}deg) scale(${sc})`,opacity:op,easing:e||'ease-in-out'});
  f(0,0,0,0,.9,1,'ease-in');
  f(.2,0,0,0,.85,0,'linear');
  f(.3,dx,dy-40,0,.8,0,'ease-out');
  f(.45,dx,dy-40,0,.8,1,'ease-in-out');
  f(.6,dx,dy-40,0,.8,1,'ease-in-out');
  f(.75,dx,dy-6,70,.78,1,'ease-in');
  f(.9,dx,dy+10,86,.72,0,'linear');
  f(1,dx,dy+10,86,.72,0,'linear');
  return K;
}

function keysOut(s,t){
  const dx=t.x-s.x,dy=t.y-s.y,K=[];
  const f=(o,x,y,rx,sc,op,e)=>K.push({offset:o,transform:`translate(${x}px,${y}px) perspective(700px) rotateX(${rx}deg) scale(${sc})`,opacity:op,easing:e||'ease-in-out'});
  f(0,dx,dy+10,86,.72,0,'ease-out');
  f(.3,dx,dy-6,70,.78,1,'ease-out');
  f(.55,dx,dy-40,0,.8,1,'ease-in-out');
  f(.75,dx,dy-40,0,.8,1,'ease-in-out');
  f(1,dx,dy-40,0,.76,0,'linear');
  return K;
}

function setLines(e){
  L.innerHTML='';
  els=e.lines.map(l=>{
    const d=document.createElement('div');
    d.className='l';
    d.textContent=l.text;
    L.appendChild(d);
    return d;
  });
  idx=-1;
  DISC.style.backgroundImage='url("'+coverOf(e)+'")';
  TI.textContent=e.title+' · Keiri Blest';
  A.href='https://music.apple.com/song/'+e.appleId;
}

function show(n){
  idx=n;
  els.forEach((d,i)=>{
    d.classList.toggle('s',i<=n);
    d.classList.toggle('c',i===n);
  });
  L.scrollTop=L.scrollHeight;
}

function tick(){
  const c=pa.currentTime,du=pa.duration||30;
  T.textContent=fmt(c);
  D.textContent=fmt(du);
  BAR.style.width=Math.min(100,c/du*100)+'%';
  let n=-1;
  for(let i=0;i<cur.lines.length;i++)if(cur.lines[i].t<=c+.05)n=i;
  if(n!==idx)show(n);
  raf=raf0(tick);
}

const run=on=>{P.classList.toggle('run',on)};

function play(){
  pa.play().catch(()=>{});
  run(true);
  cancelAnimationFrame(raf);
  tick();
  B1.textContent='Pausar';
}

pa.addEventListener('ended',()=>{
  cancelAnimationFrame(raf);
  run(false);
  BAR.style.width='100%';
  B1.textContent='Repetir';
});

B1.addEventListener('click',()=>{
  if(!cur||busy)return;
  if(pa.ended||B1.textContent==='Repetir'){
    pa.currentTime=0;show(-1);play();
  }else if(!pa.paused){
    pa.pause();cancelAnimationFrame(raf);run(false);B1.textContent='Reanudar';
  }else play();
});

B2.addEventListener('click',()=>exit());

function follow(el,anim){
  return new Promise(res=>{
    const step=()=>{
      if(anim.playState==='finished'||anim.playState==='idle'){res();return}
      const a=el.getBoundingClientRect(),b=detail.getBoundingClientRect();
      detail.scrollTop+=((a.top+a.height/2)-(b.top+b.height/2))*.1;
      raf0(step);
    };
    raf0(step);
  });
}

async function grab(){
  cap.obj=null;
  for(let i=0;i<20;i++){
    if(locate())return true;
    await new Promise(r=>setTimeout(r,30));
  }
  return false;
}

async function start(e){
  if(busy)return;
  busy=true;
  cur=e;
  au.pause();
  setLines(e);
  T.textContent='0:00';
  BAR.style.width='0';
  B1.textContent='Pausar';
  P.classList.add('on');

  let url=null,ac=null;
  await Promise.all([preview(e).then(u=>{url=u}).catch(()=>{}),accent(coverOf(e)).then(c=>{ac=c})]);
  if(!cur)return;
  if(!url){
    quick();
    pv.dataset.fb='1';
    pv.click();
    delete pv.dataset.fb;
    return;
  }
  setAc(ac);
  pa.src=url;

  let ok=false;
  try{
    ok=await grab();
    if(ok){
      cap.p=0;
      snap();
      stage.style.pointerEvents='none';
      cap.on=true;
      await tween(1,500);
      await animateLid(-Math.PI*0.72, 600);
      if(cap.cd) cap.cd.visible=false;
    }
  }catch(_){ok=false;cap.on=false;cap.p=0;}

  if(!ok)freeze();
  if(!cur)return;

  const s=rel(stage),t=rel(SL);
  cd=makeCd(e,s);
  const el=cd,DUR=2600;

  const a=el.animate(keysIn(s,t),{duration:DUR,easing:'linear',fill:'forwards'});
  setTimeout(()=>P.classList.add('ins'),DUR*.72);
  setTimeout(()=>P.classList.remove('ins'),DUR*.72+700);

  await Promise.all([a.finished.catch(()=>{}),follow(el,a),ok?drive(a,SWIN):0]);
  if(!cur)return;

  el.remove();
  cd=null;

  if(ok){
    await animateLid(0, 500);
    tween(0,600).then(release);
  }else thaw();

  P.classList.add('in');
  P.scrollIntoView({behavior:'smooth',block:'center'});
  busy=false;
  pa.currentTime=0;
  play();
}

async function exit(){
  if(busy||!cur)return;
  busy=true;
  pa.pause();
  cancelAnimationFrame(raf);
  run(false);
  const e=cur;
  P.classList.remove('in');
  P.classList.add('leaving','ins');
  setTimeout(()=>P.classList.remove('ins'),800);
  cap.tk++;
  if(cap.on){cap.p=0;restore();cap.on=false;}

  let ok=false;
  try{
    ok=await grab();
    if(ok){
      snap();
      stage.style.pointerEvents='none';
      cap.on=true;
      cap.swx=0;
      cap.swr=0;
      if(cap.cd) cap.cd.visible=false;
      if(cap.lid) cap.lid.rotation.y=-Math.PI*0.72;
    }
  }catch(_){ok=false;cap.on=false;cap.p=0;}

  if(!ok)freeze();
  if(!cur)return;

  const s=rel(stage),t=rel(SL);
  cd=makeCd(e,s);
  const el=cd;

  const a=el.animate(keysOut(s,t),{duration:1800,easing:'linear',fill:'forwards'});
  await Promise.all([a.finished.catch(()=>{}),follow(el,a)]);

  el.remove();
  cd=null;

  detail.scrollTo({top:0,behavior:'smooth'});
  await new Promise(r=>setTimeout(r,550));

  if(ok){
    if(cap.cd) cap.cd.visible=true;
    await animateLid(0, 500);
    await tween(0,600);
  }

  quick();
}

function quick(){
  thaw();
  pa.pause();
  cancelAnimationFrame(raf);
  if(cd){cd.remove();cd=null}
  if(cap.cd) cap.cd.visible=true;
  if(cap.lid) cap.lid.rotation.y=0;
  cap.tk++;
  cap.p=0;
  restore();
  cap.on=false;
  cap.swx=0;
  cap.swr=0;
  stage.style.pointerEvents='';
  P.classList.remove('on','in','run','leaving','ins');
  cur=null;
  busy=false;
}

function attachPv(){
  $('pv').onclick = e => {
    if(e.target.dataset.fb) return;
    const song = find();
    if(!song) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if(cur){
      B1.click();
      return;
    }
    start(song);
  };
}
attachPv();

back.addEventListener('click',()=>{if(cur)quick()});

new MutationObserver(()=>{
  if(!detail.classList.contains('open')&&cur)quick();
  if(detail.classList.contains('open')) attachPv();
}).observe(detail,{attributes:true,attributeFilter:['class']});
})();
