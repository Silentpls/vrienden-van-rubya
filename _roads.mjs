import fs from 'fs';
const rd=f=>JSON.parse(fs.readFileSync('_osm/'+f,'utf8')).elements;
function dp(pts,tol){ if(pts.length<3)return pts; const [a,b]=[pts[0],pts.at(-1)];let mx=0,mi=0;
  for(let i=1;i<pts.length-1;i++){const d=dist(pts[i],a,b);if(d>mx){mx=d;mi=i}}
  if(mx<=tol)return [a,b]; return [...dp(pts.slice(0,mi+1),tol).slice(0,-1),...dp(pts.slice(mi),tol)]; }
function dist(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy;if(!l)return Math.hypot(p[0]-a[0],p[1]-a[1]);
  let t=((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l;t=Math.max(0,Math.min(1,t));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)}
const path=(ways,tol)=>ways.map(w=>{const pts=dp(w.geometry.map(g=>[g.lon,g.lat]),tol);if(pts.length<2)return '';
  return 'M'+pts.map(p=>(p[0]*100).toFixed(1)+' '+(-p[1]*100).toFixed(1)).join('L')}).join('');
const all=rd('roads.json'),loc=rd('local.json');
const t1=all.filter(w=>/trunk|primary/.test(w.tags.highway)), t2=all.filter(w=>w.tags.highway==='secondary');
const out={t1:path(t1,.004),t2:path(t2,.004),t3:path(loc,.0012)};
const pl=rd('places.json').filter(e=>e.tags.name);
const want=['Muleba','Kayanga','Bugene','Biharamulo','Karagwe','Masaka','Mutukula','Geita','Sengerema','Kemondo','Kamachumu','Nshamba','Ibwera','Katoke'];
out.towns=want.map(n=>{const e=pl.filter(x=>x.tags.name===n).sort((a,b)=>({city:0,town:1,village:2}[a.tags.place]-{city:0,town:1,village:2}[b.tags.place]))[0];return e&&[+e.lon.toFixed(3),+e.lat.toFixed(3),n,e.tags.place]}).filter(Boolean);
fs.writeFileSync('assets/roads.js','window.ROADS='+JSON.stringify(out)+';');
console.log(Object.entries(out).map(([k,v])=>k+':'+v.length).join(' '));console.log(out.towns.map(t=>t.join('|')).join(' '));
