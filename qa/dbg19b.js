const puppeteer=require('puppeteer');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage();
  p.on('pageerror',e=>console.log('PAGEERROR:',e.message,'\nSTACK:',(e.stack||'').split('\n').slice(0,4).join(' | ')));
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,2500));
  const st=await p.evaluate(()=>({
    S: typeof S, Shop: typeof Shop, VIEWS: typeof VIEWS, Media: typeof Media,
    applyLook: (typeof Shop!=='undefined') ? typeof Shop.applyLook : 'Shop yok',
    randomize: (typeof Shop!=='undefined') ? typeof Shop.randomize : '-',
    avatarYeni: (typeof VIEWS!=='undefined') ? /Poz ve hazır kombinler/.test(VIEWS.avatar.toString()) : '-',
    poses: typeof P19C_POSES!=='undefined' ? P19C_POSES.length : 0,
    looks: typeof P19C_LOOKS!=='undefined' ? P19C_LOOKS.length : 0,
    fx: typeof P19C_FX!=='undefined' ? P19C_FX.rate : 0
  }));
  console.log(JSON.stringify(st,null,0));
  await b.close();
})();
