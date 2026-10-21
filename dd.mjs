import puppeteer from 'file:///E:/Claude web test/mindful-webtest/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
const b=await puppeteer.launch({executablePath:'C:/Users/isaia/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe',headless:true});
const p=await b.newPage();await p.setViewport({width:1440,height:700});
await p.goto('http://localhost:3200/index.html',{waitUntil:'networkidle0'});
await p.hover('.nav>li:nth-child(4)');await new Promise(r=>setTimeout(r,600));
await p.screenshot({path:'shots/dd.png',clip:{x:300,y:0,width:900,height:420}});
await p.setViewport({width:390,height:760});await p.reload({waitUntil:'networkidle0'});
await p.click('.burger');await new Promise(r=>setTimeout(r,900));await p.screenshot({path:'shots/drawer.png'});
await b.close();
