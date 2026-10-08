const puppeteer=require('puppeteer');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage();
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  const r=await p.evaluate(async()=>{
    const out={};
    try{
      const j=await Price19.fetchJSON('https://www.cheapshark.com/api/1.0/games?title=' + encodeURIComponent("Baldur's Gate 3") + '&limit=5');
      out.aramaOK=Array.isArray(j)? j.length : 'dizi değil';
      out.ilk=j[0];
    }catch(e){ out.aramaHATA=String(e).slice(0,140); }
    try{
      const res=await Price19.lookup("Baldur's Gate 3");
      out.lookup={cheapest:res.cheapest, appid:res.steamAppID, deal:res.deals.length};
    }catch(e){ out.lookupHATA=String(e).slice(0,140); }
    out.appidCache=Object.keys(window.P19C_APPID||{}).length;
    return out;
  });
  console.log(JSON.stringify(r,null,1).slice(0,1200));
  await b.close();
})();
