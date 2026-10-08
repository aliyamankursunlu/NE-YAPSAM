const puppeteer=require('puppeteer');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage();
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  await p.waitForFunction("!!document.querySelector('#overlay.open')",{timeout:20000});
  await p.evaluate(()=>{ const o=document.querySelector('#overlay.open'); const btn=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent)); if(btn) btn.click(); });
  await new Promise(r=>setTimeout(r,600));
  const r=await p.evaluate(()=>{
    const real=GAMES.filter(x=>!x.gen);
    const steam=real.find(x=>x.p==='steam'), epic=real.find(x=>x.p==='epic'), diger=real.find(x=>x.p==='diger');
    const links=g=>{ const h=Media.gameLinks(g); const div=document.createElement('div'); div.innerHTML=h; return [...div.querySelectorAll('a')].map(a=>a.textContent+' → '+a.href.slice(0,95)); };
    return {steam:links(steam), epic:links(epic), diger:links(diger), adlar:[steam.n,epic.n,diger.n]};
  });
  console.log('STEAM oyunu:', r.adlar[0]); console.log(r.steam.join('\n'));
  console.log('\nEPIC oyunu:', r.adlar[1]); console.log(r.epic.join('\n'));
  console.log('\nTARAYICI oyunu:', r.adlar[2]); console.log(r.diger.join('\n'));
  await b.close();
})();
