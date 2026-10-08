const puppeteer=require('puppeteer');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage();
  p.on('pageerror',e=>console.log('PAGEERROR:',e.message));
  p.on('console',m=>{ if(m.type()==='error') console.log('CONSOLE:',m.text().slice(0,200)); });
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,3000));
  const st=await p.evaluate(()=>({
    overlay: !!document.querySelector('#overlay'),
    open: !!document.querySelector('#overlay.open'),
    total: (typeof window.POOL_TOTAL==='function')? window.POOL_TOTAL() : 'yok',
    p19c: typeof window.p19c_tl,
    looks: typeof Shop!=="undefined"? (typeof Shop.applyLook) : 'Shop yok',
    poses: typeof P19C_POSES!=='undefined'? P19C_POSES.length : 'yok',
    fx: typeof P19C_FX!=='undefined'? P19C_FX.rate : 'yok',
    avsvg: typeof avatarSVG==='function'
  }));
  console.log(JSON.stringify(st));
  await b.close();
})();
