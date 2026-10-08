const puppeteer=require('puppeteer');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage();
  await p.goto('file:///home/user/qa/cors.html',{waitUntil:'load'});
  const r=await p.evaluate(async()=>{
    const out={};
    const tryFetch=async(label,url)=>{ try{ const res=await fetch(url,{mode:'cors'}); const t=await res.text();
        out[label]={ok:res.ok,status:res.status,head:t.slice(0,160)}; }catch(e){ out[label]={ok:false,err:String(e).slice(0,110)}; } };
    await tryFetch('steam_appdetails_TR','https://store.steampowered.com/api/appdetails?appids=1086940&cc=tr&l=tr&filters=price_overview');
    await tryFetch('steam_storesearch_TR','https://store.steampowered.com/api/storesearch/?term=baldurs%20gate%203&cc=tr&l=tr');
    await tryFetch('cheapshark_games','https://www.cheapshark.com/api/1.0/games?title=baldurs%20gate%203&limit=1');
    await tryFetch('exchangerate','https://open.er-api.com/v6/latest/USD');
    return out;
  });
  console.log(JSON.stringify(r,null,1).slice(0,2000));
  await b.close();
})();
