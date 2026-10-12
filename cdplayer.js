(()=>{
const $=id=>document.getElementById(id),detail=$('detail'),dt=$('dt'),pl=$('pl'),back=$('back'),stage=$('stage'),au=$('au');
if(!detail||!pl||!stage)return;
const dw=detail.querySelector('.dwrap'),norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,''),wait=ms=>new Promise(r=>setTimeout(r,ms)),fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
let DB={};
fetch('letras-sync.json',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(d=>{DB=d||{}}).catch(()=>{});
const find=()=>{const t=norm(dt.textContent);for(const k in DB){const e=DB[k];if(e&&e.lines&&e.lines.length&&norm(e.title)===t){e.slug=k;return e}}return null};
const css=document.createElement('style');
css.textContent=`.dwrap{position:relative}.stage{z-index:2}
.cdf{position:absolute;z-index:1;border-radius:50%;pointer-events:none;background-size:cover;background-position:center;-webkit-mask:radial-gradient(circle,transparent 9%,#000 9.6%);mask:radial-gradient(circle,transparent 9%,#000 9.6%)}
.cdf::after{content:'';position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 20deg,rgba(255,255,255,.4),transparent 25%,rgba(255,255,255,.3) 50%,transparent 75%,rgba(255,255,255,.4))}
.cdp{display:none;flex-direction:column;align-items:center;gap:16px;width:min(520px,100%);margin-top:34px}.cdp.on{display:flex;animation:up .6s both cubic-bezier(.2,.8,.2,1)}
.cdp-dev{position:relative;width:min(380px,100%);height:120px;border-radius:22px;background:linear-gradient(#ececf1,#c6c6ce);box-shadow:0 20px 50px rgba(0,0,0,.2),inset 0 1px 0 #fff;padding:0 22px;display:flex;align-items:flex-end;justify-content:space-between;padding-bottom:18px}
html[data-theme='dark'] .cdp-dev{background:linear-gradient(#2b2b30,#16161a);box-shadow:0 20px 50px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08)}
.cdp-slot{position:absolute;top:18px;left:50%;width:78%;height:12px;transform:translateX(-50%);border-radius:8px;background:#050507;box-shadow:inset 0 2px 4px #000;transition:box-shadow .4s}
.cdp.in .cdp-slot{box-shadow:inset 0 2px 4px #000,0 0 14px 2px rgba(0,113,227,.65)}
.cdp-t{font:600 1.1rem ui-monospace,Menlo,monospace;color:#0f0;background:#050507;padding:6px 12px;border-radius:8px;letter-spacing:.06em}
.cdp-disc{width:62px;height:62px;border-radius:50%;background-size:cover;background-position:center;opacity:0;transition:opacity .4s;-webkit-mask:radial-gradient(circle,transparent 9%,#000 9.6%);mask:radial-gradient(circle,transparent 9%,#000 9.6%);animation:cdspin 3s linear infinite;animation-play-state:paused}
.cdp.in .cdp-disc{opacity:1}.cdp.run .cdp-disc{animation-play-state:running}@keyframes cdspin{to{transform:rotate(360deg)}}
.cdp-lyr{width:100%;height:176px;overflow:hidden;text-align:center;-webkit-mask:linear-gradient(transparent,#000 35%);mask:linear-gradient(transparent,#000 35%)}
.cdp-lyr .l{display:none;font-size:1.05rem;line-height:1.7;color:var(--muted);transition:color .3s,font-size .3s}.cdp-lyr .l.s{display:block;animation:up .5s both}.cdp-lyr .l.c{color:var(--text);font-weight:700;font-size:1.3rem}
.cdp-ctl{display:flex;gap:12px}.cdp-att{color:var(--muted);font-size:.74rem}.cdp-att a{text-decoration:underline}`;
document.head.appendChild(css);
const P=document.createElement('div');P.className='cdp';
P.innerHTML=`<div class='cdp-dev'><div class='cdp-slot'></div><span class='cdp-t'>0:00</span><div class='cdp-disc'></div></div><div class='cdp-lyr'></div><div class='cdp-ctl'><button class='fbtn main cdp-pp' type='button'>Pausar</button><button class='fbtn cdp-x' type='button'>Salir</button></div><small class='cdp-att'>Vista previa de 30 s cortesía de iTunes · <a class='cdp-a' target='_blank' rel='noopener'>Escuchar completa en Apple Music</a></small>`;
dw.appendChild(P);
const q=s=>P.querySelector(s),T=q('.cdp-t'),L=q('.cdp-lyr'),SL=q('.cdp-slot'),DISC=q('.cdp-disc'),B1=q('.cdp-pp'),B2=q('.cdp-x'),A=q('.cdp-a');
const pa=new Audio();pa.preload='auto';
let cur=null,raf=0,busy=false,cd=null,idx=-1,els=[];
function jsonp(url){return new Promise((res,rej)=>{const cb='_cb'+Math.random().toString(36).slice(2),s=document.createElement('script'),to=setTimeout(()=>{end();rej()},8000);function end(){clearTimeout(to);delete window[cb];s.remove()}window[cb]=d=>{end();res(d)};s.onerror=()=>{end();rej()};s.src=url+'&callback='+cb;document.head.appendChild(s)})}
async function preview(e){for(const c of ['us','es','ng','zm','mx']){try{const d=await jsonp('https://itunes.apple.com/lookup?id='+e.appleId+'&country='+c),r=(d.results||[]).find(x=>x.previewUrl);if(r)return r.previewUrl}catch(_){}}return e.previewUrl||null}
const rel=el=>{const a=el.getBoundingClientRect(),b=dw.getBoundingClientRect();return{x:a.left-b.left+a.width/2,y:a.top-b.top+a.height/2,w:a.width,h:a.height}};
const coverOf=e=>e.cover||'assets/covers/'+e.slug+'.jpg';
function makeCd(e,s){const W=Math.min(s.w,s.h)*.6,d=document.createElement('div');d.className='cdf';d.style.cssText=`width:${W}px;height:${W}px;left:${s.x-W/2}px;top:${s.y-W/2}px;background-image:url("${coverOf(e)}")`;dw.appendChild(d);return d}
function setLines(e){L.innerHTML='';els=e.lines.map(l=>{const d=document.createElement('div');d.className='l';d.textContent=l.text;L.appendChild(d);return d});idx=-1;DISC.style.backgroundImage='url("'+coverOf(e)+'")';A.href='https://music.apple.com/song/'+e.appleId}
function show(n){idx=n;els.forEach((d,i)=>{d.classList.toggle('s',i<=n);d.classList.toggle('c',i===n)});L.scrollTop=L.scrollHeight}
function tick(){const c=pa.currentTime;T.textContent=fmt(c);let n=-1;for(let i=0;i<cur.lines.length;i++)if(cur.lines[i].t<=c+.05)n=i;if(n!==idx)show(n);raf=requestAnimationFrame(tick)}
const run=on=>{P.classList.toggle('run',on)};
function play(){pa.play().catch(()=>{});run(true);cancelAnimationFrame(raf);tick();B1.textContent='Pausar'}
pa.addEventListener('ended',()=>{cancelAnimationFrame(raf);run(false);B1.textContent='Repetir'});
B1.addEventListener('click',()=>{if(!cur||busy)return;if(pa.ended||B1.textContent==='Repetir'){pa.currentTime=0;show(-1);play()}else if(!pa.paused){pa.pause();cancelAnimationFrame(raf);run(false);B1.textContent='Reanudar'}else play()});
B2.addEventListener('click',()=>exit());
async function start(e){
if(busy)return;busy=true;cur=e;au.pause();setLines(e);T.textContent='0:00';B1.textContent='Pausar';P.classList.add('on');
let url=null;try{url=await preview(e)}catch(_){}
if(!url){quick();pl.dataset.fb='1';pl.click();delete pl.dataset.fb;return}
pa.src=url;
const s=rel(stage),t=rel(SL);cd=makeCd(e,s);
const dx=t.x-s.x,dy=t.y-s.y,sx=s.w*.55,tf=(x,y,r,k)=>`translate(${x}px,${y}px) perspective(600px) rotateX(${r}deg) scale(${k})`;
stage.animate([{transform:'none'},{transform:'translateX(-14px) rotate(-2deg)'},{transform:'none'}],{duration:900,easing:'ease-in-out'});
await cd.animate([{transform:tf(0,0,0,.9),opacity:0,offset:0},{transform:tf(sx,0,0,.95),opacity:1,offset:.28},{transform:tf(sx,0,0,.95),opacity:1,offset:.38},{transform:tf(dx,dy-30,0,.8),opacity:1,offset:.72},{transform:tf(dx,dy,82,.8),opacity:1,offset:.93},{transform:tf(dx,dy,82,.8),opacity:0,offset:1}],{duration:1900,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'}).finished.catch(()=>{});
if(!cur)return;cd.remove();cd=null;P.classList.add('in');P.scrollIntoView({behavior:'smooth',block:'center'});busy=false;pa.currentTime=0;play()}
async function exit(){
if(busy||!cur)return;busy=true;pa.pause();cancelAnimationFrame(raf);run(false);const e=cur;
detail.scrollTo({top:0,behavior:'smooth'});await wait(500);
const s=rel(stage),t=rel(SL);cd=makeCd(e,s);P.classList.remove('in');
const dx=t.x-s.x,dy=t.y-s.y,sx=s.w*.55,tf=(x,y,r,k)=>`translate(${x}px,${y}px) perspective(600px) rotateX(${r}deg) scale(${k})`;
await cd.animate([{transform:tf(dx,dy,82,.8),opacity:0,offset:0},{transform:tf(dx,dy,82,.8),opacity:1,offset:.12},{transform:tf(dx,dy-30,0,.8),opacity:1,offset:.35},{transform:tf(sx,0,0,.95),opacity:1,offset:.7},{transform:tf(sx,0,0,.95),opacity:1,offset:.78},{transform:tf(0,0,0,.9),opacity:0,offset:1}],{duration:1700,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'}).finished.catch(()=>{});
stage.animate([{transform:'none'},{transform:'translateX(-10px) rotate(-1.5deg)'},{transform:'none'}],{duration:700,easing:'ease-in-out'});
quick()}
function quick(){pa.pause();cancelAnimationFrame(raf);if(cd){cd.remove();cd=null}P.classList.remove('on','in','run');cur=null;busy=false}
detail.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('#pl');if(!b||b.dataset.fb)return;const e=find();if(!e)return;ev.preventDefault();ev.stopImmediatePropagation();if(cur){B1.click();return}start(e)},true);
back.addEventListener('click',()=>{if(cur)quick()});
new MutationObserver(()=>{if(!detail.classList.contains('open')&&cur)quick()}).observe(detail,{attributes:true,attributeFilter:['class']});
})();
