// Record real, unspeeded gameplay. Needs Playwright, Chromium and ffmpeg.
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
let chromium;try{({chromium}=require('playwright'))}catch{({chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright'))}
const root=path.resolve(__dirname,'..'),sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']}: {})});
 try{for(const [name,w,h,vw,vh]of [['landscape',1920,1080,960,540],['portrait',1080,1620,720,1080]]){
  const dir=path.join(root,'qa/evidence/portal-preview-'+name);fs.mkdirSync(dir,{recursive:true});
  const ctx=await browser.newContext({viewport:{width:vw,height:vh}}),page=await ctx.newPage();await page.goto('file://'+path.join(root,'dist/portal/index.html')+'?mode=practice');
  const frames=[];let recording=true;const start=Date.now();
  const capture=(async()=>{while(recording){const stamp=Date.now(),file=path.join(dir,String(frames.length).padStart(5,'0')+'.jpg');await page.screenshot({path:file,type:'jpeg',quality:82});frames.push({file,stamp});await sleep(65)}})();
  for(let n=0;n<5;n++){
   await sleep(900);const t=Number(await page.locator('#target').innerText());
   if(await page.locator('.choice').count()){const values=await page.locator('.choice').allTextContents(),v=values.find(v=>Math.abs(Number(v)-t)===1);await page.getByRole('button',{name:v,exact:true}).click()}
   else if(await page.locator('#num').count()){await page.fill('#num',String(t+1));await sleep(450);await page.click('#submit')}
   else if(await page.locator('#range').count()){await page.locator('#range').fill(String(t+1));await sleep(450);await page.click('#lock')}
   else{await page.click('#flash');await page.waitForFunction(t=>Math.abs(Number(document.querySelector('#flash').textContent)-t)===1,t);await page.click('#flash')}
   await sleep(650);await page.click('#nextBtn');
  }
  await sleep(Math.max(900,17000-(Date.now()-start)));recording=false;await capture;await ctx.close();
  let sharp;try{sharp=require('sharp')}catch{sharp=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp')}
  const cover=path.join(dir,'cover.jpg');await sharp(path.join(root,'release/portal/covers/'+name+'.png')).jpeg({quality:95}).toFile(cover);const last=frames[frames.length-1];
  const lines=[`file '${cover}'`,'duration 0.04'];for(let i=0;i<frames.length;i++){lines.push(`file '${frames[i].file}'`,'duration '+((frames[i+1]?.stamp??last.stamp+100)-frames[i].stamp)/1000)}lines.push(`file '${last.file}'`);
  const concat=path.join(dir,'frames.txt');fs.writeFileSync(concat,lines.join('\n'));
  const output=path.join(root,'release/portal/preview-'+name+'.mp4');
  execFileSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',concat,'-vf',`scale=${w}:${h},fps=30,setsar=1`,'-t','18','-an','-c:v','libx264','-threads','2','-preset','fast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',output]);
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_type,width,height:format=duration','-of','json',output],{encoding:'utf8'}));
  if(probe.streams.length!==1||probe.streams[0].width!==w||probe.streams[0].height!==h||Number(probe.format.duration)<15||Number(probe.format.duration)>20)throw new Error('Preview failed the format/duration check.');
  console.log(name,output,fs.statSync(output).size+' bytes');
 }}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
