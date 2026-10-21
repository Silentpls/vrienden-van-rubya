import puppeteer from 'file:///E:/Claude web test/mindful-webtest/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
const [pg,sel,label,w='1440',h='900']=process.argv.slice(2);
const b=await puppeteer.launch({executablePath:'C:/Users/isaia/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe',headless:true});
const p=await b.newPage();await p.setViewport({width:+w,height:+h});
await p.goto('http://localhost:3200/'+pg,{waitUntil:'networkidle0'});
await p.evaluate(async s=>{const e=document.querySelector(s);const y=e.getBoundingClientRect().top+scrollY-120;for(let k=scrollY;k<y;k+=250){scrollTo(0,k);await new Promise(r=>setTimeout(r,30))}scrollTo(0,y)},sel);
await new Promise(r=>setTimeout(r,4500));
await p.screenshot({path:`shots/el-${label}.png`});await b.close();
