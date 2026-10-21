// usage: node shots.mjs <page.html> <label> [width] [height]  -> viewport shots at several scroll offsets
import puppeteer from 'file:///E:/Claude web test/mindful-webtest/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import sharp from 'file:///E:/Claude web test/magicui-test/node_modules/sharp/lib/index.js';
import fs from 'fs';
const [pg='index.html',label='x',w='1440',h='900']=process.argv.slice(2);
const W=+w,H=+h;
const b=await puppeteer.launch({executablePath:'C:/Users/isaia/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe',headless:true});
const p=await b.newPage();await p.setViewport({width:W,height:H});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('http://localhost:3200/'+pg,{waitUntil:'networkidle0'});
const total=await p.evaluate(()=>document.documentElement.scrollHeight);
fs.mkdirSync('shots',{recursive:true});
const files=[];
for(let y=0,i=0;y<total;y+=H*.9,i++){
  await p.evaluate(async y=>{for(let s=window.scrollY;s<y;s+=200){scrollTo(0,s);await new Promise(r=>setTimeout(r,40))}scrollTo(0,y)},y);
  await new Promise(r=>setTimeout(r,1400));
  const f=`shots/${label}-${i}.png`;await p.screenshot({path:f});files.push(f);
}
// contact sheet 3 cols
const tw=Math.round(W/2.2),th=Math.round(H/2.2),C=3;
const comps=[];for(let i=0;i<files.length;i++)comps.push({input:await sharp(files[i]).resize(tw,th).toBuffer(),left:(i%C)*tw,top:Math.floor(i/C)*th});
await sharp({create:{width:tw*C,height:th*Math.ceil(files.length/C),channels:3,background:'#fff'}}).composite(comps).png().toFile(`shots/${label}-sheet.png`);
console.log(files.length,'shots; errors:',errs.slice(0,8));
await b.close();
