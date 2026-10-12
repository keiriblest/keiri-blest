(()=>{
const $=id=>document.getElementById(id),detail=$('detail'),dt=$('dt'),pv=$('pv'),back=$('back'),stage=$('stage'),au=$('au');
if(!detail||!pv||!stage)return;
const dw=detail.querySelector('.dwrap'),RAF=window.requestAnimationFrame,raf0=f=>RAF.call(window,f),norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,''),fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
let held=null;
function freeze(){if(held)return;held=[];window.requestAnimationFrame=cb=>{held.push(cb);return 0};stage.style.pointerEvents='none'}
function thaw(){if(!held)return;window.requestAnimationFrame=RAF;const h=held;held=null;stage.style.pointerEvents='';h.forEach(cb=>RAF.call(window,cb))}
let DB={};
fetch('letras-sync.json',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(d=>{DB=d||{}}).catch(()=>{});
const find=()=>{const t=norm(dt.textContent);for(const k in DB){const e=DB[k];if(e&&e.lines&&e.lines.length&&norm(e.title)===t){e.slug=k;return e}}return null};
const css=document.createElement('style');
css.textContent=`.dwrap{position:relative}.stage{z-index:2}
.cdf{position:absolute;z-index:1;border-radius:50%;pointer-events:none;background-size:cover;background-position:center;-webkit-mask:radial-gradient(circle,transparent 9%,#000 9.6%);mask:radial-gradient(circle,transparent 9%,#000 9.6%);filter:drop-shadow(0 14px 18px rgba(0,0,0,.35))}
.cdf::after{content:'';position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 20deg,rgba(255,255,255,.45),transparent 25%,rgba(255,255,255,.3) 50%,transparent 75%,rgba(255,255,255,.45))}
.cdcase{position:absolute;z-index:3;border-radius:24px;background-size:cover;background-position:center;pointer-events:none;opacity:0;box-shadow:0 34px 70px rgba(0,0,0,.4),0 0 0 1px rgba(255,255,255,.25) inset}
.cdcase::before{content:'';position:absolute;left:0;top:0;bottom:0;width:8%;border-radius:24px 0 0 24px;background:linear-gradient(90deg,rgba(0,0,0,.4),transparent)}
.cdcase::after{content:'';position:absolute;inset:0;border-radius:inherit;background:linear-gradient(115deg,rgba(255,255,255,.38),transparent 30%,transparent 68%,rgba(0,0,0,.22))}
.cdp{--h:150;--s:90%;--ac:hsl(var(--h) var(--s) 66%);--ac2:hsl(var(--h) var(--s) 42%);--acd:hsl(var(--h) 45% 8%);--acd2:hsl(var(--h) 45% 3%);display:none;flex-direction:column;align-items:center;gap:18px;width:min(560px,100%);margin-top:40px}.cdp.on{display:flex;animation:up .6s both cubic-bezier(.2,.8,.2,1)}
.cdp-dev{position:relative;width:100%;display:grid;grid-template-columns:1fr 112px;align-items:center;gap:20px;padding:46px 26px 24px;border-radius:30px;background:linear-gradient(160deg,#fafafc,#d3d4dc);border:1px solid rgba(255,255,255,.7);box-shadow:0 30px 70px rgba(0,0,0,.22),0 2px 0 rgba(255,255,255,.9) inset,0 -12px 24px rgba(0,0,0,.06) inset;transition:box-shadow .6s}
html[data-theme='dark'] .cdp-dev{background:linear-gradient(160deg,#3a3a41,#131316);border-color:rgba(255,255,255,.08);box-shadow:0 30px 70px rgba(0,0,0,.6),0 1px 0 rgba(255,255,255,.1) inset,0 -12px 24px rgba(0,0,0,.35) inset}
.cdp.in .cdp-dev{box-shadow:0 30px 70px rgba(0,0,0,.25),0 0 50px hsl(var(--h) var(--s) 55%/.28),0 2px 0 rgba(255,255,255,.9) inset}
.cdp-slot{position:absolute;top:16px;left:26px;right:26px;height:14px;border-radius:10px;background:#030304;box-shadow:0 2px 5px #000 inset,0 1px 0 rgba(255,255,255,.35);overflow:hidden}
.cdp-slot::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,var(--ac),transparent);transform:translateX(-100%);opacity:0}
.cdp.in .cdp-slot::after{opacity:1;animation:cdscan 2.4s ease-in-out infinite}@keyframes cdscan{to{transform:translateX(100%)}}
.cdp-lcd{display:flex;flex-direction:column;gap:9px;padding:14px 16px;border-radius:16px;background:linear-gradient(var(--acd),var(--acd2));box-shadow:0 0 0 1px hsl(var(--h) var(--s) 60%/.25),0 2px 10px rgba(0,0,0,.5) inset;color:var(--ac);font-family:ui-monospace,Menlo,monospace;min-width:0;transition:background .5s,color .5s}
.cdp-ti{font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cdp-tm{font-size:.82rem;opacity:.85}.cdp-t{font-size:1.6rem;font-weight:600}
.cdp-bar{height:5px;border-radius:5px;background:hsl(var(--h) var(--s) 66%/.18);overflow:hidden}.cdp-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--ac2),var(--ac));border-radius:5px}
.cdp-eq{display:flex;gap:3px;align-items:flex-end;height:14px}.cdp-eq u{display:block;width:4px;height:3px;border-radius:2px;background:var(--ac);text-decoration:none}
.cdp.run .cdp-eq u{animation:cdeq .7s ease-in-out infinite alternate}.cdp-eq u:nth-child(2){animation-delay:-.2s}.cdp-eq u:nth-child(3){animation-delay:-.4s}.cdp-eq u:nth-child(4){animation-delay:-.1s}.cdp-eq u:nth-child(5){animation-delay:-.5s}@keyframes cdeq{to{height:14px}}
.cdp-win{position:relative;width:112px;height:112px;border-radius:50%;background:radial-gradient(circle,#15151a,#050507);box-shadow:0 0 0 5px rgba(0,0,0,.35),0 0 0 6px hsl(var(--h) var(--s) 70%/.35),0 8px 22px rgba(0,0,0,.5) inset}
.cdp-win::before{content:'';position:absolute;left:50%;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:radial-gradient(circle,#050507 40%,#8e8e96 42%,#2a2a2f);z-index:2}
.cdp-win::after{content:'';position:absolute;inset:0;border-radius:50%;background:linear-gradient(135deg,rgba(255,255,255,.4),transparent 38%,transparent 70%,rgba(255,255,255,.12));z-index:3;pointer-events:none}
.cdp-disc{position:absolute;inset:6px;border-radius:50%;background-size:cover;background-position:center;opacity:0;transition:opacity .5s;-webkit-mask:radial-gradient(circle,transparent 9%,#000 9.6%);mask:radial-gradient(circle,transparent 9%,#000 9.6%);animation:cdspin 2.4s linear infinite;animation-play-state:paused}
.cdp.in .cdp-disc{opacity:1}.cdp.run .cdp-disc{animation-play-state:running}@keyframes cdspin{to{transform:rotate(360deg)}}
.cdp-lc{position:relative;width:100%;padding:14px 20px;border-radius:26px;background:var(--card);box-shadow:0 10px 30px rgba(0,0,0,.08);transition:opacity .4s}.cdp.leaving .cdp-lc{opacity:0}
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
let cur=null,raf=0,busy=false,cd=null,kc=null,idx=-1,els=[];
function jsonp(url){return new Promise((res,rej)=>{const cb='_cb'+Math.random().toString(36).slice(2),s=document.createElement('script'),to=setTimeout(()=>{end();rej()},8000);function end(){clearTimeout(to);delete window[cb];s.remove()}window[cb]=d=>{end();res(d)};s.onerror=()=>{end();rej()};s.src=url+'&callback='+cb;document.head.appendChild(s)})}
async function preview(e){for(const c of ['us','es','ng','zm','mx']){try{const d=await jsonp('https://itunes.apple.com/lookup?id='+e.appleId+'&country='+c),r=(d.results||[]).find(x=>x.previewUrl);if(r)return r.previewUrl}catch(_){}}return e.previewUrl||null}
function accent(src){return new Promise(res=>{const im=new Image();im.onload=()=>{try{const c=document.createElement('canvas');c.width=c.height=24;const x=c.getContext('2d');x.drawImage(im,0,0,24,24);const d=x.getImageData(0,0,24,24).data;let sx=0,sy=0,W=0,S=0;for(let i=0;i<d.length;i+=4){const r=d[i]/255,g=d[i+1]/255,b=d[i+2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),df=mx-mn,s=mx?df/mx:0;if(mx<.15||!df)continue;let h=mx===r?((g-b)/df)%6:mx===g?(b-r)/df+2:(r-g)/df+4;h*=60*Math.PI/180;const w=s*s*mx+.001;sx+=Math.cos(h)*w;sy+=Math.sin(h)*w;S+=s*w;W+=w}if(W<.8||S/W<.14){res({h:0,s:0});return}let h=Math.atan2(sy,sx)*180/Math.PI;if(h<0)h+=360;res({h:Math.round(h),s:Math.round(Math.min(90,Math.max(45,S/W*100)))})}catch(_){res(null)}};im.onerror=()=>res(null);im.src=src})}
function setAc(c){c=c||{h:150,s:90};P.style.setProperty('--h',c.h);P.style.setProperty('--s',c.s+'%')}
const rel=el=>{const a=el.getBoundingClientRect(),b=dw.getBoundingClientRect();return{x:a.left-b.left+a.width/2,y:a.top-b.top+a.height/2,w:a.width,h:a.height}};
const coverOf=e=>e.cover||'assets/covers/'+e.slug+'.jpg';
function makeCd(e,s){const W=Math.min(s.w,s.h)*.6,d=document.createElement('div');d.className='cdf';d.style.cssText=`width:${W}px;height:${W}px;left:${s.x-W/2}px;top:${s.y-W/2}px;background-image:url("${coverOf(e)}")`;dw.appendChild(d);return d}
function makeCase(e,s){const d=document.createElement('div');d.className='cdcase';d.style.cssText=`width:${s.w}px;height:${s.h}px;left:${s.x-s.w/2}px;top:${s.y-s.h/2}px;background-image:url("${coverOf(e)}")`;dw.appendChild(d);return d}
const ps=(x,r)=>`perspective(900px) translateX(${x}px) rotateY(${r}deg)`;
async function showCase(){if(!kc)return;stage.style.transition='none';await kc.animate([{opacity:0,transform:ps(0,-14)},{opacity:1,transform:ps(0,-14)}],{duration:450,fill:'forwards',easing:'ease-out'}).finished.catch(()=>{});stage.style.opacity='0'}
async function hideCase(){if(!kc)return;stage.style.opacity='';const k=kc;kc=null;await k.animate([{opacity:1},{opacity:0}],{duration:450,fill:'forwards'}).finished.catch(()=>{});k.remove()}
function setLines(e){L.innerHTML='';els=e.lines.map(l=>{const d=document.createElement('div');d.className='l';d.textContent=l.text;L.appendChild(d);return d});idx=-1;DISC.style.backgroundImage='url("'+coverOf(e)+'")';TI.textContent=e.title+' · Keiri Blest';A.href='https://music.apple.com/song/'+e.appleId}
function show(n){idx=n;els.forEach((d,i)=>{d.classList.toggle('s',i<=n);d.classList.toggle('c',i===n)});L.scrollTop=L.scrollHeight}
function tick(){const c=pa.currentTime,du=pa.duration||30;T.textContent=fmt(c);D.textContent=fmt(du);BAR.style.width=Math.min(100,c/du*100)+'%';let n=-1;for(let i=0;i<cur.lines.length;i++)if(cur.lines[i].t<=c+.05)n=i;if(n!==idx)show(n);raf=raf0(tick)}
const run=on=>{P.classList.toggle('run',on)};
function play(){pa.play().catch(()=>{});run(true);cancelAnimationFrame(raf);tick();B1.textContent='Pausar'}
pa.addEventListener('ended',()=>{cancelAnimationFrame(raf);run(false);BAR.style.width='100%';B1.textContent='Repetir'});
B1.addEventListener('click',()=>{if(!cur||busy)return;if(pa.ended||B1.textContent==='Repetir'){pa.currentTime=0;show(-1);play()}else if(!pa.paused){pa.pause();cancelAnimationFrame(raf);run(false);B1.textContent='Reanudar'}else play()});
B2.addEventListener('click',()=>exit());
function follow(el,anim){return new Promise(res=>{const step=()=>{if(anim.playState==='finished'||anim.playState==='idle'){res();return}const a=el.getBoundingClientRect(),b=detail.getBoundingClientRect();detail.scrollTop+=((a.top+a.height/2)-(b.top+b.height/2))*.14;raf0(step)};raf0(step)})}
const tf=(x,y,r,k)=>`translate(${x}px,${y}px) perspective(600px) rotateX(${r}deg) scale(${k})`;
const sw=(o,x,r)=>({transform:ps(x,r),opacity:1,offset:o});
async function start(e){
if(busy)return;busy=true;cur=e;au.pause();setLines(e);T.textContent='0:00';BAR.style.width='0';B1.textContent='Pausar';P.classList.add('on');
let url=null,ac=null;await Promise.all([preview(e).then(u=>{url=u}).catch(()=>{}),accent(coverOf(e)).then(c=>{ac=c})]);
if(!cur)return;
if(!url){quick();pv.dataset.fb='1';pv.click();delete pv.dataset.fb;return}
setAc(ac);pa.src=url;
const s=rel(stage),t=rel(SL);kc=makeCase(e,s);await showCase();if(!cur)return;
cd=makeCd(e,s);
const dx=t.x-s.x,dy=t.y-s.y,sx=s.w*.55,el=cd;
freeze();
const a=el.animate([{transform:tf(0,0,0,.9),opacity:0,offset:0},{transform:tf(sx,0,0,.95),opacity:1,offset:.22},{transform:tf(sx,0,0,.95),opacity:1,offset:.32},{transform:tf(dx,dy-40,0,.8),opacity:1,offset:.72},{transform:tf(dx,dy,82,.8),opacity:1,offset:.92},{transform:tf(dx,dy,82,.8),opacity:0,offset:1}],{duration:2800,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
kc.animate([sw(0,0,-14),sw(.12,-16,-26),sw(.22,-30,-30),sw(.32,-30,-30),sw(.45,-10,-8),sw(.58,18,12),sw(.72,-6,-12),sw(.85,8,-4),sw(1,0,-14)],{duration:2800,easing:'ease-in-out',fill:'forwards'});
await Promise.all([a.finished.catch(()=>{}),follow(el,a)]);
thaw();if(!cur)return;el.remove();cd=null;hideCase();P.classList.add('in');P.scrollIntoView({behavior:'smooth',block:'center'});busy=false;pa.currentTime=0;play()}
async function exit(){
if(busy||!cur)return;busy=true;pa.pause();cancelAnimationFrame(raf);run(false);const e=cur;
const s=rel(stage),t=rel(SL);kc=makeCase(e,s);P.classList.remove('in');P.classList.add('leaving');
await showCase();if(!cur)return;cd=makeCd(e,s);
const dx=t.x-s.x,dy=t.y-s.y,sx=s.w*.55,el=cd;
freeze();
const a=el.animate([{transform:tf(dx,dy,82,.8),opacity:0,offset:0},{transform:tf(dx,dy,82,.8),opacity:1,offset:.1},{transform:tf(dx,dy-40,0,.8),opacity:1,offset:.32},{transform:tf(sx,0,0,.95),opacity:1,offset:.72},{transform:tf(sx,0,0,.95),opacity:1,offset:.8},{transform:tf(0,0,0,.9),opacity:0,offset:1}],{duration:2600,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
kc.animate([sw(0,0,-14),sw(.3,10,10),sw(.5,-10,-12),sw(.66,-28,-28),sw(.8,-30,-30),sw(.9,-8,-16),sw(1,0,-14)],{duration:2600,easing:'ease-in-out',fill:'forwards'});
await Promise.all([a.finished.catch(()=>{}),follow(el,a)]);
thaw();await hideCase();quick();detail.scrollTo({top:0,behavior:'smooth'})}
function quick(){thaw();pa.pause();cancelAnimationFrame(raf);if(cd){cd.remove();cd=null}if(kc){kc.remove();kc=null}stage.style.opacity='';stage.style.transition='';P.classList.remove('on','in','run','leaving');cur=null;busy=false}
detail.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('#pv');if(!b||b.dataset.fb)return;const e=find();if(!e)return;ev.preventDefault();ev.stopImmediatePropagation();if(cur){B1.click();return}start(e)},true);
back.addEventListener('click',()=>{if(cur)quick()});
new MutationObserver(()=>{if(!detail.classList.contains('open')&&cur)quick()}).observe(detail,{attributes:true,attributeFilter:['class']});
})();
