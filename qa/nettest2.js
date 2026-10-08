const puppeteer=require('puppeteer');
(async()=>{
  const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage();
  const ducky=async(label,q)=>{ const url='https://duckduckgo.com/?q='+encodeURIComponent('\\'+q);
    try{ await page.goto(url,{waitUntil:'domcontentloaded',timeout:20000}); await new Promise(r=>setTimeout(r,5000));
      console.log(label,'→',page.url().slice(0,130),'|',(await page.title()).slice(0,50)); }
    catch(e){ console.log(label,'HATA',e.message.slice(0,60)); } };
  await ducky('ducky-spotify','site:open.spotify.com/track Mor ve Ötesi Bir Derdim Var');
  await ducky('ducky-spotify2','site:open.spotify.com Daft Punk Instant Crush');
  await ducky('ducky-steam',"site:store.steampowered.com Baldur's Gate 3");
  await ducky('ducky-epic','site:store.epicgames.com Alan Wake 2');
  await ducky('ducky-gog','site:gog.com The Witcher 3');
  // CheapShark API CORS testi (dosya sayfasından)
  await page.goto('file:///home/user/qa/cors.html',{waitUntil:'load'});
  const r=await page.evaluate(async()=>{
    const out={};
    try{ const res=await fetch('https://www.cheapshark.com/api/1.0/games?title=Baldurs%20Gate%203&limit=2');
      const j=await res.json(); out.cheapshark={ok:true,status:res.status,first:j[0]&&{id:j[0].gameID,cheapest:j[0].cheapest,price:j[0].cheapestDealID}};
    }catch(e){ out.cheapshark={ok:false,err:String(e).slice(0,120)}; }
    return out;
  });
  console.log('CORS cheapshark:',JSON.stringify(r));
  await browser.close();
})();
