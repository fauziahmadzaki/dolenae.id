const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');
const os = require('node:os');
const root = path.resolve(__dirname, '../build/web');
const profile = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'dolenae-chrome-'));
const chromeExecutable = process.env.CHROME_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const server = http.createServer((req,res) => {
  const file = path.join(root, decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!file.startsWith(path.normalize(root)) || !fs.existsSync(file)) {res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type', ({'.js':'application/javascript','.wasm':'application/wasm','.html':'text/html'})[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
let chrome;
(async () => {
  await new Promise(r=>server.listen(18765,'127.0.0.1',r));
  chrome = spawn(chromeExecutable,['--headless=new','--no-first-run','--no-default-browser-check','--remote-debugging-port=18766',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
  let targets;
  for (let i=0;i<40;i++) {try {targets=await (await fetch('http://127.0.0.1:18766/json')).json();break;}catch {await new Promise(r=>setTimeout(r,500));}}
  if (!targets) throw Error('Chrome CDP unavailable');
  const ws = new WebSocket(targets.find(x=>x.type==='page').webSocketDebuggerUrl);
  await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  let id=0; const waiting=new Map(); const events=[];
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){waiting.get(m.id)?.(m);waiting.delete(m.id);} else events.push(m);});
  const send=(method,params={})=>new Promise(r=>{const n=++id;waiting.set(n,r);ws.send(JSON.stringify({id:n,method,params}));});
  await send('Runtime.enable');await send('Log.enable');await send('Page.enable');
  await send('Page.navigate',{url:'http://127.0.0.1:18765/'});
  await new Promise(r=>setTimeout(r,20000));
  await send('Runtime.evaluate',{expression:"document.querySelector('flt-semantics-placeholder')?.click()"});
  await new Promise(r=>setTimeout(r,2000));
  const state=await send('Runtime.evaluate',{expression:"(async()=>JSON.stringify({title:document.title,text:document.body.innerText,flutter:!!document.querySelector('flutter-view'),db:await indexedDB.databases()}))()",awaitPromise:true,returnByValue:true});
  await send('Runtime.evaluate',{expression:"(()=>{const s=document.createElement('script');s.src='database_smoke.js';document.body.append(s);})()"});
  await new Promise(r=>setTimeout(r,15000));
  const smoke=await send('Runtime.evaluate',{expression:'globalThis.databaseSmokeResult',returnByValue:true});
  const errors=events.filter(x=>x.method==='Runtime.exceptionThrown'||(x.method==='Log.entryAdded'&&x.params.entry.level==='error'&&!x.params.entry.url?.startsWith('http://localhost:3001/')));
  console.log(JSON.stringify({state:state.result,smoke:smoke.result,errors},null,2));
  if (!state.result?.result?.value?.includes('"flutter":true') || !smoke.result?.result?.value?.startsWith('PASS:') || errors.length) process.exitCode=1;
  ws.close();
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{chrome?.kill();server.close();});
