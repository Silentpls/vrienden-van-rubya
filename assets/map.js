/* Scroll-triggered map story: Afrika -> Tanzania -> Rubya.
   Scroll only TRIGGERS a time-based autoplay (forward); scrolling further down and then back up triggers the reverse. */
(()=>{
const sec=document.querySelector('.mapsec'); if(!sec||!window.MAP) return;
const stage=sec.querySelector('.map-stage'), svg=sec.querySelector('svg'), hint=sec.querySelector('.map-hint');
const steps=[...sec.querySelectorAll('.mc-step')], dots=[...sec.querySelectorAll('.mc-dots i')];
const NS='http://www.w3.org/2000/svg';
const el=(n,a={},p)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);p&&p.appendChild(e);return e};
const X=lon=>lon*100, Y=lat=>-lat*100;
const RUBYA=[31.618,-1.752];

/* world */
const defs=el('defs',{},svg);
const g=el('radialGradient',{id:'glow'},defs);
el('stop',{offset:'0','stop-color':'#7a5238','stop-opacity':'.4'},g);el('stop',{offset:'1','stop-color':'#7a5238','stop-opacity':'0'},g);
const land=el('g',{},svg);
Object.entries(MAP).forEach(([k,v])=>el('path',{d:v.d,class:k==='TZA'?'m-tz':'m-land'},land));
/* Lake Victoria (hand-traced, approximate) as a smoothed closed curve */
const L=[[31.80,-.99],[31.80,-.6],[31.95,-.3],[32.2,0],[32.46,.08],[32.75,.3],[33.2,.3],[33.6,.2],[34,.05],[34.3,-.05],[34.75,-.1],[34.55,-.38],[34.25,-.4],[34.2,-.7],[34.05,-1],[33.9,-1.25],[33.8,-1.55],[33.4,-1.75],[33.1,-2.1],[32.95,-2.5],[32.6,-2.45],[32.3,-2.35],[32.1,-2.1],[31.95,-1.9],[31.85,-1.6],[31.82,-1.3]].map(([a,b])=>[X(a),Y(b)]);
let d=`M${L[0]}`;for(let i=0;i<L.length;i++){const p0=L[(i-1+L.length)%L.length],p1=L[i],p2=L[(i+1)%L.length],p3=L[(i+2)%L.length];
  d+=`C${p1[0]+(p2[0]-p0[0])/6},${p1[1]+(p2[1]-p0[1])/6} ${p2[0]-(p3[0]-p1[0])/6},${p2[1]-(p3[1]-p1[1])/6} ${p2[0]},${p2[1]}`}
el('path',{d:d+'Z',class:'m-lake'},svg);

const sm=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t)};
/* roads (OSM, ODbL): main roads only, fade in as the camera zooms */
const roads=window.ROADS?['t1'].map(t=>{const e=el('path',{d:ROADS[t],class:'m-road '+t},svg);return e}):[];
const ROAD_VIS={t1:vh=>1-sm(1500,2600,vh)};

/* labels: [lon,lat,text,class,px,visible(vh)->0..1] */
const labels=[
 [15,18,'Afrika','m-lbl',30,vh=>sm(2600,4200,vh)],
 [34.6,-6.2,'Tanzania','m-lbl',17,vh=>sm(500,900,vh)*(1-sm(2500,4200,vh))],
 [33.0,-1.0,'Victoriameer','m-lbl',13,vh=>sm(300,700,vh)*(1-sm(1100,1500,vh))],
 [39.28,-6.79,'Dar es Salaam','m-city',13,vh=>sm(500,800,vh)*(1-sm(1800,2400,vh)),1],
 [35.74,-6.17,'Dodoma','m-city',13,vh=>sm(500,800,vh)*(1-sm(1800,2400,vh)),1],
 [32.9,-2.52,'Mwanza','m-city',13,vh=>sm(150,500,vh)*(1-sm(1800,2400,vh)),1],
 [32.58,.35,'Kampala','m-city',13,vh=>sm(150,500,vh)*(1-sm(1800,2400,vh)),1],
 [31.81,-1.33,'Bukoba','m-city',13,vh=>1-sm(450,900,vh),1]
].concat((window.ROADS?ROADS.towns:[]).map(([lo,la,n,k])=>[lo,la,n,'m-city',k==='village'?10:12,k==='village'?(vh=>1-sm(380,520,vh)):k==='town'?(vh=>1-sm(650,1000,vh)):(vh=>1-sm(1500,2400,vh)),1])).map(([lo,la,t,c,px,vis,dot])=>{
  const e=el('text',{class:c},svg);e.textContent=t;
  const o={e,lo,la,px,vis,dot:dot?el('circle',{class:'m-dot'},svg):null};return o});
const pin=el('g',{},svg);
const glow=el('circle',{class:'m-glow',fill:'url(#glow)'},pin);
const rings=['','r2','r3'].map(c=>el('circle',{class:'m-ring '+c},pin));
const dot=el('circle',{class:'m-pin',stroke:'#fff','stroke-width':2.5,'vector-effect':'non-scaling-stroke'},pin);
const ptxt=el('text',{class:'m-city',style:'font-weight:800;fill:#5a3a28'},pin);ptxt.textContent='Rubya Hospital';

/* camera */
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2, seg=(p,a,b)=>Math.min(1,Math.max(0,(p-a)/(b-a))), lerp=(a,b,t)=>a+(b-a)*t;
const K=[ {x:X(17),y:Y(2),vh:7700,mw:7500}, {x:X(34.9),y:Y(-6.3),vh:1250,mw:1250}, {x:X(RUBYA[0]),y:Y(RUBYA[1])+8,vh:150,mw:210} ];
let W=1,H=1;
const size=()=>{W=stage.clientWidth;H=stage.clientHeight};
function render(p){
  const s1=ease(seg(p,.04,.5)), s2=ease(seg(p,.52,.96));
  const cam=k=>K.map(c=>({...c,vh:Math.max(c.vh,c.mw*H/W)}));
  const [A,B,C]=cam();
  const mix=(a,b,t)=>({x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t),vh:Math.exp(lerp(Math.log(a.vh),Math.log(b.vh),t))});
  const c=mix(mix(A,B,s1),C,s2), wide=W>820, fx=wide?.66:.5, fy=wide?.5:.32;
  const vw=c.vh*W/H;
  svg.setAttribute('viewBox',`${c.x-vw*fx} ${c.y-c.vh*fy} ${vw} ${c.vh}`);
  const k=c.vh/H;
  labels.forEach(l=>{const o=l.vis(c.vh);l.e.setAttribute('x',X(l.lo));l.e.setAttribute('y',Y(l.la)+(l.dot?-l.px*.7*k:0));l.e.style.fontSize=l.px*k+'px';l.e.style.opacity=o;
    if(l.dot){l.e.setAttribute('x',X(l.lo)+l.px*.6*k);l.e.style.textAnchor='start';l.dot.setAttribute('cx',X(l.lo));l.dot.setAttribute('cy',Y(l.la));l.dot.setAttribute('r',3.5*k);l.dot.style.opacity=o}
    else l.e.style.letterSpacing=(l.px>20?.4:.14)+'em'});
  roads.forEach(e=>{const o=ROAD_VIS[e.classList[1]](c.vh);e.style.opacity=o;e.style.display=o<.01?'none':''});
  const rx=X(RUBYA[0]),ry=Y(RUBYA[1]);
  pin.setAttribute('transform',`translate(${rx} ${ry})`);
  glow.setAttribute('r',90*k);rings.forEach(r=>r.setAttribute('r',10*k));dot.setAttribute('r',Math.max(5,7*(1-.35*seg(p,0,.6)))*k);
  ptxt.setAttribute('x',16*k);ptxt.setAttribute('y',-13*k);ptxt.style.fontSize=14*k+'px';ptxt.style.opacity=sm(.55,.8,p);
  const st=p<.3?0:p<.82?1:2;
  steps.forEach((e,i)=>e.classList.toggle('on',i===st));dots.forEach((e,i)=>e.classList.toggle('on',i<=st));
}

/* trigger engine: 0 = Afrika, 1 = Rubya */
let p=0,dir=0,last=0,state='start',armedBack=false,rearm=true;
const DUR={fwd:6200,rev:3600};
function frame(t){
  const dt=Math.min(50,t-last);last=t;
  p=Math.min(1,Math.max(0,p+dir*dt/DUR[dir>0?'fwd':'rev']));
  render(p);
  if(dir>0&&p>=1){dir=0;state='end';armedBack=false}
  else if(dir<0&&p<=0){dir=0;state='start';rearm=false}
  if(dir)requestAnimationFrame(frame);
}
const go=d=>{if(dir===d)return;const was=dir;dir=d;state='play';hint?.classList.add('off');if(!was){last=performance.now();requestAnimationFrame(frame)}};
function onScroll(){
  const r=sec.getBoundingClientRect(),vh=innerHeight,y=-r.top;      // y = px scrolled past the section top (stage pinned while 0<y<travel)
  const travel=r.height-vh;
  if(y<-vh*.5)rearm=true;                                           // left the section upwards -> forward can fire again
  if(state==='start'&&rearm&&y>-vh*.12)go(1);
  if(state==='end'){
    if(y>travel*.55)armedBack=true;                                 // scrolled well past the end state
    if(armedBack&&y<travel*.3)go(-1);                               // ...and now back up -> zoom out
  }
  if(state==='play'&&dir>0&&y<-vh*.9){/* scrolled away mid-play: let it finish */}
}
addEventListener('scroll',onScroll,{passive:true});
addEventListener('resize',()=>{size();render(p)});
size();
if(matchMedia('(prefers-reduced-motion:reduce)').matches){p=1;state='end';render(1);addEventListener('scroll',()=>{},{passive:true})}
else{render(0);onScroll()}
window.__map={render,get p(){return p},get state(){return state}};
})();
