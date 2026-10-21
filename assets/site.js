document.documentElement.classList.add('js');
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

/* header: transparent on hero, solid after scroll */
const hdr=$('.hdr'), fd=$('.float-donate');
const noHero=!$('.hero');
const onScroll=()=>{const y=scrollY;hdr.classList.toggle('scrolled',noHero||y>40);fd&&fd.classList.toggle('show',y>600)};
addEventListener('scroll',onScroll,{passive:true});onScroll();
$('.burger')?.addEventListener('click',()=>{const o=document.body.classList.toggle('menu-open');$('.burger').setAttribute('aria-expanded',o)});
$$('.drawer a').forEach(a=>a.addEventListener('click',()=>document.body.classList.remove('menu-open')));

/* reveal + counters */
const count=el=>{const to=+el.dataset.count,d=1600,t0=performance.now(),f=new Intl.NumberFormat('nl-NL');
  const tick=t=>{const p=Math.min(1,(t-t0)/d),e=1-Math.pow(1-p,3);el.textContent=(el.dataset.pre||'')+f.format(Math.round(to*e))+(el.dataset.suf||'');p<1&&requestAnimationFrame(tick)};
  reduce?el.textContent=(el.dataset.pre||'')+f.format(to)+(el.dataset.suf||''):requestAnimationFrame(tick)};
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('in');$$('[data-count]',e.target).forEach(count);if(e.target.dataset.count)count(e.target);io.unobserve(e.target)}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
$$('[data-reveal],.tl,.plan,.road').forEach(el=>io.observe(el));

/* lightbox */
const lb=$('dialog.lb');
if(lb){$$('.gal button').forEach(b=>b.addEventListener('click',()=>{$('img',lb).src=b.dataset.full;$('img',lb).alt=b.firstElementChild.alt;$('p',lb).textContent=b.dataset.cap||'';lb.showModal()}));
  lb.addEventListener('click',e=>{if(e.target===lb||e.target.tagName==='BUTTON')lb.close()})}

/* story tabs */
$$('.stories').forEach(w=>{const tabs=$$('[role=tab]',w),st=$$('.story',w);
  tabs.forEach((t,i)=>t.addEventListener('click',()=>{tabs.forEach((x,j)=>x.setAttribute('aria-selected',i===j));st.forEach((s,j)=>s.classList.toggle('on',i===j))}))});

/* copy iban */
$$('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{const t=b.dataset.copy,o=b.textContent;try{await navigator.clipboard.writeText(t)}catch(e){}b.textContent='Gekopieerd ✓';setTimeout(()=>b.textContent=o,1800)}));

/* compare slider */
$$('.cmp').forEach(c=>{const i=$('input',c);const set=()=>c.style.setProperty('--p',i.value+'%');i.addEventListener('input',set);set();
  if(!reduce){let t0=null;const demo=t=>{t0??=t;const k=(t-t0)/2200;if(k<1&&!c.dataset.touched){i.value=50+Math.sin(k*Math.PI*2)*18*(1-k);set();requestAnimationFrame(demo)}};
    new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){requestAnimationFrame(demo);o.disconnect()}},{threshold:.6}).observe(c);i.addEventListener('pointerdown',()=>c.dataset.touched=1)}});

/* impact picker */
const pk=$('.picker');
if(pk){const person='<svg viewBox="0 0 30 46" fill="currentColor"><circle cx="15" cy="9" r="7"/><path d="M3 44V27a12 12 0 0 1 24 0v17z"/></svg>';
  const ppl=$('.people',pk),num=$('.num',pk),line=$('.line',pk),fg=$('.fg',pk),pct=$('.pct',pk),inp=$('input[type=number]',pk),btns=$$('.amt button',pk);
  const C=2*Math.PI*60,f=new Intl.NumberFormat('nl-NL');let shown=0;
  ppl.innerHTML=person.repeat(12);const P=$$('svg',ppl);
  const set=v=>{v=Math.max(0,Math.round(+v||0));const n=Math.floor(v/35),yr=v/1250;
    num.textContent=f.format(n);
    line.innerHTML=n===0?'Elk bedrag helpt. Vanaf <b>€ 35</b> geeft u één patiënt een menswaardig sterfbed.':`Met <b>€ ${f.format(v)}</b> begeleidt u <b>${n} patiënt${n==1?'':'en'}</b> in de palliatieve zorg van Rubya (€ 35 per patiënt).`;
    P.forEach((p,i)=>{const on=i<n;if(on&&!p.classList.contains('on')){p.classList.remove('pop');void p.getBoundingClientRect();p.classList.add('pop')}p.classList.toggle('on',on)});
    ppl.dataset.more=n>12?'+'+(n-12):'';
    fg.style.strokeDasharray=C;fg.style.strokeDashoffset=C*(1-Math.min(1,yr));pct.textContent=Math.round(Math.min(1,yr)*100)+'%';
    btns.forEach(b=>b.setAttribute('aria-pressed',+b.dataset.v===v));inp.value=btns.some(b=>+b.dataset.v===v)?'':(v||'')};
  btns.forEach(b=>b.addEventListener('click',()=>set(b.dataset.v)));inp.addEventListener('input',()=>set(inp.value));set(100);}

/* contact form -> mailto (no backend on a static site) */
$('#contactform')?.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(e.target);
  const body=`Naam: ${d.get('naam')}\nE-mail: ${d.get('email')}\nGevonden via: ${d.get('via')}\nNieuwsbrief: ${d.get('nb')?'ja':'nee'}\n\n${d.get('msg')}`;
  location.href=`mailto:info@vriendenvanrubya.org?subject=${encodeURIComponent('Bericht via de website')}&body=${encodeURIComponent(body)}`;
  $('.sent',e.target).hidden=false});
$('#nbform')?.addEventListener('submit',e=>{e.preventDefault();const m=new FormData(e.target).get('email');
  location.href=`mailto:info@vriendenvanrubya.org?subject=${encodeURIComponent('Ik ben Vriend van Rubya')}&body=${encodeURIComponent('Mijn e-mailadres voor de nieuwsbrief: '+m)}`});
