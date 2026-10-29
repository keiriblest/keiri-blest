(()=>{
const track=document.getElementById('track'),vp=document.getElementById('vp'),detail=document.getElementById('detail');
if(!track||!vp)return;

const css=document.createElement('style');
css.textContent=`.stk{position:relative;z-index:0;isolation:isolate;background:#0a0a0b;border-radius:34px;padding:70px 0 90px;margin-top:10px}
.stk.hide{visibility:hidden}
.stk-i{position:relative;display:block;width:min(86%,480px);height:120px;margin:0 auto;padding:0;background:none;border:0;--c:#2c2c30;-webkit-tap-highlight-color:transparent;cursor:pointer;color:#fff;contain:layout style}
.stk-pl{position:absolute;left:0;right:0;bottom:34px;aspect-ratio:1;background-size:cover;background-position:center;border-radius:6px 6px 0 0;transform-origin:50% 100%;transform:perspective(900px) rotateX(80deg);will-change:transform;box-shadow:0 20px 40px rgba(0,0,0,.5)}
.stk-i.up .stk-pl{bottom:auto;top:34px;transform-origin:50% 0;border-radius:0 0 6px 6px;transform:perspective(900px) rotateX(-80deg)}
.stk-lb{position:absolute;left:0;right:0;bottom:0;height:34px;display:flex;align-items:center;justify-content:center;gap:8px;padding:0 10px;background:var(--c);color:#fff;font-size:.9rem;white-space:nowrap;overflow:hidden;border-radius:0 0 6px 6px;text-shadow:0 1px 2px rgba(0,0,0,.35)}
.stk-i.up .stk-lb{top:0;bottom:auto;border-radius:6px 6px 0 0}
.stk-lb b{font-weight:700}.stk-lb i{font-style:normal;opacity:.8;overflow:hidden;text-overflow:ellipsis}
@media(hover:hover){.stk-i:hover .stk-lb{filter:brightness(1.25)}}
.stk-i:focus-visible{outline:2px solid #fff;outline-offset:4px}
.stk-on #vp,.stk-on .head .arrows{display:none}`;
document.head.appendChild(css);

let box=null,rows=[],sig='',raf=0,timer=0,hidden=false,lastY=-1,boxTop=0,vh=innerHeight;
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

function upd(){
  raf=0;
  if(!box)return;
  const y=scrollY,top=box.getBoundingClientRect().top+y;
  if(y===lastY&&top===boxTop)return;
  lastY=y;boxTop=top;
  const c=y+vh/2,lim=vh*1.15,k=vh*.55;
  for(const r of rows){
    const dist=top+r.rel-c;
    if(dist>lim||dist<-lim)continue;
    const d=Math.max(-1,Math.min(1,dist/k)),a=d<0?-d:d,up=d<0;
    const rx=Math.round((80-36*a)*(up?-1:1)*10)/10;
    if(up!==r.up){r.up=up;r.el.classList.toggle('up',up)}
    if(rx!==r.rx){r.rx=rx;r.pl.style.transform='perspective(900px) rotateX('+rx+'deg)'}
    const z=Math.round(100-a*100);
    if(z!==r.z){r.z=z;r.el.style.zIndex=z}
  }
}
const sched=()=>{if(!raf)raf=requestAnimationFrame(upd)};

function measureNow(){
  vh=innerHeight;
  rows.forEach(r=>{r.rel=r.el.offsetTop+r.el.offsetHeight/2});
  lastY=-1;
  upd();
}
function measure(){
  measureNow();
}

function build(){
  const cards=[...track.querySelectorAll('.item .card')];
  if(!cards.length)return;
  const s=cards.map(c=>c.textContent).join('|');
  if(box&&s===sig)return;
  sig=s;
  if(box)box.remove();
  box=document.createElement('div');
  box.className='stk';
  rows=cards.map(card=>{
    const art=card.querySelector('.art'),img=art&&art.querySelector('img'),t=card.querySelector('.meta b'),sp=card.querySelector('.meta span'),y=card.querySelector('.meta em');
    const src=img&&(img.currentSrc||img.src);
    const row=document.createElement('button');
    row.type='button';
    row.className='stk-i';
    row.innerHTML=`<span class='stk-pl'></span><span class='stk-lb'><b></b><i></i></span>`;
    const title=t?t.textContent.trim():'';
    row.setAttribute('aria-label',title);
    row.querySelector('b').textContent=title;
    row.querySelector('i').textContent=[sp&&sp.textContent.trim(),y&&y.textContent.trim()].filter(Boolean).join(' · ');
    const pl=row.querySelector('.stk-pl');
    if(src)pl.style.backgroundImage='url("'+src+'")';
    else if(art)pl.style.backgroundImage=getComputedStyle(art).backgroundImage;
    row.addEventListener('click',()=>card.click());
    if(src)avg(src,c=>row.style.setProperty('--c',c));
    box.appendChild(row);
    return {el:row,pl,rel:0,rx:999,up:false,z:-1};
  });
  vp.after(box);
  document.documentElement.classList.add('stk-on');
  measure();
}

new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(build,150)}).observe(track,{childList:true});
if(detail)new MutationObserver(()=>{
  if(detail.classList.contains('open')){
    hidden=true;
    if(box)box.classList.add('hide');
  }else if(hidden){
    hidden=false;
    measureNow();
    requestAnimationFrame(()=>{
      measureNow();
      requestAnimationFrame(()=>{
        measureNow();
        if(box)box.classList.remove('hide');
      });
    });
  }
}).observe(detail,{attributes:true,attributeFilter:['class']});
addEventListener('scroll',sched,{passive:true});
addEventListener('resize',measure);
addEventListener('load',measure);
build();
})();
