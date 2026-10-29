(()=>{
const track=document.getElementById('track'),vp=document.getElementById('vp'),detail=document.getElementById('detail');
if(!track||!vp)return;

const ROW=104;

const css=document.createElement('style');
css.textContent=`.stk{position:relative;margin-top:10px;background:#0a0a0b;border-radius:34px;clip-path:inset(0 round 34px)}
.stk-st{position:sticky;top:0;height:100vh;height:100dvh;--w:min(84vw,420px);perspective:900px;-webkit-perspective:900px;perspective-origin:50% 50%;overflow:hidden}
.stk-i{position:absolute;left:50%;top:50%;width:var(--w);height:34px;margin:-17px 0 0 calc(var(--w)/-2);transform-style:preserve-3d;-webkit-transform-style:preserve-3d;--c:#2c2c30;cursor:pointer;outline:none;-webkit-tap-highlight-color:transparent;transform:translate3d(0,3000px,0)}
.stk-i.off{visibility:hidden}
.stk-tp,.stk-bt{position:absolute;left:0;width:100%;height:var(--w);display:block;background:var(--c) var(--img,none) center/cover no-repeat;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.stk-tp{bottom:100%;transform-origin:50% 100%;transform:rotateX(90deg)}
.stk-bt{top:100%;transform-origin:50% 0;transform:rotateX(-90deg)}
.stk-tp::after,.stk-bt::after{content:'';position:absolute;inset:0;pointer-events:none}
.stk-tp::after{background:linear-gradient(to top,rgba(0,0,0,0),rgba(0,0,0,.55))}
.stk-bt::after{background:linear-gradient(to bottom,rgba(0,0,0,0),rgba(0,0,0,.55))}
.stk-lb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:8px;padding:0 10px;background:var(--c);color:#fff;font-size:clamp(.78rem,2.9vw,.95rem);white-space:nowrap;overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.22);text-shadow:0 1px 2px rgba(0,0,0,.35)}
.stk-lb b{font-weight:700}
.stk-lb em{font-style:normal;opacity:.8;overflow:hidden;text-overflow:ellipsis}
@media(hover:hover){.stk-i:hover .stk-lb{filter:brightness(1.25)}}
.stk-i:focus-visible .stk-lb{outline:2px solid #fff;outline-offset:2px}
.stk-on #vp,.stk-on .head .arrows{display:none}`;
document.head.appendChild(css);

let wrap=null,st=null,rows=[],sig='',timer=0,raf=0,stageH=innerHeight,H=0,paused=false,kick=0,lastS=NaN,W=420;
const colors=new Map();

function avg(src,cb){
  if(colors.has(src)){cb(colors.get(src));return}
  const im=new Image();
  im.crossOrigin='anonymous';
  im.onload=()=>{
    try{
      const c=document.createElement('canvas');c.width=c.height=8;
      const x=c.getContext('2d');x.drawImage(im,0,0,8,8);
      const d=x.getImageData(0,0,8,8).data;
      let r=0,g=0,b=0,n=0;
      for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];n++}
      const v=`rgb(${r/n*.65|0},${g/n*.65|0},${b/n*.65|0})`;
      colors.set(src,v);cb(v);
    }catch(_){}
  };
  im.src=src;
}

function frame(){
  raf=0;
  if(!wrap||paused)return;
  const s=Math.min(Math.max(-wrap.getBoundingClientRect().top,0),Math.max(0,H-stageH));
  if(s===lastS&&kick<=0)return;
  lastS=s;
  if(kick>0){kick--;sched()}
  const dy0=-stageH*.3,lim=stageH/2+W*.6+80,load=stageH*1.6;
  for(const r of rows){
    const dy=dy0+r.i*ROW-s,ad=dy<0?-dy:dy,vis=ad<lim;
    if(vis!==r.vis){r.vis=vis;r.el.classList.toggle('off',!vis)}
    if(!vis)continue;
    if(!r.loaded&&ad<load){
      r.loaded=true;
      if(r.src)r.el.style.setProperty('--img','url("'+r.src+'")');
    }
    const y=Math.round(dy*10)/10;
    if(y!==r.y){r.y=y;r.el.style.transform='translate3d(0,'+y+'px,0)'}
    const z=1000-Math.round(ad);
    if(z!==r.z){r.z=z;r.el.style.zIndex=z}
  }
}
function sched(){if(!raf)raf=requestAnimationFrame(frame)}

function layout(){
  if(!wrap)return;
  stageH=st.clientHeight||innerHeight;
  W=rows[0]?rows[0].el.offsetWidth||420:420;
  const sMax=Math.max(0,(rows.length-1)*ROW+stageH*.2+120);
  H=stageH+sMax;
  wrap.style.height=H+'px';
  lastS=NaN;
  kick=Math.max(kick,2);
  sched();
}

function build(){
  const cards=[...track.querySelectorAll('.item .card')];
  if(!cards.length)return;
  const s=cards.map(c=>c.textContent).join('|');
  if(wrap&&s===sig)return;
  sig=s;
  if(wrap)wrap.remove();
  wrap=document.createElement('div');
  wrap.className='stk';
  st=document.createElement('div');
  st.className='stk-st';
  wrap.appendChild(st);
  rows=cards.map((card,i)=>{
    const art=card.querySelector('.art'),img=art&&art.querySelector('img'),t=card.querySelector('.meta b'),sp=card.querySelector('.meta span'),y=card.querySelector('.meta em');
    const src=img&&(img.currentSrc||img.src)||'';
    const el=document.createElement('div');
    el.className='stk-i off';
    el.setAttribute('role','button');
    el.tabIndex=0;
    el.innerHTML=`<i class='stk-tp'></i><i class='stk-bt'></i><span class='stk-lb'><b></b><em></em></span>`;
    const title=t?t.textContent.trim():'';
    el.setAttribute('aria-label',title);
    el.querySelector('b').textContent=title;
    el.querySelector('em').textContent=[sp&&sp.textContent.trim(),y&&y.textContent.trim()].filter(Boolean).join(' · ');
    if(!src&&art){
      const g=getComputedStyle(art).backgroundImage;
      if(g&&g!=='none')el.style.setProperty('--img',g);
    }
    const open=()=>card.click();
    el.addEventListener('click',open);
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
    if(src)avg(src,c=>el.style.setProperty('--c',c));
    st.appendChild(el);
    return {el,i,src,vis:null,loaded:false,y:NaN,z:NaN};
  });
  vp.after(wrap);
  document.documentElement.classList.add('stk-on');
  layout();
}

new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(build,150)}).observe(track,{childList:true});
if(detail)new MutationObserver(()=>{
  if(detail.classList.contains('open')){
    paused=true;
  }else if(paused){
    paused=false;
    lastS=NaN;
    kick=40;
    sched();
  }
}).observe(detail,{attributes:true,attributeFilter:['class']});
addEventListener('scroll',sched,{passive:true});
addEventListener('resize',()=>{if(!paused)layout()});
addEventListener('orientationchange',()=>setTimeout(()=>{if(!paused)layout()},300));
addEventListener('load',()=>{if(!paused)layout()});
addEventListener('pageshow',()=>{if(!paused)layout()});
if('ResizeObserver' in window){
  new ResizeObserver(()=>{if(st&&!paused)layout()}).observe(document.documentElement);
}
build();
})();
