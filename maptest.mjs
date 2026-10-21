import puppeteer from 'file:///E:/Claude web test/mindful-webtest/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import sharp from 'file:///E:/Claude web test/magicui-test/node_modules/sharp/lib/index.js';
import fs from 'fs';
const W=+(process.argv[2]||1440),H=+(process.argv[3]||900);
const b=await puppeteer.launch({executablePath:'C:/Users/isaia/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe',headless:true});
const p=await b.newPage();await p.setViewport({width:W,height:H});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:3200/index.html',{waitUntil:'networkidle0'});
const top=await p.evaluate(()=>document.querySelector('.mapsec').offsetTop);
const st=()=>p.evaluate(()=>[+__map.p.toFixed(2),__map.state]);
const log=[];const files=[];
const shot=async n=>{const f=`shots/map-${W}-${n}.png`;await p.screenshot({path:f});files.push(f)};
await p.evaluate((y,H)=>scrollTo(0,y-H*0.6),top,H);await new Promise(r=>setTimeout(r,600));log.push(['before',await st()]);
await p.evaluate(y=>scrollTo(0,y),top);          // pinned -> forward trigger
for(let i=0;i<7;i++){await new Promise(r=>setTimeout(r,1100));await shot('f'+i);log.push(['play'+i,await st()])}
await new Promise(r=>setTimeout(r,800));log.push(['end',await st()]);
// scroll a bit further down then back up -> reverse
await p.evaluate((y,H)=>scrollTo(0,y+H*1.0),top,H);await new Promise(r=>setTimeout(r,500));log.push(['deeper',await st()]);
await p.evaluate((y,H)=>scrollTo(0,y+H*0.1),top,H);await new Promise(r=>setTimeout(r,500));log.push(['back',await st()]);
for(let i=0;i<4;i++){await new Promise(r=>setTimeout(r,900));await shot('r'+i);log.push(['rev'+i,await st()])}
console.log(JSON.stringify(log),errs);
const tw=Math.round(W/2.3),th=Math.round(H/2.3),C=4;
await sharp({create:{width:tw*C,height:th*Math.ceil(files.length/C),channels:3,background:'#fff'}}).composite(await Promise.all(files.map(async(f,i)=>({input:await sharp(f).resize(tw,th).toBuffer(),left:(i%C)*tw,top:Math.floor(i/C)*th})))).png().toFile(`shots/map-${W}-sheet.png`);
await b.close();
