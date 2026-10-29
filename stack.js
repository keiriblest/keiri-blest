(()=>{
const track=document.getElementById('track'),vp=document.getElementById('vp');
if(!track||!vp)return;

const css=document.createElement('style');
css.textContent=`.stk{background:#0a0a0b;border-radius:34px;padding:70px 0 90px;margin-top:10px}
.stk-i{position:relative;display:block;width:min(86%,480px);height:120px;margin:0 auto;padding:0;background:none;border:0;--rx:80deg;--c:#2c2c30;-webkit-tap-highlight-color:transparent;cursor:pointer;transition:filter .3s;color:#fff}
.stk-pl{position:absolute;left:0;right:0;bottom:34px;aspect-ratio:1;background-size:cover;background-position:center;border-radius:6px 6px 0 0;transform-origin:50% 100%;transform:perspective(900px) rotateX(var(--rx));box-shadow:0 20px 40px rgba(0,0,0,.5)}
.stk-i.up .stk-pl{bottom:auto;top:34px;transform-origin:50% 0;border-radius:0 0 6px 6px}
.stk-lb{position:absolute;left:0;right:0;bottom:0;height:34px;display:flex;align-items:center;justify-content:center;gap:8px;padding:0 10px;background:var(--c);color:#fff;font-size:.9rem;white-space:nowrap;overflow:hidden;border-radius:0 0 6px 6px;text-shadow:0 1px 2px rgba(0,0,0,.35)}
.stk-i.up .stk-lb{top:0;bottom:auto;border-radius:6px 6px 0 0}
.stk-lb b{font-weight:700}.stk-lb i{font-style:normal;opacity:.8;overflow:hidden;text-overflow:ellipsis}
.stk-i:hover,.stk-i:focus-visible{filter:brightness(1.18);outline:none}
.stk-on #vp,.stk-on .head .arrows{display:none}
@media(prefers-reduced-motion:reduce){.stk-i{transition:none}}`;
document.head.appendChild(css);

let box=null,rows=[],raf=0,timer=0;

function avg(src,cb){
  const im=new Image();
  im.crossOrigin='anonymous';
  im.onload=()=>{
    try{
      const c=document.createElement('canvas');c.width=c.height=8;
      const x=c.getContext('2d');x.drawImage(im,0,0,8,8);
      const d=x.getImageData(0,0,8,8).data;
      let r=0,g=0,b=0,n=0;
      for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];n++}
      cb(`rgb(${r/n*.65|0},${g/n*.65|0},${b/n*.65|0})`);
    }catch(_){}
  };
  im.src=src;
}

function upd(){
  raf=0;
  const vh=innerHeight;
  rows.forEach(r=>{
    const b=r.getBoundingClientRect();
    const d=Math.max(-1,Math.min(1,((b.top+b.height/2)-vh/2)/(vh*.55)));
    const up=d<0,a=Math.abs(d);
    r.classList.toggle('up',up);
    r.style.setProperty('--rx',((80-36*a)*(up?-1:1))+'deg');
    r.style.zIndex=Math.round(100-a*100);
  });
}
const sched=()=>{if(!raf)raf=requestAnimationFrame(upd)};

function build(){
  const cards=[...track.querySelectorAll('.item .card')];
  if(!cards.length)return;
  if(box)box.remove();
  box=document.createElement('div');
  box.className='stk';
  rows=cards.map(card=>{
    const art=card.querySelector('.art'),img=art&&art.querySelector('img'),t=card.querySelector('.meta b'),s=card.querySelector('.meta span'),y=card.querySelector('.meta em');
    const src=img&&(img.currentSrc||img.src);
    const row=document.createElement('button');
    row.type='button';
    row.className='stk-i';
    row.innerHTML=`<span class='stk-pl'></span><span class='stk-lb'><b></b><i></i></span>`;
    const title=t?t.textContent.trim():'';
    row.setAttribute('aria-label',title);
    row.querySelector('b').textContent=title;
    row.querySelector('i').textContent=[s&&s.textContent.trim(),y&&y.textContent.trim()].filter(Boolean).join(' · ');
    const pl=row.querySelector('.stk-pl');
    if(src)pl.style.backgroundImage='url("'+src+'")';
    else if(art)pl.style.backgroundImage=getComputedStyle(art).backgroundImage;
    row.addEventListener('click',()=>card.click());
    if(src)avg(src,c=>row.style.setProperty('--c',c));
    box.appendChild(row);
    return row;
  });
  vp.after(box);
  document.documentElement.classList.add('stk-on');
  upd();
}

new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(build,150)}).observe(track,{childList:true});
addEventListener('scroll',sched,{passive:true});
addEventListener('resize',sched);
build();
})();
