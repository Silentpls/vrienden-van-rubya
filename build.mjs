// Static site generator: `node build.mjs` writes every page + assets/mapdata.js
import fs from 'fs';
const OUT = new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1').replace(/%20/g, ' ');

/* ---------- shared bits ---------- */
const IBAN = 'NL66ABNA0624513211';
const svg = (p, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${p}</svg>`;
const I = {
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  up: svg('<path d="M7 17 17 7M8 7h9v9"/>'),
  heart: svg('<path d="M12 21s-7-4.4-9.3-9A5.2 5.2 0 0 1 12 6.6 5.2 5.2 0 0 1 21.3 12C19 16.6 12 21 12 21z"/>'),
  cap: svg('<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5"/>'),
  drop: svg('<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>'),
  home: svg('<path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
  laptop: svg('<path d="M4 5h16v11H4zM2 19h20"/>'),
  pulse: svg('<path d="M3 12h4l2-6 4 12 2-6h6"/>'),
  bike: svg('<circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><path d="m6 16 4-8h5l3 8M10 8H8"/>'),
  cross: svg('<path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z"/>'),
  bed: svg('<path d="M3 18V7M3 13h18v5M21 13a3 3 0 0 0-3-3h-7v3"/>'),
  users: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>'),
  doc: svg('<path d="M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6"/>'),
  mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  eye: svg('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  shield: svg('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
  swap: svg('<path d="M7 7h12l-3-3M17 17H5l3 3"/>'),
  lr: svg('<path d="m8 6-5 6 5 6M16 6l5 6-5 6"/>'),
};
const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="21.5" cy="10" r="3.6" fill="currentColor"/><path d="M3 25c4.5-9 9-10 13.5-4 2-3.2 5-5 12.5 4z" fill="currentColor"/><path d="M5 28.5h22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const FAVICON = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#7a5238"/><g fill="#faf6f0"><circle cx="21" cy="11" r="3"/><path d="M6 23c3.5-7 7-8 10.5-3.5 1.7-2.6 4-4 9.5 3.5z"/></g></svg>')}`;

const NAV = [
  { t: 'Home', h: 'index.html' },
  { t: 'Stichting', h: 'stichting.html', sub: [
    ['Over de stichting', 'stichting.html', 'Ons verhaal sinds 1997'],
    ['Doelstelling & plan van aanpak', 'stichting.html#doelstelling', 'Zo werken wij'],
    ['Bestuur', 'stichting.html#bestuur', 'Wie wij zijn'],
    ['Rapporten & verslagen', 'rapporten.html', 'Jaarverslagen en beleidsplan'],
    ['ANBI-informatie', 'anbi.html', 'Giften zijn aftrekbaar']] },
  { t: 'Ziekenhuis', h: 'ziekenhuis.html' },
  { t: 'Projecten', h: 'projecten.html', sub: [
    ['Alle projecten', 'projecten.html', 'Overzicht'],
    ['Opleiding & sponsoring', 'opleiding.html', 'Studiebeurzen, Revolving Fund'],
    ['Palliatieve zorg', 'palliatieve-zorg.html', '€ 35 per patiënt'],
    ['Drinkwatervoorziening', 'drinkwater.html', 'Watertoren en borehole'],
    ['Onderhoudsplan', 'onderhoud.html', 'Gebouwen toekomstbestendig'],
    ['ICT-project', 'ict.html', 'Digitaal ziekenhuis']] },
  { t: 'Nieuws', h: 'nieuws.html' },
  { t: 'Contact', h: 'contact.html' },
];

const header = (cur) => `
<header class="hdr"><div class="hdr-in">
  <a class="logo" href="index.html" aria-label="Stichting Vrienden van Rubya, home"><span class="logo-chip">${LOGO}</span><span><b>Vrienden van Rubya</b><small>Stichting · Tanzania</small></span></a>
  <ul class="nav" aria-label="Hoofdmenu">${NAV.map(n => `<li><a class="top" href="${n.h}"${n.h === cur || (n.sub && n.sub.some(s => s[1].split('#')[0] === cur)) ? ' aria-current="page"' : ''}>${n.t}${n.sub ? svg('<path d="m6 9 6 6 6-6"/>', 'class="car"') : ''}</a>${n.sub ? `<div class="sub">${n.sub.map(s => `<a href="${s[1]}">${s[0]}<small>${s[2]}</small></a>`).join('')}</div>` : ''}</li>`).join('')}</ul>
  <div class="hdr-cta"><a class="btn btn-primary btn-sm" href="doneren.html">Doneer ${I.heart}</a><button class="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button></div>
</div></header>
<div class="drawer" aria-label="Menu">${NAV.map(n => `<a href="${n.h}">${n.t}</a>${n.sub ? `<div class="s">${n.sub.map(s => `<a href="${s[1]}">${s[0]}</a>`).join('')}</div>` : ''}`).join('')}<a class="btn btn-light" href="doneren.html">Doneer nu</a></div>
<a class="btn btn-primary float-donate" href="doneren.html">Doneer ${I.heart}</a>`;

const footer = () => `
<footer class="ftr"><div class="container">
  <div class="ftr-grid">
    <div><a class="logo" href="index.html"><span class="logo-chip">${LOGO}</span><span><b>Vrienden van Rubya</b><small>Stichting · sinds 1997</small></span></a>
      <p style="max-width:34ch;font-size:.95rem">Wij zijn vrijwilligers. Uw gift komt voor 100% ten goede aan Rubya Hospital in Tanzania.</p>
      <img class="official" src="images/logo-officieel.jpg" alt="Officieel logo: Stichting Vrienden van Rubya, Help het Rubya Ziekenhuis in Tanzania" loading="lazy"><img class="anbi" src="images/ANBI_logo1.jpg" alt="ANBI, Algemeen Nut Beogende Instelling" loading="lazy"></div>
    <div><h4>Stichting</h4><a href="stichting.html">Over de stichting</a><a href="stichting.html#doelstelling">Doelstelling</a><a href="stichting.html#bestuur">Bestuur</a><a href="rapporten.html">Rapporten &amp; verslagen</a><a href="anbi.html">ANBI</a><a href="nieuws.html">Nieuws</a></div>
    <div><h4>Projecten</h4><a href="ziekenhuis.html">Het ziekenhuis</a><a href="opleiding.html">Opleiding &amp; sponsoring</a><a href="palliatieve-zorg.html">Palliatieve zorg</a><a href="drinkwater.html">Drinkwater</a><a href="onderhoud.html">Onderhoudsplan</a><a href="ict.html">ICT-project</a></div>
    <div><h4>Steun ons</h4><a href="doneren.html">Word Vriend van Rubya</a><p style="font-size:.9rem;margin-top:.6rem">IBAN ${IBAN}<br>t.n.v. Stichting Vrienden van Rubya<br>BIC ABNANL2A</p><a href="contact.html" style="margin-top:.8rem">Contact opnemen</a></div>
  </div>
  <div class="ftr-bot"><span>© ${new Date().getFullYear()} Stichting Vrienden van Rubya · RSIN 807248496 · Echobos 21, 1358 EG Almere</span><span>Foto's: Stichting Vrienden van Rubya</span></div>
</div></footer>`;

const page = ({ file, title, desc, cur, body, extraJs = '' }) => `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} | Stichting Vrienden van Rubya</title><meta name="description" content="${desc}">
<meta property="og:title" content="${title} | Vrienden van Rubya"><meta property="og:description" content="${desc}"><meta property="og:image" content="images/Student-Revolving-Fund.jpg"><meta name="theme-color" content="#241812">
<link rel="icon" href="${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/site.css"></head>
<body>${header(cur)}<main>${body}</main>${footer()}
<dialog class="lb"><button aria-label="Sluiten">✕</button><img alt=""><p></p></dialog>
<script src="assets/site.js"></script>${extraJs}</body></html>`;

const hero = ({ img, pos = 'center', eyebrow, h1, lead, ctas = '', crumbs = '', stats = '', big = false }) => `
<section class="hero${big ? '' : ' page'}"><div class="hero-img"><img src="images/${img}" alt="" style="--pos:${pos}" fetchpriority="high"></div>
<div class="container hero-in">${crumbs ? `<div class="crumbs">${crumbs}</div>` : ''}<span class="eyebrow">${eyebrow}</span><h1 style="margin-top:.9rem">${h1}</h1><p class="lead">${lead}</p>${ctas ? `<div class="hero-cta">${ctas}</div>` : ''}${stats}</div>${big ? '<div class="scroll-cue" aria-hidden="true"></div>' : ''}</section>`;
const crumb = (...p) => `<a href="index.html">Home</a> / ${p.join(' / ')}`;
const btn = (h, t, c = 'btn-primary', i = I.arrow) => `<a class="btn ${c}" href="${h}">${t} ${i}</a>`;

const band = (h = 'Word Vriend van Rubya', p = 'Wij zijn een stichting van vrijwilligers. Uw gift gaat dus voor 100% naar de projecten in Tanzania — en omdat wij ANBI zijn, is uw gift aftrekbaar van de belasting.') => `
<section class="section" style="padding-top:0"><div class="container"><div class="band" data-reveal>
  <div><span class="eyebrow">Doe mee</span><h2>${h}</h2><p class="lead">${p}</p><div class="hero-cta">${btn('doneren.html', 'Bekijk wat uw gift doet', 'btn-light')}${btn('contact.html', 'Stel een vraag', 'btn-line', '')}</div></div>
  <div class="iban"><small>Bankrekening</small><code>${IBAN}</code><small>t.n.v. Stichting Vrienden van Rubya · BIC ABNANL2A</small><div class="row" style="margin-top:1.2rem"><button class="btn btn-light btn-sm" data-copy="${IBAN}">Kopieer IBAN</button></div></div>
</div></div></section>`;

const gal = (items) => `<div class="gal">${items.map(([f, c]) => `<button data-full="images/${f}" data-cap="${c}" aria-label="Vergroot: ${c}"><img src="images/${f}" alt="${c}" loading="lazy"></button>`).join('')}</div>`;
const tl = (items, cls = '') => `<div class="tl ${cls}"><i class="fill"></i>${items.map(([t, h, p, tag]) => `<div class="tl-item" data-reveal><time>${t}</time>${tag ? `<span class="tag">${tag}</span>` : ''}<h3>${h}</h3><p>${p}</p></div>`).join('')}</div>`;
const facts = (a) => `<div class="facts">${a.map(([b, t]) => `<span class="fact"><b>${b}</b>${t}</span>`).join('')}</div>`;
const head = (e, h, p = '') => `<div class="head" data-reveal><span class="eyebrow">${e}</span><h2>${h}</h2>${p ? `<p class="lead">${p}</p>` : ''}</div>`;

/* ---------- plan-van-aanpak drawing (donor -> stichting -> ziekenhuis -> speerpunten) ---------- */
const PILLS = [
  ['Studiebeurzen', 'Verpleegkundigen leren', 'opleiding.html', I.cap],
  ['Bijscholing', 'Personeel blijft leren', 'palliatieve-zorg.html', I.pulse],
  ['Onderhoud', 'Gebouwen op orde', 'onderhoud.html', I.home],
  ['Overige projecten', 'Water, ICT en meer', 'projecten.html', I.drop],
];
const icon = (inner, x, y, s = 1.3) => `<g class="ic" transform="translate(${x} ${y}) scale(${s})">${inner.replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>`;
const planDiagram = () => {
  const ys = [70, 190, 310, 430];
  return `<div class="plan" aria-label="Plan van aanpak: van uw gift naar Rubya Hospital"><svg viewBox="0 0 1180 500" role="img" aria-labelledby="pt"><title id="pt">U geeft aan de Stichting, de Stichting steunt Rubya Hospital, het ziekenhuis gebruikt het voor vier speerpunten.</title>
  <path class="route" pathLength="1" style="--d:.5" d="M190 250H290"/><path class="route" pathLength="1" style="--d:1.3" d="M500 250H600"/>
  ${ys.map((y, i) => `<path class="route" pathLength="1" style="--d:${2.1 + i * .15}" d="M810 250C860 250 860 ${y} 910 ${y}"/>`).join('')}
  <text class="tag" x="240" y="232" text-anchor="middle" style="opacity:.9">uw gift</text><text class="tag" x="550" y="232" text-anchor="middle">100%</text>
  <g class="node" style="--d:0"><rect x="0" y="195" width="190" height="110" rx="55"/>${icon(I.heart, 80, 212, 1.15)}<text class="t1" x="95" y="270" text-anchor="middle">U</text><text class="t2" x="95" y="290" text-anchor="middle">Vriend van Rubya</text></g>
  <g class="node solid" style="--d:.8"><rect x="290" y="185" width="210" height="130" rx="65"/>${icon(I.users, 378, 203, 1.4)}<text class="t1" x="395" y="262" text-anchor="middle">Stichting</text><text class="t2" x="395" y="283" text-anchor="middle">alleen vrijwilligers</text></g>
  <g class="node" style="--d:1.6"><rect x="600" y="185" width="210" height="130" rx="65"/>${icon(I.cross, 688, 203, 1.4)}<text class="t1" x="705" y="262" text-anchor="middle">Rubya Hospital</text><text class="t2" x="705" y="283" text-anchor="middle">Tanzania</text></g>
  ${PILLS.map((p, i) => `<a href="${p[2]}"><g class="node" style="--d:${2.5 + i * .15}" transform-origin="0 0"><rect x="910" y="${ys[i] - 38}" width="270" height="76" rx="38"/>${icon(p[3], 934, ys[i] - 16, 1.2)}<text class="t1" x="980" y="${ys[i] - 2}">${p[0]}</text><text class="t2" x="980" y="${ys[i] + 18}">${p[1]}</text></g></a>`).join('')}
  </svg>
  <div class="plan-steps">${[['U geeft', 'Eenmalig of periodiek, vanaf elk bedrag.'], ['Stichting Vrienden van Rubya', 'Alleen vrijwilligers. 100% van uw gift gaat naar de projecten.'], ['Rubya Hospital', 'Samen met het ziekenhuismanagement bepalen we wat het hardst nodig is.'], ['Vier speerpunten', 'Studiebeurzen · bijscholing · onderhoud · overige projecten']].map((s, i) => `<div class="pstep"><b class="n">${i + 1}</b><h3>${s[0]}</h3><p>${s[1]}</p></div>`).join('')}</div></div>`;
};

/* winding road: the 4 steps of every project */
const bez = (p0, p1, p2, p3, t) => { const u = 1 - t; return [0, 1].map(k => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]); };
const roadDiagram = (steps) => {
  const segs = [[[30, 330], [230, 330], [220, 120], [420, 120]], [[420, 120], [620, 120], [560, 320], [760, 320]], [[760, 320], [940, 320], [900, 100], [1070, 90]]];
  const d = `M30 330C230 330 220 120 420 120S560 320 760 320S900 100 1070 90`;
  const at = u => { const s = Math.min(2, Math.floor(u * 3)); return bez(...segs[s], u * 3 - s); };
  const us = [.06, .33, .62, .93], up = [false, true, false, true];
  return `<div class="road"><svg viewBox="0 0 1100 460" role="img" aria-label="Plan van aanpak in vier stappen"><path class="base" d="${d}"/><path class="draw" d="${d}"/>
  ${us.map((u, i) => { const [x, y] = at(u), ty = up[i] ? y - 78 : y + 62; return `<g class="st" style="--d:${.4 + i * .5}"><circle class="o" cx="${x}" cy="${y}" r="26"/><text class="n" x="${x}" y="${y + 8}">${i + 1}</text><text class="h" x="${x}" y="${ty}" text-anchor="middle">${steps[i][0]}</text>${steps[i][1].map((l, j) => `<text class="p" x="${x}" y="${ty + 22 + j * 19}" text-anchor="middle">${l}</text>`).join('')}</g>`; }).join('')}
  <circle class="travel" r="9"><animateMotion dur="10s" repeatCount="indefinite" path="${d}" keyPoints="0;1" keyTimes="0;1" calcMode="linear"/></circle></svg>
  <div class="road-list">${steps.map((s, i) => `<div class="pstep"><b class="n">${i + 1}</b><h3>${s[0]}</h3><p>${s[2]}</p></div>`).join('')}</div></div>`;
};

/* revolving fund cycle */
const cycleDiagram = () => {
  const N = [[320, 70, 'Uw gift', 'gaat in het fonds', 'm'], [470, 220, 'Student studeert', 'opleiding voorgefinancierd', 's'], [320, 370, 'Afgestudeerd', 'werkt voor de gezondheidszorg', 'm'], [170, 220, 'Betaalt terug', 'een deel van het bedrag', 'e']];
  return `<div class="cycle" data-reveal><svg viewBox="-60 0 800 450" role="img" aria-label="Revolving Fund: gift, student, afgestudeerde, terugbetaling, volgende student"><circle class="arc" cx="320" cy="220" r="150"/>
  <text class="mid" x="320" y="215">Revolving</text><text class="mid" x="320" y="243">Fund</text>
  ${N.map(([x, y, l, s, a], i) => `<g class="cn"><circle cx="${x}" cy="${y}" r="34" fill="#fff"/><g class="ic" fill="none" stroke="#7a5238" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" transform="translate(${x - 16} ${y - 16}) scale(1.33)">${[I.heart, I.cap, I.users, I.swap][i].replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
  <text class="l" x="${a === 's' ? x + 48 : a === 'e' ? x - 48 : x}" y="${a === 'm' ? (y < 200 ? y - 52 : y + 62) : y - 2}" style="text-anchor:${a === 's' ? 'start' : a === 'e' ? 'end' : 'middle'}">${l}</text>
  <text class="s" x="${a === 's' ? x + 48 : a === 'e' ? x - 48 : x}" y="${a === 'm' ? (y < 200 ? y - 34 : y + 80) : y + 17}" style="text-anchor:${a === 's' ? 'start' : a === 'e' ? 'end' : 'middle'}">${s}</text></g>`).join('')}
  </svg></div>`;
};

const pages = [];
const add = (p) => pages.push(p);

/* =========================================================== HOME */
add({
  file: 'index.html', title: 'Goede zorg in Tanzania', cur: 'index.html',
  desc: 'Stichting Vrienden van Rubya ondersteunt Rubya Hospital in Noordwest-Tanzania. Uw gift komt voor 100% ten goede aan de lokale projecten.',
  extraJs: '<script src="assets/mapdata.js"></script><script src="assets/map.js"></script>',
  body: `
${hero({
    big: true, img: 'Student-Revolving-Fund.jpg', pos: 'center 30%', eyebrow: 'Stichting Vrienden van Rubya · sinds 1997',
    h1: 'Goede zorg begint in de heuvels boven het Victoriameer.',
    lead: 'Rubya Hospital zorgt voor 400.000 mensen in Noordwest-Tanzania. Wij zijn vrijwilligers die dat ziekenhuis sterker maken, en uw gift gaat er voor 100% naartoe.',
    ctas: btn('doneren.html', 'Doneer nu', 'btn-light', I.heart) + btn('#rubya', 'Ontdek Rubya', 'btn-line', I.arrow.replace('M5 12h14M13 6l6 6-6 6', 'M12 5v14M6 13l6 6 6-6')),
    stats: `<div class="stat-strip"><span class="chip-stat"><b>400.000</b>mensen in het verzorgingsgebied</span><span class="chip-stat"><b>4.000+</b>bevallingen per jaar</span><span class="chip-stat"><b>100%</b>van uw gift naar Tanzania</span><span class="chip-stat"><b>ANBI</b>fiscaal aftrekbaar</span></div>`
  })}

<section class="section"><div class="container split">
  <div data-reveal><span class="eyebrow">Waarom Rubya</span><h2 style="margin:.7rem 0 1.2rem">Een ziekenhuis waar een heel gebied op rekent.</h2>
  <p class="lead">Rubya is een dorp in een landelijk gebied met veel verspreide dorpskernen en weinig infrastructuur. In 1956 stichtten Nederlandse zusters hier een ziekenhuis, in de heuvels boven het Victoriameer.</p>
  <p class="muted">Tegenwoordig komen patiënten van alle kanten, vaak met complicaties na een behandeling elders: keizersneden, verkeersongevallen, diabetes en hoge bloeddruk. Het ziekenhuis wordt steeds meer een verwijsziekenhuis, maar de middelen blijven schaars.</p>
  <div class="hero-cta">${btn('ziekenhuis.html', 'Het verhaal van het ziekenhuis', 'btn-ghost')}</div></div>
  <figure class="ph" data-reveal style="aspect-ratio:4/4.4"><img src="images/Front-Rubya-Hospital.jpg" alt="De hoofdingang van Rubya Hospital met een stoffig zandpad ervoor" loading="lazy"><figcaption>De hoofdingang van Rubya Hospital</figcaption></figure>
</div></section>

<section class="mapsec" id="rubya" aria-label="Waar ligt Rubya? Een reis van Afrika naar Rubya">
  <div class="map-stage"><svg preserveAspectRatio="xMidYMid meet" role="img" aria-label="Kaart die inzoomt van Afrika naar Tanzania en Rubya"></svg>
    <div class="map-card"><div class="mc-steps">
      <div class="mc-step on"><span class="eyebrow">Waar ligt Rubya?</span><h2>Eerst: een heel continent.</h2><p>Aan de oostkant van Afrika ligt Tanzania, een land van bijna tien keer Nederland met nog maar weinig ziekenhuizen. Wij reizen mee naar één punt op die kaart.</p></div>
      <div class="mc-step"><span class="eyebrow">Noordwest-Tanzania</span><h2>De Kagera-regio, aan het Victoriameer.</h2><p>Hier, aan de westkant van het grootste meer van Afrika, ligt het district Muleba. Een groen en heuvelachtig gebied met kleine dorpen en lange wegen.</p></div>
      <div class="mc-step"><span class="eyebrow">Daar is het</span><h2>Rubya Hospital.</h2><p>Ruim 80 km van Bukoba, de regionale hoofdplaats, staat een ziekenhuis waar 400.000 mensen op rekenen.</p>${facts([['162', 'bedden'], ['1956', 'gesticht'], ['300+', 'studenten']])}${btn('ziekenhuis.html', 'Lees meer over Rubya')}</div>
    </div><div class="mc-dots" aria-hidden="true"><i class="on"></i><i></i><i></i></div></div>
    <div class="map-hint">Scrol rustig door: de reis naar Rubya start vanzelf</div>
  </div>
</section>

<section class="section bg-sand" id="doelstelling"><div class="container">
  ${head('Onze doelstelling', 'Van uw gift naar een patiënt in Rubya', 'Ondersteuning van het Rubya Ziekenhuis in Noordwest-Tanzania en verbetering van de kwaliteit van de gezondheidszorg. Zo loopt uw gift van Nederland naar de afdelingen.')}
  ${planDiagram()}
  <div class="hero-cta" style="margin-top:2.5rem">${btn('stichting.html#doelstelling', 'Zo werkt ons plan van aanpak', 'btn-ghost')}</div>
</div></section>

<section class="section"><div class="container">
  ${head('Onze speerpunten', 'Waar uw gift aan werkt', 'Vier terreinen, één doel: een ziekenhuis dat sterker staat. Kies een project en kijk wat er al gebeurd is, en wat er nog nodig is.')}
  <div class="bento">
    <a class="tile a" href="opleiding.html" data-reveal><img src="images/Student-Revolving-Fund.jpg" alt="Een student en een bestuurslid van de stichting" loading="lazy"><span class="go">${I.arrow}</span><div><h3>Opleiding &amp; studiebeurzen</h3><p>€ 1.250 per student per jaar. Afgestudeerden betalen een deel terug, zodat de volgende student kan beginnen.</p></div></a>
    <a class="tile b" href="palliatieve-zorg.html" data-reveal style="--i:1"><img src="images/rubya-palliatieve-zorg-motorfietsen.jpg" alt="Motorfietsen van het palliatieve zorgteam" loading="lazy"><span class="go">${I.arrow}</span><div><h3>Palliatieve zorg</h3><p>€ 35 geeft één patiënt een menswaardig sterfbed.</p></div></a>
    <a class="tile c" href="drinkwater.html" data-reveal style="--i:2"><img src="images/watertoren-cropped-2.jpg" alt="De nieuwe watertoren van Rubya" loading="lazy"><span class="go">${I.arrow}</span><div><h3>Drinkwater</h3><p>Een ziekenhuis zonder water is ondenkbaar.</p></div></a>
    <a class="tile d" href="onderhoud.html" data-reveal><img src="images/Maintenance-Plan2.jpg" alt="Bouwvakkers op het dak van een ziekenhuisgebouw" loading="lazy"><span class="go">${I.arrow}</span><div><h3>Onderhoudsplan</h3><p>Gebouwen die toekomstbestendig worden.</p></div></a>
    <a class="tile e" href="ict.html" data-reveal style="--i:1"><img src="images/ict-01-02.jpg" alt="Twee mannen achter een computer in Rubya" loading="lazy"><span class="go">${I.arrow}</span><div><h3>ICT-project</h3><p>Digitale dossiers, recepten en administratie.</p></div></a>
  </div>
</div></section>

<section class="section bg-dark"><div class="container">
  <div class="counters" data-reveal>
    <div class="counter"><b data-count="400000">0</b><span>mensen krijgen zorg uit Rubya</span></div>
    <div class="counter"><b data-count="4000" data-suf="+">0</b><span>bevallingen per jaar</span></div>
    <div class="counter"><b data-count="1700">0</b><span>verpleegkundigen afgestudeerd in Rubya</span></div>
    <div class="counter"><b data-count="35" data-pre="€ ">0</b><span>is de zorg voor één palliatieve patiënt</span></div>
  </div>
</div></section>

<section class="section"><div class="container">
  ${head('Ontmoet de mensen', 'Achter elk project staat een gezicht', 'Cijfers vertellen een deel van het verhaal. Dit zijn drie mensen met wie we samenwerken.')}
  <div class="stories" data-reveal>
    <div class="stories-tabs" role="tablist"><button class="pill-tab" role="tab" aria-selected="true">Beatrice &amp; het palliatieve team</button><button class="pill-tab" role="tab" aria-selected="false">Denice, student</button><button class="pill-tab" role="tab" aria-selected="false">Frank, bestuurslid</button></div>
    <div class="story-stack">
      <div class="story on"><figure class="ph"><img src="images/rubya-palliatieve-zorg-motorfietsen.jpg" alt="Zegening van de motorfietsen van het palliatieve zorgprogramma" loading="lazy"><figcaption>Zegening van de motorfietsen van het team</figcaption></figure><div><span class="eyebrow">Palliatieve zorg</span><h3>Zorg tot aan de voordeur</h3><p>Beatrice leidt het palliatieve team van Rubya, dat dankzij de stichting is opgeleid. In 2021 nam het team 159 nieuwe patiënten op en deed het 266 herhaalconsulten, grotendeels huisbezoeken in dorpen waar geen weg naartoe loopt.</p><p class="muted">Het kost € 35 om één patiënt te begeleiden.</p><div class="hero-cta">${btn('palliatieve-zorg.html', 'Lees het hele project', 'btn-ghost')}</div></div></div>
      <div class="story"><figure class="ph"><img src="images/Student-Revolving-Fund.jpg" alt="Erik de Vries met student Denice Kabalema" loading="lazy"><figcaption>Erik de Vries met Denice Kabalema</figcaption></figure><div><span class="eyebrow">Opleiding</span><h3>Een beurs die doorgegeven wordt</h3><p>Denice Kabalema studeerde met behulp van het Revolving Fund. Dat fonds werkt als een estafette: wie afstudeert betaalt een deel van het bedrag terug, zodat de volgende student kan beginnen.</p><p class="muted">In 2018-2019 maakten 15 studenten er gebruik van.</p><div class="hero-cta">${btn('opleiding.html', 'Lees het hele project', 'btn-ghost')}</div></div></div>
      <div class="story"><figure class="ph"><img src="images/rubya-bestuur-frank-bigirwamungu-23.jpg" alt="Portret van Frank Bigirwamungu" loading="lazy" style="object-position:center 25%"><figcaption>Frank Bigirwamungu</figcaption></figure><div><span class="eyebrow">Bestuur</span><h3>Geboren in Rubya, werkzaam in Nederland</h3><p>Frank is de levende brug tussen Nederland en Rubya. Hij werkt als technisch specialist netbeheer en bezoekt, als zijn werk het toelaat, drie of vier keer per jaar zijn geboortedorp. Zo weet het bestuur uit eerste hand wat er speelt.</p><div class="hero-cta">${btn('stichting.html#bestuur', 'Ontmoet het bestuur', 'btn-ghost')}</div></div></div>
    </div>
  </div>
</div></section>
${band()}`
});

/* =========================================================== STICHTING */
add({
  file: 'stichting.html', title: 'Over de stichting', cur: 'stichting.html', desc: 'Sinds 1997 coördineert Stichting Vrienden van Rubya materiële hulpverlening aan Rubya Hospital in Tanzania. Lees over onze doelstelling, aanpak en bestuur.',
  body: `
${hero({ img: 'bestuur-stichting-vrienden-van-rubya-2025.jpg', pos: 'center 30%', eyebrow: 'Stichting', h1: 'Oud-tropenartsen die Rubya niet los kunnen laten.', lead: 'In 1996 kwamen artsen die in Rubya hadden gewerkt voor het eerst weer bij elkaar. Een jaar later was er een stichting.', crumbs: crumb('Stichting'), ctas: btn('#doelstelling', 'Onze doelstelling', 'btn-light') + btn('#bestuur', 'Het bestuur', 'btn-line') })}
<section class="section"><div class="container split top">
  <div data-reveal><span class="eyebrow">Ons verhaal</span><h2 style="margin:.7rem 0 1.2rem">Van een reünie naar een stichting.</h2>
  <p class="lead">Tijdens die eerste bijeenkomst bleek dat er behoefte was aan een meer structurele bijdrage aan de gezondheidszorg in Rubya, en aan steun voor het ziekenhuis en de verpleegstersopleiding.</p>
  <p class="muted">Daarom werd in 1997 door enkele reünisten de Stichting Vrienden van Rubya opgericht. Bijna alle bestuursleden zijn nog steeds ex-tropenartsen die zelf in Rubya hebben gewerkt.</p><div class="logo-card"><img src="images/logo-officieel.jpg" alt="Officieel logo van Stichting Vrienden van Rubya" loading="lazy"><p><b>Ons logo.</b> Het officiële beeldmerk van de stichting, met het ziekenhuis waar het allemaal om draait.</p></div></div>
  ${tl([['1996', 'De eerste bijeenkomst', 'Alle oud-tropenartsen die in Rubya werkten komen samen.'], ['1997', 'Oprichting van de stichting', 'Om structureel te kunnen helpen: ziekenhuis én verpleegstersopleiding.'], ['2008-2011', 'Leer- en Kenniscentrum gebouwd', 'Zodat de groeiende stroom studenten kan worden gehuisvest.'], ['2025', 'Nieuw bestuur', 'Sinds 10 januari 2025 een nieuw bestuur, met Frank uit Rubya zelf.'], ['2026', 'Nieuwe statuten en beleidsplan', 'Statuten aangepast aan de Wet Bijzonder Toezicht Rechtspersonen.']])}
</div></section>

<section class="section bg-sand" id="doelstelling"><div class="container">
  ${head('Doelstelling', 'De coördinatie van materiële hulpverlening ten bate van Rubya Ziekenhuis.', 'In de ruimste zin van het woord. Met expertise op afstand en financiële armslag ondersteunen wij het ziekenhuis op een groot aantal terreinen, altijd in samenspraak met het management.')}
  ${planDiagram()}
  <div style="margin-top:clamp(70px,9vw,120px)" data-reveal><span class="eyebrow">Plan van aanpak</span><h3 style="font-size:2rem;margin:.6rem 0 2rem">Zo loopt elk project: vier stappen</h3></div>
  ${roadDiagram([
    ['Rubya meldt de behoefte', ['Studenten, onderhoud,', 'scholing: het ziekenhuis vraagt.'], 'Het ziekenhuis- of schoolmanagement meldt wat het hardst nodig is: studenten die niet kunnen betalen, een lekke watertoren, een cursus.'],
    ['Plan en advies', ['Samen met het management,', 'getoetst door experts.'], 'We stellen samen met het management een plan op. Deskundigen, zoals onze bouwkundig adviseur, toetsen het voor het bestuur.'],
    ['Uw gift aan het werk', ['Geoormerkt, zodat altijd', 'zichtbaar is waar het naartoe gaat.'], 'Fondsen worden geoormerkt, zodat altijd te achterhalen is waarvoor ze gebruikt worden.'],
    ['Controle en verantwoording', ['Bestuurders bezoeken Rubya', 'op eigen kosten. Elk jaar een verslag.'], 'Bestuursleden controleren ter plaatse, op eigen kosten, en leggen jaarlijks verantwoording af in het jaarverslag.'],
  ])}
</div></section>

<section class="section"><div class="container">
  ${head('Beleid', 'Zorgvuldig en onbaatzuchtig', 'Het bestuur bestuurt vanuit het belang van de stichting, op korte én lange termijn, vanuit de doelen in statuten en beleidsplan.')}
  <div class="cards">
    <div class="card" data-reveal><div class="ico">${I.shield}</div><h3>Geen eigen belangen</h3><p>Bestuursleden hebben geen (deel-)belangen die buiten de primaire doelen van de stichting vallen.</p></div>
    <div class="card" data-reveal style="--i:1"><div class="ico">${I.heart}</div><h3>Geen vergoeding</h3><p>Bestuursleden ontvangen geen vergoeding. Alleen onkosten mogen worden gedeclareerd.</p></div>
    <div class="card" data-reveal style="--i:2"><div class="ico">${I.users}</div><h3>Eigen reiskosten</h3><p>Vrijwilligers die meegaan naar Rubya betalen hun eigen reis- en verblijfskosten.</p></div>
    <div class="card" data-reveal style="--i:3"><div class="ico">${I.doc}</div><h3>Open boekhouding</h3><p>Over middelen die bestuursleden voor directe activiteiten inzetten leggen we jaarlijks verantwoording af.</p></div>
  </div>
  <div class="rows" style="margin-top:36px;max-width:760px" data-reveal>
    <a class="row-link" href="https://www.vriendenvanrubya.org/wp-content/uploads/2026-01-15-Afschrift-akte-statutenwijziging.pdf" target="_blank" rel="noopener"><span>Statuten (pdf)<small>Aangepast in januari 2026</small></span>${I.up}</a>
    <a class="row-link" href="https://www.vriendenvanrubya.org/wp-content/uploads/2026-01-12-Beleidsplan-2026_compressed.pdf" target="_blank" rel="noopener"><span>Beleidsplan 2026 (pdf)<small>Doelen en ambities</small></span>${I.up}</a>
    <a class="row-link" href="rapporten.html"><span>Jaarverslagen<small>Alle rapporten en verslagen</small></span>${I.arrow}</a>
  </div>
</div></section>

<section class="section bg-sand" id="bestuur"><div class="container split">
  <figure class="ph" data-reveal style="aspect-ratio:4/3.2"><img src="images/bestuur-stichting-vrienden-van-rubya-2025.jpg" alt="Het bestuur van Stichting Vrienden van Rubya in 2025" loading="lazy"><figcaption>Het bestuur, 2025</figcaption></figure>
  <div data-reveal><span class="eyebrow">Bestuur</span><h2 style="margin:.7rem 0 1.2rem">De mensen achter de stichting</h2><p class="lead">Sinds 10 januari 2025 heeft de stichting een nieuw bestuur. Bijna alle bestuursleden hebben vroeger zelf in Rubya Hospital gewerkt.</p>
  <div class="board"><div><b>Sybo Dijkstra</b><span>voorzitter</span></div><div><b>Erik de Vries</b><span>secretaris</span></div><div><b>Rolf Westerhof</b><span>penningmeester</span></div><div><b>Lamiek Westerhof</b><span>lid</span></div><div><b>Frank Bigirwamungu</b><span>lid · geboren in Rubya</span></div></div></div>
</div></section>
${band()}`
});

/* =========================================================== ZIEKENHUIS */
add({
  file: 'ziekenhuis.html', title: 'Rubya Ziekenhuis', cur: 'ziekenhuis.html', desc: 'Het verhaal van Rubya Hospital: in 1956 gesticht door Nederlandse zusters, nu een ziekenhuis voor 400.000 mensen in Noordwest-Tanzania.',
  body: `
${hero({ img: 'Front-Rubya-Hospital.jpg', pos: 'center 55%', eyebrow: 'Ziekenhuis', h1: 'Van een kleine apotheek tot het hart van een regio.', lead: 'In 1956 begon het met een apotheek en twintig verlosbedden. Nu is Rubya Hospital een ziekenhuis dat 400.000 mensen dient.', crumbs: crumb('Ziekenhuis'), ctas: btn('doneren.html', 'Steun Rubya', 'btn-light', I.heart) + btn('#tijdlijn', 'Bekijk de geschiedenis', 'btn-line') })}
<section class="section"><div class="container split">
  <div data-reveal><span class="eyebrow">Het ziekenhuis</span><h2 style="margin:.7rem 0 1.2rem">In de heuvels boven het Victoriameer</h2>
  <p class="lead">Rubya ligt ± 80 km van Bukoba, de regionale hoofdplaats van West-Lake-Region. Een landelijk gebied met veel verspreide dorpskernen en weinig infrastructuur.</p>
  <p class="muted">De Nederlandse zusters Franciscanessen uit Breda namen bij de start een bestaande apotheek over van de lokale dorpsdokter. Daaruit groeide een volwaardige medische voorziening voor de hele bevolking.</p>
  ${facts([['162', 'bedden'], ['1956', 'gesticht'], ['1977', 'Designated District Hospital']])}</div>
  <figure class="ph" data-reveal style="aspect-ratio:4/4.2"><img src="images/Male-Ward.jpg" alt="De mannenafdeling van Rubya Hospital met bedden en klamboes" loading="lazy"><figcaption>De Male Ward</figcaption></figure>
</div></section>

<section class="section bg-dark"><div class="container"><div class="counters" data-reveal>
  <div class="counter"><b data-count="400000">0</b><span>inwoners krijgen medische zorg</span></div><div class="counter"><b data-count="4000" data-suf="+">0</b><span>bevallingen per jaar</span></div><div class="counter"><b data-count="60000">0</b><span>bezoeken aan de polikliniek</span></div><div class="counter"><b data-count="15000">0</b><span>opnames per jaar</span></div>
</div></div></section>

<section class="section" id="tijdlijn"><div class="container">
  ${head('Geschiedenis', 'Zeventig jaar zorg in Rubya')}
  ${tl([
    ['1956', 'Een ziekenhuis in de heuvels', 'Nederlandse zusters Franciscanessen uit Breda stichten het ziekenhuis. Het begint met een apotheek en 20 verlosbedden.'],
    ['1963', 'Opleiding en eerste arts', 'Er start een opleiding voor verpleegsters en vroedvrouwen. Dat jaar arriveert ook de eerste Nederlandse tropenarts, uitgezonden door Memisa.'],
    ['1977', 'Onderdeel van de Tanzaniaanse gezondheidszorg', 'Rubya wordt Designated District Hospital van het district Muleba. De overheid betaalt een deel van de salarissen. Datzelfde jaar wordt een 100 meter diep boorgat geslagen voor drinkwater.'],
    ['± 1990', 'Overdracht aan de Afrikaanse congregatie', 'De Nederlandse zusters dragen het management over. Het ziekenhuis dient inmiddels 400.000 inwoners.'],
    ['2001', 'De laatste Nederlandse artsen vertrekken', 'Nederlanders blijven aanwezig als co-assistenten uit Nijmegen: jonge mensen die drie maanden stage lopen.'],
    ['2006', 'Gouden jubileum', 'Een groot feest, waarvoor het merendeel van het bestuur van de stichting naar Rubya afreist.'],
    ['2013', 'Een groot onderhoudsplan', 'Een tienjarig plan voor de gebouwen start. Ook vallen de watertoren en tank uit 1977 uit.'],
    ['2022', 'Nieuwe borehole geopend', 'Op 31 oktober wordt een tweede waterbron met zonnepanelen feestelijk geopend.'],
    ['Nu', 'Een verwijsziekenhuis', 'Patiënten komen van alle kanten met complexe klachten. Het ziekenhuis heeft specialisten, een nieuwe operatiekamer en een intensive care nodig.', 'Op dit moment'],
  ])}
</div></section>

<section class="section bg-sand"><div class="container split top">
  <div data-reveal><span class="eyebrow">Wat er nu nodig is</span><h2 style="margin:.7rem 0 1.2rem">Complexere zorg vraagt meer dan een kleurtje verf.</h2>
  <p class="lead">Rond Rubya zijn dispensaries en health centres verbeterd. Daardoor komen er minder patiënten, maar de zieken die komen zijn veel zieker.</p>
  <p class="muted">Van alle kanten worden patiënten gebracht met complicaties na een keizersnede of verkeersongeval. Door nieuwe asfaltwegen rijden auto's en piki-piki's (taxi-brommertjes) harder, en diabetes en hoge bloeddruk nemen enorm toe.</p></div>
  <div class="cards" style="grid-template-columns:1fr">
    <div class="card" data-reveal><div class="ico">${I.users}</div><h3>Specialisten</h3><p>Een gynaecoloog, chirurg en internist moeten de kwaliteit van zorg vergroten. Daarvoor is ook een stafhuis gebouwd.</p></div>
    <div class="card" data-reveal style="--i:1"><div class="ico">${I.pulse}</div><h3>Operatiekamer &amp; intensive care</h3><p>De OK moet worden vernieuwd en er komt een bescheiden ICU. Het Masterplan brengt in kaart wat, waar en in welke volgorde.</p></div>
    <div class="card" data-reveal style="--i:2"><div class="ico">${I.cap}</div><h3>Eigen artsen en verpleegkundigen</h3><p>Studiebeurzen houden talent in de regio: student Elvinus committeerde zich om als arts in Rubya te blijven werken.</p></div>
  </div>
</div></section>
<section class="section"><div class="container">${head('In beeld', 'Rubya van dichtbij')}${gal([['Front-Rubya-Hospital.jpg', 'De hoofdingang van het ziekenhuis'], ['Male-Ward.jpg', 'De mannenafdeling'], ['rubya-ziekenhuis-opleiding-1.jpg', 'Het Rubya Health Training Institute'], ['school_2.jpg', 'Les in de verpleegkundeopleiding'], ['rubya-ziekenhuis-afvalwaterzuivering-borehole.jpg', 'Een zandpad op het ziekenhuisterrein'], ['Resultaat-onderhoud-2016.jpg', 'Onderhoud aan de gebouwen']])}</div></section>
${band('Help Rubya toekomstbestendig worden')}`
});

/* =========================================================== PROJECT PAGES */
const projectPage = ({ file, title, desc, h1, lead, img, pos, eyebrow, factsArr, intro, extra = '', timeline, timelineTitle = 'Hoe het is gegaan', gallery, band: b }) => ({
  file, title, desc, cur: file, body: `
${hero({ img, pos, eyebrow, h1, lead, crumbs: crumb('<a href="projecten.html">Projecten</a>', title), ctas: btn('doneren.html', 'Steun dit project', 'btn-light', I.heart) + btn('#verloop', 'Lees het verloop', 'btn-line') })}
<section class="section"><div class="container"><div class="split top"><div class="prose" data-reveal>${intro}</div><div data-reveal>${facts(factsArr)}</div></div></div></section>
${extra}
<section class="section ${extra ? '' : 'bg-sand'}" id="verloop"><div class="container">${head('Verloop', timelineTitle)}${tl(timeline)}</div></section>
<section class="section ${extra ? 'bg-sand' : ''}"><div class="container">${head('In beeld', 'Foto\'s uit Rubya')}${gal(gallery)}</div></section>
${b || band()}`
});

add(projectPage({
  file: 'opleiding.html', title: 'Opleiding & sponsoring', desc: 'Studiebeurzen en het Revolving Fund voor verpleegkundigen, verloskundigen en artsen in Rubya, Tanzania.',
  img: 'rubya-ziekenhuis-opleiding-1.jpg', pos: 'center 40%', eyebrow: 'Speerpunt · Opleiding', h1: 'Een verpleegkundige opleiden begint met € 1.250.',
  lead: 'Voor jonge mensen uit arme gezinnen is een opleiding vaak onbetaalbaar. Dankzij een Revolving Fund wordt elke euro meerdere keren gebruikt.',
  factsArr: [['300+', 'studenten op het RHTI'], ['€ 1.250', 'per student per jaar'], ['1.700', 'afgestudeerden sinds 1963'], ['12', 'beurzen in 2020']],
  intro: `<h2>Een school die sinds 1963 groeit</h2><p>Enkele jaren na de opening van het ziekenhuis startten de Zusters Franciscanessen uit Breda een opleiding voor verpleegkundigen: het Nurse Midwife Training Centre. De eerste lichting telde 13 studenten. Nu volgen ruim 170 leerlingen er een vierjarige opleiding.</p><p>Sinds 2015 zijn de opleidingen verenigd in het Rubya Health Training Institute (RHTI): verpleegkunde, verloskunde, laboratorium en een HBO-artsenopleiding, samen ruim 300 studenten. In 2004 kreeg het schooldiploma de status van staatsdiploma.</p>`,
  extra: `<section class="section bg-sand"><div class="container split wide"><div data-reveal><span class="eyebrow">Revolving Fund</span><h2 style="margin:.7rem 0 1.2rem">Een beurs die zichzelf doorgeeft.</h2><p class="lead">Stichting Vrienden van Rubya stort geld in een fonds voor studenten die hun schoolgeld niet kunnen betalen.</p><p class="muted">Hun opleiding wordt grotendeels voorgefinancierd. Na hun afstuderen betalen ze een deel terug, zodat toekomstige collega's er weer een beroep op kunnen doen. In 2018-2019 maakten 15 studenten van het fonds gebruik.</p><div class="hero-cta">${btn('doneren.html', 'Vul het fonds aan', 'btn-primary', I.heart)}</div></div>${cycleDiagram()}</div></section>
  <section class="section"><div class="container">${head('Twee voorbeelden', 'Studenten die we sponsoren')}<div class="cards"><div class="card" data-reveal><div class="ico">${I.cap}</div><h3>Elvinus Felician</h3><p>Zit in de laatste twee jaar van zijn artsenopleiding en heeft zich gecommitteerd om na zijn afstuderen als dokter in Rubya te gaan werken.</p></div><div class="card" data-reveal style="--i:1"><div class="ico">${I.cap}</div><h3>Dickson Alex</h3><p>Eerstejaars bachelor verloskunde in Dar es Salaam. Dankzij een nalatenschap van Jacques Hulsbergen heeft hij de komende vier jaar een studiebeurs.</p></div><div class="card" data-reveal style="--i:2"><div class="ico">${I.users}</div><h3>Co-assistenten uit Nijmegen</h3><p>Steeds zijn er twee student-doctors uit Nijmegen, elk drie maanden. In 2016 waren dat Joost Stultiens en Twan Kortz.</p></div></div></div></section>`,
  timeline: [['1963', 'De eerste lichting', 'Het Nurse Midwife Training Centre begint met 13 studenten.'], ['2004', 'Staatsdiploma', 'De regering erkent de opleiding en het diploma krijgt de status van staatsdiploma. De school heet nu Rubya School of Nursing.'], ['2008-2011', 'Leer- en Kenniscentrum', 'De stichting bouwt het Learning and Resource Centre om de groeiende stroom studenten te kunnen huisvesten.'], ['2015', 'Rubya Health Training Institute', 'De opleidingen worden verenigd in één instituut.'], ['2020', '12 aanvragen gehonoreerd', 'Alle twaalf aanvragen vanuit de schoolleiding worden gehonoreerd.'], ['2023', 'Onderhoud en jaarplan', 'Het instituut heeft broodnodig onderhoud nodig: scheuren in de muren worden alleen overgeschilderd. Fondsen worden geoormerkt, en de school maakt een jaarplan met kosten.']],
  gallery: [['Student-Revolving-Fund.jpg', 'Erik de Vries met student Denice Kabalema'], ['joost-en-twan-willen-levens-redden-in-rubya.jpg', 'Co-assistenten Joost en Twan, 2016'], ['rubya-ziekenhuis-opleiding-2.jpg', 'Bord van het Learning and Resource Centre'], ['LRC-opening-computerruimte.jpg', 'Opening van de computerruimte'], ['school_2.jpg', 'Les in het instituut'], ['rubya-ziekenhuis-opleiding-1.jpg', 'Het Rubya Health Training Institute']],
  band: band('€ 1.250 is één jaar studie', 'Eén student een jaar laten studeren kost € 1.250. Door het Revolving Fund geeft elke euro die u schenkt meerdere studenten een kans.')
}));

add(projectPage({
  file: 'palliatieve-zorg.html', title: 'Palliatieve zorg', desc: 'Het palliatieve zorgteam van Rubya bezoekt patiënten thuis in 14 dorpen. € 35 per patiënt geeft iemand een menswaardig sterfbed.',
  img: 'palliatieve-zorg-rubya-hospital-ziekenhuis-tanzania.jpg', pos: 'center 35%', eyebrow: 'Speerpunt · Bijscholing', h1: 'Het kost € 35 om iemand een menswaardig sterfbed te geven.',
  lead: 'Het palliatieve team van Rubya bezoekt ernstig zieke mensen in hun dorp. Dankzij de stichting kunnen zij pijn bestrijden en nabestaanden begeleiden.',
  factsArr: [['€ 35', 'per patiënt'], ['300', 'nieuwe patiënten per jaar'], ['14', 'dorpen, 60.000 inwoners'], ['32', 'vrijwilligers in de dorpen']],
  intro: `<h2>Zorg in de dorpen</h2><p>In 2014 volgde een verpleegkundige uit Rubya, dankzij de stichting, een jaar lang de speciale opleiding palliative care in Kampala bij Hospice Africa Uganda. Samen met collega's vormde zij een palliative care team dat actief is in het ziekenhuis en patiënten thuis bezoekt.</p><div class="quote">"U leest het goed: het kost slechts € 35 om iemand een menswaardig sterfbed te geven."</div><p>Eens per maand bezoekt het team de dorpen. Tussentijds worden ernstig zieke patiënten verzorgd door village health workers: leken met een aanvullende opleiding. Ongeveer 20% van de patiënten heeft morfine nodig om pijnvrij te zijn.</p>`,
  extra: `<section class="section bg-sand"><div class="container split"><div data-reveal><span class="eyebrow">Nu nodig</span><h2 style="margin:.7rem 0 1.2rem">Een fiets voor elke village health worker</h2><p class="lead">Om hun werk te vergemakkelijken vroegen de village health workers om fietsen voor hun huisbezoeken. Een fiets kost € 100 tot € 200.</p><p class="muted">Op het verjaardagsfeest van onze voorzitter werd al € 1.400 opgehaald: genoeg voor minimaal 7 en maximaal 14 fietsen. Doet u ook mee?</p><div class="hero-cta">${btn('doneren.html', 'Schenk een fiets', 'btn-primary', I.bike)}</div></div>
  <div data-reveal><div class="bike" aria-label="Van 14 mogelijke fietsen is minimaal 7 gefinancierd">${Array.from({ length: 14 }, (_, i) => I.bike.replace('<svg', `<svg class="${i < 7 ? 'on' : ''}"`)).join('')}</div><p class="note" style="margin-top:14px">Donkerbruin: zeker gefinancierd (7 × € 200). Lichter: nog mogelijk bij € 100 per fiets.</p></div></div></section>`,
  timeline: [['2014', 'Opleiding in Kampala', 'Een jaar lang palliative care bij Hospice Africa Uganda, daarna 6 weken training door Clavera Biro.'], ['2016', 'Cursussen in Rubya', 'In februari geven twee docenten uit Kampala een cursus aan de staf. In september volgt een herhalingscursus. Essentiële pijnbestrijding is nog niet altijd mogelijk door een tekort aan morfinedrank.'], ['2017', 'Morfine in drinkvorm', 'Het project loopt goed: er is morfine in drinkvorm voorradig.'], ['2021', '159 nieuwe patiënten', 'Daarnaast 266 herhaalconsulten, vooral huisbezoeken. In totaal overleden 63 patiënten. David Kansheba behaalt zijn bachelor Palliative Care en wordt docent op het RHTI.'], ['2022', 'Twee opfriscursussen', 'In maart en juli worden opfriscursussen gegeven aan het team en de staf. Het team krijgt motorfietsen, door de bisschop gezegend.'], ['2023', 'Erkenning van de overheid', 'De District Medical Officer van Muleba wil dat het team andere gezondheidswerkers traint. Een poster over het team wordt geaccepteerd door het Europese Congres voor Palliatieve Zorg in Rotterdam.'], ['2024', 'Fietsen voor de dorpen', 'Afspraken met de overheid over voldoende morfine. € 1.400 opgehaald voor fietsen voor village health workers.', 'Actueel']],
  gallery: [['palliatieve-zorg-rubya-hospital-ziekenhuis-tanzania.jpg', 'Een patiënt in zijn dorp'], ['rubya-palliatieve-zorg-motorfietsen.jpg', 'Zegening van de motorfietsen'], ['rubya-palliatieve-zorg-opfriscursus.jpg', 'Opfriscursus palliatieve zorg'], ['Bespreking-Rapportage-Palliatieve-Zorg-scaled.jpg', 'Bespreking van de rapportage'], ['Bernadette-en-Lamiek-scaled.jpg', 'Bernadette en Lamiek bij de poster'], ['Support-supervision-palliatief-zorgproject.jpg', 'Supervisiebezoek']],
  band: band('€ 35 geeft één mens een waardig afscheid', 'Het palliatieve team bezoekt elk jaar 300 nieuwe patiënten. Elke gift van € 35 financiert de zorg voor één van hen.')
}));

add(projectPage({
  file: 'drinkwater.html', title: 'Drinkwatervoorziening', desc: 'Van een lekkende watertoren uit 1977 naar nieuwe tanks, een tweede borehole en zonnepanelen voor Rubya Hospital.',
  img: 'vrienden-van-rubya-hospital-drinkwatervoorziening.jpg', pos: 'center 35%', eyebrow: 'Project · Water', h1: 'Een ziekenhuis zonder drinkwater is ondenkbaar.',
  lead: 'In 2013 kwam het alarmerende bericht dat de watertank lekte en de druk wegviel. Wat volgde was een project van meer dan tien jaar.',
  factsArr: [['100 m', 'diep boorgat'], ['4 × 10.000 L', 'nieuwe tanks'], ['50%', 'aanvulling van Wilde Ganzen'], ['31-10-2022', 'opening nieuwe borehole']],
  intro: `<h2>Water, de basis van elk ziekenhuis</h2><p>De installatie dateert uit 1977, toen via een 100 meter diep boorgat een nieuwe waterader werd aangeboord. Daaruit wordt nog altijd voldoende water gepompt, maar de stalen watertank lekte zo ernstig dat de watertoren te weinig druk opbouwde.</p><p>Het plan: een extra watertoren in dezelfde staalconstructie, met daarop vier plastic tanks van elk 10.000 liter, en een tweede boorgat met een pomp op zonne-energie. Zo is het ziekenhuis niet meer afhankelijk van een stroomnet dat nogal eens uitvalt.</p>`,
  extra: `<section class="section bg-sand"><div class="container"><div class="split"><div data-reveal><span class="eyebrow">Voor en na</span><h2 style="margin:.7rem 0 1.2rem">Schuif en zie het verschil.</h2><p class="lead">Links de lekkende tank uit 1977, rechts de nieuwe toren met kunststof tanks.</p><p class="muted">Sleep de balk, of gebruik de pijltjestoetsen.</p></div>
  <div class="cmp" data-reveal><img src="images/Watertoren.-4-lekkende-tank-uit-1977.jpg" alt="De lekkende stalen watertank uit 1977" loading="lazy"><img class="top" src="images/2015-09-watertoren-rubya-1.jpg" alt="De nieuwe watertoren met vier plastic tanks" loading="lazy"><span class="lab l1">Nieuw · 2015</span><span class="lab l2">Lekkage · 1977</span><span class="bar"></span><span class="knob">${I.lr}</span><input type="range" min="0" max="100" value="50" aria-label="Vergelijk de oude en de nieuwe watertoren"></div></div></div></section>`,
  timeline: [['1977', 'Het eerste boorgat', 'Een waterader wordt aangeboord via een 100 meter diep boorgat.'], ['2013', 'Alarmerend bericht', 'De stalen tank lekt ernstig. Zonder druk geen water op de afdelingen.'], ['2014-2015', 'De nieuwe watertoren', 'Een extra toren met vier plastic tanks van 10.000 liter wordt gebouwd.'], ['2018', 'Rotary en Zonta slaan de handen ineen', 'Rotaryclub Oldebroek/Elburg en Zontaclub Zwolle starten een back-up voor de oude pomp. Wilde Ganzen voegt er 50% aan toe.'], ['2019', 'Locatieonderzoek', 'Een survey bepaalt waar het tweede borehole moet komen. De oude pomp werkt nog altijd.'], ['2022', 'Een nieuw borehole en zonnepanelen', 'Een elektrische pomp en zonnepanelen worden geplaatst. Op 31 oktober volgt de feestelijke opening.', 'Afgerond']],
  gallery: [['Opening-Borehole-web.jpg', 'Opening van het nieuwe borehole, 31 oktober 2022'], ['Zonnepanelen-en-Borehole-web.jpg', 'Zonnepanelen met het borehole op de achtergrond'], ['Waterpomp.jpg', 'De waterpomp'], ['SIM-TANKS-BEFORE-ERRECTION.jpg', 'De nieuwe tanks voor plaatsing'], ['TOWER-CONSTRUCTION-AT-ROOF-LEVEL-JULY-2014.jpg', 'Bouw van de toren, juli 2014'], ['2015-09-watertoren-rubya-2.jpg', 'De watertoren in 2015']],
  band: band('Schoon water is de eerste medicijn', 'Dit project is dankzij veel mensen afgerond. Er zijn nog meer plekken waar uw gift het verschil maakt.')
}));

add(projectPage({
  file: 'onderhoud.html', title: 'Onderhoudsplan', desc: 'Het meerjarig onderhoudsplan voor Rubya Hospital en het Masterplan om het ziekenhuis toekomstbestendig te maken.',
  img: 'Maintenance-Plan2.jpg', pos: 'center 40%', eyebrow: 'Speerpunt · Onderhoud', h1: 'Vanaf de voorkant mooi. Achterom hard onderhoud nodig.',
  lead: 'Het ziekenhuis ziet er aan de hoofdingang mooi uit. Maar kijk verder en je ziet scheuren, oude wasruimtes en een operatiekamer die toe is aan renovatie.',
  factsArr: [['2012-2024', 'Maintenance Plan'], ['98%', 'gepland werk voltooid in 2016'], ['Masterplan', 'in voorbereiding'], ['2024', 'bisschop vraagt om steun']],
  intro: `<h2>Een ziekenhuis dat bij moet blijven</h2><p>Het meerjarige onderhoudsplan (2012-2024) volgde op het voltooide Renovatie Project. Elk jaar bepaalt de lokale bouwcoördinator wat prioriteit heeft. Dat plan gaat naar onze bouwkundig ingenieur in Nederland, die het bestuur adviseert. Indien nodig reist een bestuurslid op eigen kosten mee om de voortgang te controleren.</p><div class="quote">"Als je naar de hoofdingang kijkt, zie je een mooi ziekenhuis. Maar als je verder kijkt, is het niet al te best."</div><p>In 2024 ontmoette het bestuur de nieuwe bisschop van Bukoba, Mgr. Mwijage. Hij vroeg om steun om het ziekenhuis toekomstbestendig te maken: de medische staf ontwikkelen, de infrastructuur uitbreiden en renoveren. Daar moet het Masterplan voor komen.</p>`,
  extra: `<section class="section bg-sand"><div class="container">${head('Het Masterplan', 'Wat het ziekenhuis in de toekomst nodig heeft')}<div class="steps4"><div class="card" data-reveal><h3>Onderzoek</h3><p>Een gedegen onderzoek naar wat het ziekenhuis nodig heeft.</p></div><div class="card" data-reveal style="--i:1"><h3>Masterplan</h3><p>Een goed en overzichtelijk plan, met stappen en kosten.</p></div><div class="card" data-reveal style="--i:2"><h3>Fondsenwerving</h3><p>Planmatig en stapsgewijs geld ophalen voor de uitvoering.</p></div><div class="card" data-reveal style="--i:3"><h3>Uitvoering</h3><p>Onder meer een nieuwe OK en een bescheiden intensive care.</p></div></div></div></section>`,
  timeline: [['2012', 'Het onderhoudsplan begint', 'Een logisch vervolg op het Renovatie Project.'], ['2016', '98% voltooid', 'Bouwkundig ingenieur Jacques Hulsbergen inspecteert alle gebouwen. Het geplande werk voor dat jaar is voor 98% klaar.'], ['2019', 'Nieuw stafhuis en renovatie', 'Een nieuw stafhuis (2 onder 1 dak) voor een toekomstige gynaecoloog en chirurg. Het Qualified Hostel voor verpleegkundigen wordt gerenoveerd en het skillslab van de school uitgebreid.'], ['2020', 'Afscheid van Jacques Hulsbergen', 'Op 16 december overlijdt de bouwkundig ingenieur die jarenlang het bestuur adviseerde. Een van zijn grootste projecten was het Learning & Resource Centre.'], ['2024', 'Een nieuw perspectief', 'Het onderhoudsplan loopt af. Het bisdom wordt eigenaar van de verantwoordelijkheid. Het bestuur gaat aan de slag met het Masterplan.', 'Actueel']],
  gallery: [['Maintenance-Plan2.jpg', 'Werkzaamheden aan het dak'], ['Inspectie-van-de-toiletten.jpg', 'Inspectie van de toiletten'], ['Resultaat-onderhoud-2016.jpg', 'Resultaat van het onderhoud in 2016'], ['rubya-ziekenhuis-onderhoudsplan.jpg', 'Onderhoud is hard nodig'], ['rubya-ziekenhuis-onderhoudsplan-2.jpg', 'Overleg in Rubya'], ['Male-Ward.jpg', 'Op de mannenafdeling']],
  band: band('Help het ziekenhuis toekomstbestendig te maken', 'Het eerste stuk van het Masterplan wordt nu voorbereid. Elke gift brengt de eerste steen dichterbij.')
}));

add(projectPage({
  file: 'ict.html', title: 'ICT-project', desc: 'Hoe Rubya Hospital stap voor stap digitaliseerde: patiëntregistratie, recepten, administratie en een internetverbinding.',
  img: 'ict-01-02.jpg', pos: 'center 30%', eyebrow: 'Project · ICT', h1: 'Van papier naar een systeem dat draait.',
  lead: 'Betere administratie betekent beter inzicht: waar gaan medicijnen heen, wie heeft betaald, en welke ziektes komen het vaakst voor.',
  factsArr: [['3', 'ICT-medewerkers in dienst'], ['GoT-HoMIS', 'overheidssysteem'], ['2013', 'start digitalisering'], ['100%', 'recepten digitaal']],
  intro: `<h2>Een ziekenhuis dat zijn eigen gegevens kent</h2><p>Rubya heeft drie mensen in dienst voor internet en automatisering. Een lokaal netwerk is opgezet en een internetverbinding aangelegd. Het medisch registratiesysteem heet GoT-HoMIS, van de Tanzaniaanse overheid. De Nederlandse firma Van Gelder B.V. uit Elburg stelt laptops, servers en andere apparatuur gratis ter beschikking.</p><p>Fase 1 (gefinancierd door Rotaryclub Oldebroek-Elburg) verbond kantoor, afdelingen, polikliniek en apotheek. Dat leverde direct besparingen op: men kon beter nagaan hoeveel medicijnen werkelijk werden gebruikt, en omdat alle patiënten digitaal worden ingeschreven en de rekeningen geprint, wordt beter betaald.</p>`,
  timeline: [['2013', 'De eerste stap', 'Patiëntengegevens, receptuur en uitgifte van medicijnen en het beheer van de pharmacy worden geautomatiseerd.'], ['Fase 1', 'Het ziekenhuis wordt een netwerk', 'Kantoor, afdelingen, polikliniek (OPD) en apotheek zijn met elkaar verbonden.'], ['Fase 2', 'Internet en een nieuwe server', 'Internet in het kantoor, bij de dokters en in de school, plus een internetcafé en een sterkere server met dagelijkse back-ups.'], ['2019', 'Bijna alles digitaal', 'Ziekenafdelingen, OK, OPD, röntgen en laboratorium zijn aangesloten. Alle recepten en betalingen gaan digitaal, met een ontvangstbewijs per patiënt. Een digitale prikklok en enkele beveiligingscamera\'s zijn geplaatst.'], ['2022', 'Aangesloten op het overheidsnetwerk', 'Van het oorspronkelijke programma Allsee naar het netwerk van het Ministerie van Gezondheidszorg: recepten tijdens de visite, financiële administratie, online weekrapporten en medicijnen bestellen bij de groothandel.', 'Actueel']],
  gallery: [['ICT.1.jpg', 'ICT-beheer in de praktijk'], ['IMG_2492.jpg', 'Computerruimte voor leerlingen'], ['ICT.2.jpg', 'Computers in een kantoor'], ['ICT.3.jpg', 'Digitale patiëntregistratie'], ['ICT.4.jpg', 'Servers en netwerk'], ['ICT.5.jpg', 'Onderhoud aan apparatuur']],
  band: band('Techniek die levens ondersteunt', 'Met uw gift helpen we Rubya om de laatste afdelingen te digitaliseren en het systeem draaiend te houden.')
}));

/* =========================================================== PROJECTEN OVERZICHT */
add({
  file: 'projecten.html', title: 'Projecten', cur: 'projecten.html', desc: 'Alle projecten van Stichting Vrienden van Rubya: opleiding, palliatieve zorg, drinkwater, onderhoud en ICT.',
  body: `
${hero({ img: 'Maintenance-Plan2.jpg', pos: 'center 40%', eyebrow: 'Projecten', h1: 'Vijf projecten, één ziekenhuis.', lead: 'Studiebeurzen, bijscholing, onderhoud en overige projecten: alles wat Rubya sterker maakt.', crumbs: crumb('Projecten') })}
<section class="section"><div class="container">
  <div class="bento">
    <a class="tile a" href="opleiding.html" data-reveal><img src="images/Student-Revolving-Fund.jpg" alt="Student en bestuurslid" loading="lazy"><span class="go">${I.arrow}</span><div><h3>Opleiding &amp; sponsoring</h3><p>Studiebeurzen voor verpleegkundigen, verloskundigen en artsen via het Revolving Fund. Update 2023.</p></div></a>
    <a class="tile b" href="palliatieve-zorg.html" data-reveal style="--i:1"><img src="images/rubya-palliatieve-zorg-opfriscursus.jpg" alt="Opfriscursus palliatieve zorg" loading="lazy"><span class="go">${I.arrow}</span><div><h3>Palliatieve zorg</h3><p>€ 35 per patiënt. Update 2024.</p></div></a>
    <a class="tile c" href="drinkwater.html" data-reveal style="--i:2"><img src="images/Opening-Borehole-web.jpg" alt="Opening van het borehole" loading="lazy"><span class="go">${I.arrow}</span><div><h3>Drinkwater</h3><p>Nieuw borehole met zonnepanelen. Afgerond in 2022.</p></div></a>
    <a class="tile d" href="onderhoud.html" data-reveal><img src="images/rubya-ziekenhuis-onderhoudsplan.jpg" alt="Onderhoud aan het ziekenhuis" loading="lazy"><span class="go">${I.arrow}</span><div><h3>Onderhoudsplan</h3><p>Naar een Masterplan. Update 2024.</p></div></a>
    <a class="tile e" href="ict.html" data-reveal style="--i:1"><img src="images/ICT.1.jpg" alt="ICT-medewerker in Rubya" loading="lazy"><span class="go">${I.arrow}</span><div><h3>ICT-project</h3><p>Digitale zorg en administratie. Update 2022.</p></div></a>
  </div>
</div></section>${band()}`
});

/* =========================================================== NIEUWS */
const PDF = 'https://www.vriendenvanrubya.org/wp-content/uploads/';
const row = (t, s, h, ext = true) => `<a class="row-link" href="${h}"${ext ? ' target="_blank" rel="noopener"' : ''}><span>${t}<small>${s}</small></span>${ext ? I.up : I.arrow}</a>`;
add({
  file: 'nieuws.html', title: 'Nieuws & nieuwsbrieven', cur: 'nieuws.html', desc: 'Het laatste nieuws en alle nieuwsbrieven van Stichting Vrienden van Rubya.',
  body: `
${hero({ img: 'Bespreking-Rapportage-Palliatieve-Zorg-scaled.jpg', pos: 'center 35%', eyebrow: 'Nieuws', h1: 'Wat er speelt in Rubya.', lead: 'Nieuwsbrieven, updates uit het ziekenhuis en het laatste nieuws van het bestuur.', crumbs: crumb('Nieuws') })}
<section class="section"><div class="container">
  ${head('Nieuws', 'Uit het bestuur en uit Rubya')}
  <div class="cards" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">
    <article class="card" data-reveal style="padding:0;overflow:hidden"><img src="images/rubya-bestuur-frank-bigirwamungu-23.jpg" alt="Frank Bigirwamungu" loading="lazy" style="aspect-ratio:16/10;object-fit:cover;object-position:center 25%;width:100%"><div style="padding:30px"><span class="eyebrow">Bestuur</span><h3 style="margin:.6rem 0">Nieuw bestuurslid: Frank Bigirwamungu</h3><p>Het bestuur is uitgebreid met Frank, geboren in Rubya en al jaren woonachtig en werkzaam in Nederland. Hij is een goede link tussen de stichting en Rubya zelf en bezoekt het dorp drie of vier keer per jaar. In november sprak hij vooral met de leiding van de school. Van zijn hand is het schrijven over de school en de sponsoring.</p></div></article>
    <article class="card" data-reveal style="--i:1;padding:0;overflow:hidden"><img src="images/Male-Ward.jpg" alt="Mannenafdeling" loading="lazy" style="aspect-ratio:16/10;object-fit:cover;width:100%"><div style="padding:30px"><span class="eyebrow">Ziekenhuis · 2023</span><h3 style="margin:.6rem 0">Updates ziekenhuis 2023</h3><p>Lang was Rubya een zeer drukbezocht ziekenhuis met 162 bedden. Nu is de zorg elders verbeterd, maar de ziektegevallen die in Rubya komen zijn zwaarder. Het ziekenhuis heeft dringend specialisten nodig, een gynaecoloog, chirurg en internist, en een renovatie van de OK en betere ICU zijn gepland.</p></div></article>
  </div>
</div></section>
<section class="section bg-sand"><div class="container split top">
  <div data-reveal><span class="eyebrow">Nieuwsbrieven</span><h2 style="margin:.7rem 0 1.2rem">Blijf op de hoogte</h2><p class="lead">Vrienden van Rubya ontvangen jaarlijks een digitale nieuwsbrief met de voortgang van onze projecten.</p>
  <form id="nbform" class="form" style="margin-top:1.6rem;max-width:460px"><div class="fld"><label for="e1">E-mailadres</label><input id="e1" name="email" type="email" required placeholder="naam@voorbeeld.nl"></div><button class="btn btn-primary" type="submit" style="justify-self:start">Aanmelden ${I.arrow}</button><p class="note">Opent uw e-mailprogramma met een bericht aan onze secretaris.</p></form></div>
  <div class="rows" data-reveal>
    ${row('Nieuwsbrief Rubya Hospital', 'april 2026', PDF + '2026-04-13-Rubya-Nieuwsbrief-April-2026_compressed.pdf')}
    ${row('Nieuwsbrief Rubya Hospital', 'december 2025', PDF + '2025-12-21-Nieuwsbrief_compressed.pdf')}
    ${row('Nieuwsbrief Rubya Hospital', 'november 2025', PDF + '2025-11-07-Nieuwsbrief_compressed.pdf')}
    ${row('Nieuwsbrief Rubya Hospital', 'juni 2025', PDF + '2025-06-01-Nieuwsbrief_compressed.pdf')}
    ${row('Nieuwsbrief Stichting Vrienden van Rubya 2024', 'jaargang 11, nr 11', 'https://www.vriendenvanrubya.org/nieuwsbrief-stichting-vrienden-van-rubya-2024/')}
    ${row('Nieuwsbrief Stichting Vrienden van Rubya 2023', 'jaargang 10, nr 10', 'https://www.vriendenvanrubya.org/nieuwsbrief-stichting-vrienden-van-rubya-2023/')}
    ${row('Nieuwsbrief Stichting Vrienden van Rubya 2022', 'jaargang 9, nr 9', 'https://www.vriendenvanrubya.org/nieuwsbrief-stichting-vrienden-van-rubya-2022/')}
    ${row('Nieuwsbrief Stichting Vrienden van Rubya 2021', 'jaargang 8, nr 8', 'https://www.vriendenvanrubya.org/nieuwsbrief-stichting-vrienden-van-rubya-2021/')}
  </div>
</div></section>${band()}`
});

/* =========================================================== RAPPORTEN */
add({
  file: 'rapporten.html', title: 'Rapporten & verslagen', cur: 'rapporten.html', desc: 'Jaarverslagen, beleidsplan, statuten en verslagen van bezoeken aan Rubya van Stichting Vrienden van Rubya.',
  body: `
${hero({ img: 'Algemene-ledenvergadering-2014.jpg', pos: 'center 40%', eyebrow: 'Stichting', h1: 'Open over wat we doen en waaraan we het uitgeven.', lead: 'Jaarrapporten van het ziekenhuis, de opleidingen en verslagen van bezoeken van bestuursleden aan Rubya.', crumbs: crumb('<a href="stichting.html">Stichting</a>', 'Rapporten') })}
<section class="section"><div class="container split top">
  <div data-reveal><span class="eyebrow">Beleid</span><h2 style="margin:.7rem 0 1.2rem">Plannen en statuten</h2>
  <div class="rows">${row('Beleidsplan 2026', 'Doelen en ambities', PDF + '2026-01-12-Beleidsplan-2026_compressed.pdf')}${row('Statuten', 'Aangepast in januari 2026', PDF + '2026-01-15-Afschrift-akte-statutenwijziging.pdf')}</div></div>
  <div data-reveal><span class="eyebrow">Jaarverslagen</span><h2 style="margin:.7rem 0 1.2rem">Hoe het geld besteed is</h2>
  <div class="rows">${[2025, 2024, 2023, 2022, 2021].map(y => row('Jaarverslag ' + y, 'Stichting Vrienden van Rubya', PDF + (y === 2025 ? '2026-03-31-Jaarverslag-2025_compressed.pdf' : `Jaarverslag-${y}-final.pdf`))).join('')}</div></div>
</div></section>
<section class="section bg-sand"><div class="container"><div class="head" data-reveal><span class="eyebrow">Archief</span><h2 style="margin-top:.7rem">Verslagen en rapporten uit Rubya</h2></div>
  <div class="rows" style="max-width:820px">
    ${row('Algemene ledenvergadering 21-07-2018', 'Verslag', PDF + 'Verslag-voor-Website-Bijeenkomst-Stichting-Vrienden-van-Rubya-2018.pdf')}
    ${row('Bezoek aan Rubya september/oktober 2016', 'Verslag', 'https://www.vriendenvanrubya.org/bezoek-rubya-september-oktober-2016/')}
    ${row('Algemene ledenvergadering 17-09-2016', 'Verslag', PDF + 'verslag-algemene-ledenvergadering-vrienden-van-rubya-17-9-2016.pdf')}
    ${row('Rubya School of Nursing &amp; Midwifery 2013', 'Jaarrapport', PDF + 'Annual-Report-2013.pdf')}
    ${row('Bezoek 50-jarig bestaan van de school', 'Verslag, september 2013', PDF + 'Verslag-bezoek-Rubya-september-2013.pdf')}
    ${row('Rubya Ziekenhuis 2012', 'Jaarrapport', PDF + 'ANNUAL-REPORT-2012.pdf')}
  </div></div></section>${band()}`
});

/* =========================================================== ANBI */
add({
  file: 'anbi.html', title: 'ANBI-informatie', cur: 'anbi.html', desc: 'ANBI-gegevens van Stichting Vrienden van Rubya: RSIN, contactgegevens en bestuurssamenstelling.',
  body: `
${hero({ img: 'bestuur-stichting-vrienden-van-rubya-2025.jpg', pos: 'center 30%', eyebrow: 'Stichting', h1: 'Giften aan ons zijn aftrekbaar van de belasting.', lead: 'Stichting Vrienden van Rubya heeft de ANBI-status: een Algemeen Nut Beogende Instelling.', crumbs: crumb('<a href="stichting.html">Stichting</a>', 'ANBI') })}
<section class="section"><div class="container split top">
  <div data-reveal><span class="eyebrow">ANBI-gegevens</span><h2 style="margin:.7rem 0 1.2rem">Transparant door de wet</h2>
  <div class="rows">
    <div class="row-link" style="pointer-events:none"><span>Naam<small>Stichting Vrienden van Rubya</small></span></div>
    <div class="row-link" style="pointer-events:none"><span>RSIN / fiscaal nummer<small>807248496</small></span></div>
    <div class="row-link" style="pointer-events:none"><span>Adres<small>Echobos 21, 1358 EG Almere</small></span></div>
    <div class="row-link" style="pointer-events:none"><span>Website<small>www.vriendenvanrubya.org</small></span></div>
  </div></div>
  <div data-reveal><span class="eyebrow">Bestuurssamenstelling</span><h2 style="margin:.7rem 0 1.2rem">Wie besturen de stichting?</h2>
  <div class="board" style="margin-top:0"><div><b>S.A. (Sybo) Dijkstra</b><span>voorzitter</span></div><div><b>J.F. (Erik) de Vries</b><span>secretaris</span></div><div><b>R. (Rolf) Westerhof</b><span>penningmeester</span></div><div><b>L.H. (Lamiek) Westerhof</b><span>lid</span></div><div><b>F. (Frank) Bigirwamungu</b><span>lid</span></div></div>
  <p class="muted" style="margin-top:1.4rem">Bijna alle bestuursleden zijn ex-tropenartsen en hebben vroeger in Rubya Hospital gewerkt.</p><div class="hero-cta">${btn('rapporten.html', 'Rapporten en verslagen', 'btn-ghost')}</div></div>
</div></section>${band()}`
});

/* =========================================================== DONEREN */
add({
  file: 'doneren.html', title: 'Word Vriend van Rubya', cur: 'doneren.html', desc: 'Steun Rubya Hospital met een eenmalige of periodieke gift. 100% van uw gift gaat naar de projecten in Tanzania en is fiscaal aftrekbaar.',
  body: `
${hero({ img: 'vrienden-van-rubya-contact.jpg', pos: 'center 35%', eyebrow: 'Doneren', h1: 'Word Vriend van Rubya.', lead: 'Wij bestaan geheel uit vrijwilligers. Uw gift komt dus voor 100% ten goede aan de projecten in Rubya.', crumbs: crumb('Doneren'), ctas: btn('#bedrag', 'Wat doet mijn gift?', 'btn-light') })}
<section class="section" id="bedrag"><div class="container">
  ${head('Wat doet uw gift?', 'Kies een bedrag en zie wat het betekent.', 'Elke euro gaat naar Rubya. Probeer het uit: hoeveel mensen helpt u?')}
  <div class="picker" data-reveal>
    <div class="amt" role="group" aria-label="Kies een bedrag">${[35, 100, 250, 1250].map(v => `<button type="button" data-v="${v}" aria-pressed="false">€ ${v.toLocaleString('nl-NL')}</button>`).join('')}<label class="amt-input">€ <input type="number" min="0" step="5" inputmode="numeric" aria-label="Eigen bedrag" placeholder="Eigen bedrag"></label></div>
    <div class="impact"><div><div class="num">0</div><p class="line" aria-live="polite" style="font-size:1.1rem;margin-top:.6rem"></p><p class="note" style="margin-top:.8rem">Palliatieve zorg kost € 35 per patiënt, een jaar studie € 1.250 per student.</p></div>
    <div><div class="people" aria-hidden="true"></div><div class="ring-row"><svg class="ring" viewBox="0 0 150 150" aria-hidden="true"><circle class="bgc" cx="75" cy="75" r="60"/><circle class="fg" cx="75" cy="75" r="60" transform="rotate(-90 75 75)"/><text class="pct" x="75" y="84" text-anchor="middle">0%</text></svg><p style="font-size:.98rem"><b>van een studiejaar</b><br><span class="muted">Een student een jaar laten studeren kost € 1.250.</span></p></div></div></div>
    <div class="hero-cta" style="margin-top:2rem">${btn('#manieren', 'Zo geeft u', 'btn-primary', I.arrow.replace('M5 12h14M13 6l6 6-6 6', 'M12 5v14M6 13l6 6 6-6'))}</div>
  </div>
</div></section>
<section class="section bg-sand" id="manieren"><div class="container">
  ${head('Zo kunt u geven', 'Drie manieren om Vriend van Rubya te worden')}
  <div class="cards">
    <div class="card" data-reveal><div class="ico">${I.heart}</div><h3>Eenmalige schenking</h3><p>Het eenvoudigst: maak het bedrag over op onderstaand rekeningnummer. Omdat wij ANBI zijn, kunt u de gift opvoeren als aftrekpost voor de inkomstenbelasting.</p></div>
    <div class="card" data-reveal style="--i:1"><div class="ico">${I.swap}</div><h3>Periodieke schenking</h3><p>Steun ons maandelijks. Wij adviseren een automatische overboeking via internetbankieren, zodat u het niet kunt vergeten.</p></div>
    <div class="card" data-reveal style="--i:2"><div class="ico">${I.doc}</div><h3>Periodiek, per overeenkomst</h3><p>Fiscaal het aantrekkelijkst: volledig aftrekbaar, zonder 1%-drempel. U kiest een vast bedrag en legt dat minimaal 5 jaar vast met het formulier van de Belastingdienst.</p></div>
  </div>
  <div class="hero-cta" style="margin-top:2rem">${btn('contact.html', 'Vraag ons deel van het formulier aan', 'btn-ghost')}</div>
</div></section>
<section class="section"><div class="container"><div class="band" data-reveal>
  <div><span class="eyebrow">Overmaken</span><h2>Maak uw gift over</h2><p class="lead">Vermeld gerust uw naam en e-mailadres als omschrijving, dan houden wij u op de hoogte van de projecten.</p></div>
  <div class="iban"><small>Rekeningnummer</small><code>${IBAN}</code><small>t.n.v. Stichting Vrienden van Rubya</small><br><small>BIC ABNANL2A</small><div class="row" style="margin-top:1.2rem"><button class="btn btn-light btn-sm" data-copy="${IBAN}">Kopieer IBAN</button></div></div>
</div></div></section>
<section class="section bg-sand"><div class="container split"><div data-reveal><span class="eyebrow">Nieuwsbrief</span><h2 style="margin:.7rem 0 1.2rem">Laat het ons weten</h2><p class="lead">Bent u Vriend van Rubya geworden? Laat uw e-mailadres achter. Wij houden u jaarlijks op de hoogte met een digitale nieuwsbrief.</p></div>
<form id="nbform" class="form" data-reveal><div class="fld"><label for="e2">E-mailadres</label><input id="e2" name="email" type="email" required placeholder="naam@voorbeeld.nl"></div><button class="btn btn-primary" type="submit" style="justify-self:start">Aanmelden ${I.arrow}</button><p class="note">Opent uw e-mailprogramma met een bericht aan onze secretaris.</p></form></div></section>`
});

/* =========================================================== CONTACT */
add({
  file: 'contact.html', title: 'Contact', cur: 'contact.html', desc: 'Neem contact op met Stichting Vrienden van Rubya voor vragen, evenementen, advertenties of andere vormen van steun.',
  body: `
${hero({ img: 'Front-Rubya-Hospital.jpg', pos: 'center 55%', eyebrow: 'Contact', h1: 'Heeft u een vraag of een idee?', lead: 'Wilt u ons op een andere manier steunen, bijvoorbeeld met een evenement of advertentie? Ons secretariaat leest mee.', crumbs: crumb('Contact') })}
<section class="section"><div class="container split top">
  <div data-reveal><span class="eyebrow">Bereikbaar</span><h2 style="margin:.7rem 0 1.2rem">We reageren zo spoedig en zorgvuldig mogelijk.</h2>
  <div class="rows" style="margin-top:1.6rem"><a class="row-link" href="mailto:info@vriendenvanrubya.org"><span>E-mail<small>info@vriendenvanrubya.org</small></span>${I.mail}</a><div class="row-link" style="pointer-events:none"><span>Postadres<small>Echobos 21, 1358 EG Almere</small></span></div><div class="row-link" style="pointer-events:none"><span>Bankrekening<small>${IBAN}</small></span></div></div></div>
  <form class="form" id="contactform" data-reveal>
    <div class="fld"><label for="n">Naam</label><input id="n" name="naam" required autocomplete="name"></div>
    <div class="fld"><label for="m">E-mail</label><input id="m" name="email" type="email" required autocomplete="email"></div>
    <div class="fld"><label for="v">Hoe bent u in contact gekomen met de stichting?</label><select id="v" name="via"><option>Kies een optie</option><option>via een bekende</option><option>via een zoekmachine</option><option>via een andere stichting</option><option>via een bericht in de media</option><option>anders</option></select></div>
    <div class="fld"><label for="q">Uw vraag of opmerking</label><textarea id="q" name="msg" required></textarea></div>
    <label class="chk"><input type="checkbox" name="nb"> Ik schrijf me in voor de nieuwsbrief</label>
    <button class="btn btn-primary" type="submit" style="justify-self:start">Verstuur bericht ${I.arrow}</button>
    <p class="note sent" hidden>Uw e-mailprogramma wordt geopend met uw bericht. Werkt dat niet? Mail ons dan op info@vriendenvanrubya.org.</p>
  </form>
</div></section>`
});

/* ---------- write ---------- */
for (const p of pages) fs.writeFileSync(OUT + p.file, page(p));
const map = JSON.parse(fs.readFileSync(OUT + 'assets/map.json', 'utf8'));
fs.writeFileSync(OUT + 'assets/mapdata.js', 'window.MAP=' + JSON.stringify(Object.fromEntries(Object.entries(map).map(([k, v]) => [k, { d: v.d }]))) + ';');
console.log('built', pages.length, 'pages');
